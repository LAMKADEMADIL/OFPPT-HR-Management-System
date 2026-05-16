import { useState } from 'react';
import { Pencil, Trash2, Clock, MapPin, User, Users } from 'lucide-react';
import {
  JOURS, CRENEAUX, SLOT_HEIGHT,
  getSlotPosition, getTypeStyle, getTypeBadge, TYPES_SEANCE,
} from './scheduleConstants';

// ─────────────────────────────────────────────────────────────
// SeanceCard — une séance placée dans la grille
// ─────────────────────────────────────────────────────────────
function SeanceCard({ seance, onEdit, onDelete }) {
  const { top, height } = getSlotPosition(seance.heureDebut, seance.heureFin);
  const typeStyle = getTypeStyle(seance.type);
  const typeBadge = getTypeBadge(seance.type);
  const typeLabel = TYPES_SEANCE.find(t => t.value === seance.type)?.label || seance.type;
  const isShort = height < 56;

  return (
    <div
      className={`absolute left-1 right-1 rounded-lg border px-2 py-1 cursor-pointer group
        transition-all duration-150 hover:shadow-md hover:z-20 hover:scale-[1.01] ${typeStyle}`}
      style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }}
      onClick={() => onEdit(seance)}
    >
      {/* Type badge */}
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[10px] font-bold ${typeBadge} mb-0.5`}>
        {typeLabel}
      </div>

      {/* Module name */}
      <p className="text-xs font-semibold leading-tight truncate">{seance.module}</p>

      {!isShort && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          <span className={`flex items-center gap-1 text-[10px] truncate ${seance.isUnknown ? 'text-red-600 font-bold' : 'opacity-75'}`}>
            <User size={9} />
            {seance.formattedFormateur}
            {seance.isUnknown && <span className="ml-1 text-[8px] bg-red-100 px-1 rounded">Inconnu</span>}
          </span>
          <span className="flex items-center gap-1 text-[10px] opacity-75 truncate">
            <MapPin size={9} />{seance.salle}
          </span>
          <span className="flex items-center gap-1 text-[10px] opacity-75 truncate">
            <Users size={9} />{seance.groupe}
          </span>
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
        <button
          onClick={e => { e.stopPropagation(); onEdit(seance); }}
          className="p-1 rounded bg-white/80 hover:bg-white text-slate-600 shadow-sm"
        >
          <Pencil size={10} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(seance); }}
          className="p-1 rounded bg-white/80 hover:bg-red-100 text-red-500 shadow-sm"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* Time label on hover */}
      {!isShort && (
        <div className="absolute bottom-1 right-2 hidden group-hover:flex items-center gap-0.5 text-[9px] opacity-60">
          <Clock size={8} />
          {seance.heureDebut}–{seance.heureFin}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ConflictBadge — alerte si 2 séances se chevauchent
// ─────────────────────────────────────────────────────────────
const hasConflict = (seances) => {
  for (let i = 0; i < seances.length; i++) {
    for (let j = i + 1; j < seances.length; j++) {
      const a = seances[i], b = seances[j];
      if (a.heureDebut < b.heureFin && a.heureFin > b.heureDebut) return true;
    }
  }
  return false;
};

// ─────────────────────────────────────────────────────────────
// ScheduleCalendar — vue hebdomadaire principale
// ─────────────────────────────────────────────────────────────
export default function ScheduleCalendar({ seances = [], onAddClick, onEdit, onDelete }) {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Groupe les séances par jour
  const seancesByJour = (jour) => seances.filter(s => Number(s.jour) === jour);

  const totalHeight = CRENEAUX.length * SLOT_HEIGHT; // total grid height

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-surface-200 bg-white">
      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-200 flex-wrap">
        <span className="text-xs font-medium text-slate-500">Légende :</span>
        {TYPES_SEANCE.map(t => (
          <div key={t.value} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded ${t.color}`} />
            <span className="text-xs text-slate-600">{t.label}</span>
          </div>
        ))}
      </div>

      <div className="flex min-w-[700px]">
        {/* Time gutter */}
        <div className="w-14 flex-shrink-0 border-r border-surface-200">
          {/* Header spacer */}
          <div className="h-10 border-b border-surface-200" />
          {/* Time labels */}
          <div className="relative" style={{ height: totalHeight }}>
            {CRENEAUX.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-slate-400 font-mono leading-none"
                style={{ top: i * SLOT_HEIGHT - 5 }}
              >
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        {JOURS.map(({ key, label }) => {
          const daySeances = seancesByJour(key);
          const conflict = hasConflict(daySeances);

          return (
            <div key={key} className="flex-1 border-r border-surface-200 last:border-r-0 min-w-[100px]">
              {/* Day header */}
              <div className={`h-10 flex items-center justify-center border-b border-surface-200 relative
                ${conflict ? 'bg-red-50' : 'bg-surface-50'}`}>
                <span className="text-xs font-semibold text-slate-700">{label}</span>
                {conflict && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                    title="Conflit de salle ou de formateur détecté" />
                )}
              </div>

              {/* Grid body */}
              <div
                className="relative"
                style={{ height: totalHeight }}
                onMouseLeave={() => setHoveredSlot(null)}
              >
                {/* Half-hour lines */}
                {CRENEAUX.map((_, i) => (
                  <div
                    key={i}
                    className={`absolute inset-x-0 border-t cursor-pointer transition-colors
                      ${i % 2 === 0 ? 'border-surface-200' : 'border-dashed border-surface-100'}
                      ${hoveredSlot?.jour === key && hoveredSlot?.index === i
                        ? 'bg-primary-50/60'
                        : 'hover:bg-surface-50'}`}
                    style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                    onClick={() => onAddClick(key, CRENEAUX[i])}
                    onMouseEnter={() => setHoveredSlot({ jour: key, index: i })}
                    title={`Ajouter une séance — ${label} ${CRENEAUX[i]}`}
                  />
                ))}

                {/* Séances */}
                {daySeances.map(seance => (
                  <SeanceCard
                    key={seance.id}
                    seance={seance}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: total */}
      <div className="px-4 py-2 border-t border-surface-200 bg-surface-50 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {seances.length} séance{seances.length !== 1 ? 's' : ''} cette semaine
        </span>
        {seances.some((_, i) => hasConflict(seances.filter(s => s.jour === seances[i]?.jour))) && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            ⚠ Conflits détectés — vérifiez les salles et formateurs
          </span>
        )}
      </div>
    </div>
  );
}
