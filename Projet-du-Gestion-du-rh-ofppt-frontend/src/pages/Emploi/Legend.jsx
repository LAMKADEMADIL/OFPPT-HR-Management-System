import React, { useMemo } from 'react';

// Unified mapping for colors based on Task 2 requirements
const COLOR_MAPPING = {
  'cours':  'bg-green-500',
  'tp':     'bg-blue-500',
  'examen': 'bg-red-500',
  'exam':   'bg-red-500',
  'reunion': 'bg-slate-500',
  'stage':  'bg-emerald-500',
};

const DEFAULT_COLOR = 'bg-slate-400';

export default function Legend({ data = [] }) {
  // Extraction dynamique des types uniques
  const types = useMemo(() => {
    const uniqueTypes = [...new Set(data.map(item => item.type || item._raw?.type || 'Autre'))];
    
    return uniqueTypes.map(type => {
      const lowerType = type.toLowerCase();
      
      // Match type with mapping keys
      const matchedKey = Object.keys(COLOR_MAPPING).find(key => lowerType.includes(key));
      const colorClass = matchedKey ? COLOR_MAPPING[matchedKey] : DEFAULT_COLOR;

      return { label: type, color: colorClass };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  if (types.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 px-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Légende Dynamique</span>
      {types.map((type, idx) => (
        <div key={idx} className="flex items-center gap-2 group cursor-default">
          <div className={`w-3.5 h-3.5 rounded-full ${type.color} shadow-sm group-hover:scale-125 transition-transform`} />
          <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors capitalize">
            {type.label}
          </span>
        </div>
      ))}
    </div>
  );
}
