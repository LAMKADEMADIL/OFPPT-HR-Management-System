export default function Card({ children, title, footer, className = '', padding = true }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-surface-200">
          {typeof title === 'string'
            ? <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            : title}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
