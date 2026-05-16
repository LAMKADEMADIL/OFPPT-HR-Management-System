import { Loader2 } from 'lucide-react';

export function Loader({ text = 'Chargement…', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary-600" />
          <p className="text-sm text-slate-500 font-medium">{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-primary-500" />
        <p className="text-sm text-slate-400">{text}</p>
      </div>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-red-600">Une erreur est survenue</p>
        <p className="text-xs text-slate-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">Réessayer</button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'Aucune donnée trouvée.', icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center text-2xl">
        {icon || '📭'}
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      {action && action}
    </div>
  );
}
