/* global CustomEvent */
import { useState } from 'react';
import { CalendarDays, CalendarRange, FileSpreadsheet } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import PlanningExcelImportButton from '../../components/ui/PlanningExcelImportButton';
import { toast } from '../../components/ui/Toast';
import api from '../../services/api';

// Lazy-import both views to keep bundle split
import EmploiWeeklyShell from './EmploiWeeklyShell';
import EmploiMonthlyShell from './EmploiMonthlyShell';
import { TimetableProvider } from '../../context/TimetableContext';

const VIEWS = [
  { key: 'hebdomadaire', label: 'Vue Hebdomadaire', icon: CalendarDays },
  { key: 'mensuel',      label: 'Vue Mensuelle',    icon: CalendarRange },
];

export default function EmploiUnifie() {
  return (
    <TimetableProvider>
      <EmploiUnifieContent />
    </TimetableProvider>
  );
}

function EmploiUnifieContent() {
  const [view, setView]           = useState('hebdomadaire');
  const [importOpen, setImportOpen] = useState(false);

  const handleExcelImport = async (rows, headers) => {
    toast.info("Importation et synchronisation en cours...");
    try {
      const response = await api.post('/seances/import', { 
        seances: rows,
        debug_headers: headers 
      });
      toast.success(response.data?.message || "Séances importées avec succès.");
      window.dispatchEvent(new CustomEvent('seances-updated'));
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(`Erreur serveur: ${errorMsg}`);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Emploi du Temps"
        subtitle="Planification hebdomadaire et mensuelle"
        actions={
          <PlanningExcelImportButton onImport={handleExcelImport} />
        }
      />

      {/* View switcher tabs */}
      <div className="flex items-center gap-2 mb-5 p-1 bg-surface-100 rounded-xl w-fit">
        {VIEWS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${view === key
                ? 'bg-white text-primary-700 shadow-card'
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Active view */}
      <div className="animate-fadeIn" key={view}>
        {view === 'hebdomadaire'
          ? <EmploiWeeklyShell />
          : <EmploiMonthlyShell />
        }
      </div>

    </MainLayout>
  );
}
