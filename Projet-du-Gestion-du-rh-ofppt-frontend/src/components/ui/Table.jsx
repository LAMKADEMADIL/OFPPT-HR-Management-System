export default function Table({ data = [], columns = [], loading = false, emptyMessage = 'Aucune donnée disponible.' }) {
  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-surface-200">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-surface-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-surface-200 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-surface-200">
      <table className="w-full text-sm">
        <thead className="bg-surface-50 border-b border-surface-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
