import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, actions, backTo }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="p-2 rounded-xl text-slate-500 hover:bg-white hover:shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
