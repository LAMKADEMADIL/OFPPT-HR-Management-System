export default function Input({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  hint,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`input-field ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''} ${disabled ? 'bg-surface-50 cursor-not-allowed text-slate-400' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
