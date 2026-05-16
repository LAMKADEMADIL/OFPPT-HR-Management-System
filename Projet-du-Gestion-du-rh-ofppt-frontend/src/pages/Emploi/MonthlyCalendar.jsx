import { useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, format, isSameDay,
} from 'date-fns';

import { getTypeBadge, TYPES_SEANCE } from './scheduleConstants';

// ── Constants ────────────────────────────────────────────────
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MAX_VISIBLE = 3; // max séances per cell before "+ more"

// ── Mini seance chip ─────────────────────────────────────────
function SeanceChip({ seance }) {
  const bg = getTypeBadge(seance.type);
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[10px] font-medium truncate ${bg} leading-tight`}>
      <span className="flex-shrink-0 font-bold">{seance.heureDebut}</span>
      <span className="truncate opacity-90">{seance.module}</span>
    </div>
  );
}

// ── Day cell ─────────────────────────────────────────────────
function DayCell({ date, seances, isCurrentMonth, isSelected, onClick }) {
  const today        = isToday(date);
  const overflow     = seances.length - MAX_VISIBLE;
  const visible      = seances.slice(0, MAX_VISIBLE).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  const hasExamen    = seances.some(s => s.type === 'examen');

  return (
    <div
      onClick={onClick}
      className={`
        min-h-[110px] p-1.5 flex flex-col gap-0.5 cursor-pointer
        border-b border-r border-surface-200 transition-all duration-100
        ${!isCurrentMonth ? 'bg-surface-50/60' : 'bg-white hover:bg-primary-50/30'}
        ${isSelected ? 'ring-2 ring-inset ring-primary-400 bg-primary-50/40' : ''}
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={`
            inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold leading-none
            ${today
              ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/40'
              : isCurrentMonth
                ? 'text-slate-700'
                : 'text-slate-300'
            }
          `}
        >
          {format(date, 'd')}
        </span>

        {/* Examen marker */}
        {hasExamen && (
          <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 rounded border border-red-200">
            EXAM
          </span>
        )}
      </div>

      {/* Séance chips */}
      <div className="flex flex-col gap-0.5 flex-1">
        {visible.map(s => (
          <SeanceChip key={s.id} seance={s} />
        ))}

        {overflow > 0 && (
          <div className="text-[10px] text-primary-600 font-semibold px-1 hover:underline">
            +{overflow} de plus…
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MonthlyCalendar
// ─────────────────────────────────────────────────────────────
export default function MonthlyCalendar({ currentDate, seances, selectedDate, onDayClick }) {

  // Build the 6-row × 7-col grid (Mon → Sun)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd   = endOfMonth(currentDate);
    const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const gridEnd    = endOfWeek(monthEnd,   { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  // Index seances by date string "YYYY-MM-DD" for O(1) lookup
  const seancesByDate = useMemo(() => {
    const map = {};
    seances.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [seances]);

  const getDaySeances = (date) =>
    seancesByDate[format(date, 'yyyy-MM-dd')] || [];

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-surface-200 bg-white">
      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-200 flex-wrap">
        <span className="text-xs font-medium text-slate-500">Type :</span>
        {TYPES_SEANCE.map(t => (
          <div key={t.value} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded ${t.color}`} />
            <span className="text-xs text-slate-600">{t.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-400 italic">
          Cliquer sur un jour pour voir le détail
        </span>
      </div>

      <div className="min-w-[640px]">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-surface-200">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-xs font-semibold uppercase tracking-wide
                ${i === 6 ? 'text-slate-300' : 'text-slate-500'}
                border-r border-surface-200 last:border-r-0`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, i) => {
            const daySeances    = getDaySeances(date);
            const inMonth       = isSameMonth(date, currentDate);
            const isSelected    = selectedDate && isSameDay(date, selectedDate);
            const isLastInRow   = (i + 1) % 7 === 0;

            return (
              <div
                key={date.toISOString()}
                className={`${isLastInRow ? '' : 'border-r border-surface-200'}`}
              >
                <DayCell
                  date={date}
                  seances={daySeances}
                  isCurrentMonth={inMonth}
                  isSelected={isSelected}
                  onClick={() => onDayClick(date, daySeances)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
