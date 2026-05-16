import { X, Clock, User, MapPin, Users, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getTypeStyle, getTypeBadge, TYPES_SEANCE } from './scheduleConstants';

function SessionRow({ seance }) {
  const typeStyle = getTypeStyle(seance.type);
  const typeBadge = getTypeBadge(seance.type);
  const typeLabel = TYPES_SEANCE.find(t => t.value === seance.type)?.label || seance.type;

  return (
    <div className={`rounded-xl border p-3.5 ${typeStyle} transition-all hover:shadow-sm`}>
      {/* Header: type badge + time */}
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold ${typeBadge}`}>
          {typeLabel}
        </span>
        <div className="flex items-center gap-1 text-xs opacity-70">
          <Clock size={11} />
          <span>{seance.heureDebut} – {seance.heureFin}</span>
        </div>
      </div>

      {/* Module */}
      <p className="text-sm font-semibold leading-tight mb-2">{seance.module}</p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-xs opacity-75">
          <User size={11} /><span className="truncate">{seance.formateur}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs opacity-75">
          <Users size={11} /><span className="truncate">{seance.groupe}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs opacity-75 col-span-2">
          <MapPin size={11} /><span className="truncate">{seance.salle}</span>
        </div>
      </div>
    </div>
  );
}

export default function DayDetailPanel({ date, seances, onClose, onAddClick }) {
  if (!date) return null;

  const formatted = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const capitalised = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-surface-200 bg-surface-50">
          <div>
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-0.5">
              Séances du jour
            </p>
            <h3 className="text-base font-bold text-slate-800 font-display leading-tight">
              {capitalised}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {seances.length} séance{seances.length !== 1 ? 's' : ''} programmée{seances.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-surface-200 hover:text-slate-600 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {seances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">Aucune séance ce jour.</p>
              <button
                onClick={onAddClick}
                className="mt-3 text-sm text-primary-600 font-medium hover:underline"
              >
                + Ajouter une séance
              </button>
            </div>
          ) : (
            seances
              .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
              .map(s => <SessionRow key={s.id} seance={s} />)
          )}
        </div>

        {/* Footer */}
        {seances.length > 0 && (
          <div className="px-4 py-3 border-t border-surface-200">
            <button
              onClick={onAddClick}
              className="btn-primary w-full justify-center text-sm"
            >
              + Ajouter une séance ce jour
            </button>
          </div>
        )}
      </div>
    </>
  );
}
