import { useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: { icon: CheckCircle2, cls: 'text-emerald-500' },
  error:   { icon: XCircle,      cls: 'text-red-500' },
  warning: { icon: AlertTriangle,cls: 'text-amber-500' },
  info:    { icon: Info,         cls: 'text-blue-500' },
};
const BG = {
  success: 'border-emerald-200 bg-emerald-50',
  error:   'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info:    'border-blue-200 bg-blue-50',
};

function ToastItem({ toast: t, onDismiss }) {
  const { icon: Icon, cls } = ICONS[t.type] || ICONS.info;
  const bg = BG[t.type] || BG.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), t.duration || 4000);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onDismiss]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full animate-fadeIn ${bg}`}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${cls}`} />
      <div className="flex-1 min-w-0">
        {t.title && <p className="text-sm font-semibold text-slate-800">{t.title}</p>}
        <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap">{t.message}</p>
      </div>
      <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Imperative API backed by a shared ref ─────────────────────
const toastRef = { current: null };
let idCounter = 0;

const push = (message, type = 'info', options = {}) => {
  if (!toastRef.current) return;
  const id = ++idCounter;
  toastRef.current(prev => [...prev, { id, message, type, ...options }]);
};

export const toast = (message, options) => push(message, 'info', options);
toast.success = (msg, opts) => push(msg, 'success', opts);
toast.error   = (msg, opts) => push(msg, 'error',   opts);
toast.warning = (msg, opts) => push(msg, 'warning', opts);
toast.info    = (msg, opts) => push(msg, 'info',    opts);

// ── Provider ──────────────────────────────────────────────────
export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  const setRef = useRef(setToasts);

  useEffect(() => {
    setRef.current = setToasts;
    toastRef.current = (updater) => setRef.current(updater);
    return () => { toastRef.current = null; };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
    </div>
  );
}
