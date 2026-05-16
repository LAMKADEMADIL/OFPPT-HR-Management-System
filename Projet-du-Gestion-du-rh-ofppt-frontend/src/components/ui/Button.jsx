import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-surface-100 active:scale-95 transition-all duration-150',
};

const sizes = {
  sm:  'text-xs px-3 py-1.5',
  md:  '',
  lg:  'text-base px-5 py-3',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${className} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
