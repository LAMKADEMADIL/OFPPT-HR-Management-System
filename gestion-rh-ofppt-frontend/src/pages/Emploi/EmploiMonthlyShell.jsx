/**
 * EmploiMonthlyShell — contenu de la vue mensuelle (sans MainLayout).
 * Utilisé à l'intérieur de EmploiUnifie.jsx.
 */
import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarRange, Building2, User, Filter, Plus, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import MonthlyCalendar from './MonthlyCalendar';
import DayDetailPanel from './DayDetailPanel';
import AddSessionModal from './AddSessionModal';
import { toast } from '../../components/ui/Toast';
import FilterBar from './FilterBar';
import Legend from './Legend';
import { seanceService } from '../../services/crudServices';
import { useTimetable } from '../../context/TimetableContext';

const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`card p-4 flex flex-col gap-1 border-l-4 ${color}`}>
      <p className="text-xl sm:text-2xl font-bold text-slate-800 font-display">{value}</p>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}

export default function EmploiMonthlyShell() {
  const { 
    filters, handleFilterChange, handleReset, 
    seances, setSeances, loading, 
    refreshKey, setRefreshKey, personnelMap 
  } = useTimetable();

  const today = new Date();
  const [currentDate, setCurrentDate]   = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(null);
  const [panelSeances, setPanelSeances] = useState([]);
  const [panelOpen, setPanelOpen]       = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalJour, setModalJour]       = useState(null);

  const filteredSeances = useMemo(() => {
    const month = currentDate.getMonth() + 1;
    const year  = currentDate.getFullYear();

    return seances
      .filter(s => {
        if (!s.date && !s.start_date) return false;
        const d = new Date(s.date || s.start_date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .map(s => {
        const personnel = personnelMap.matricule[s.matricule] || personnelMap.name[s.formateur?.toUpperCase()];

        return {
          ...s,
          isUnknown: !personnel && s.formateur,
          formattedFormateur: personnel 
            ? `${(personnel.nom || '').toUpperCase()} ${(personnel.prenom || '')}`
            : s.formateur
        };
      }).filter(s => {
        if (filters.etablissement && s.etablissement !== filters.etablissement) return false;
        if (filters.formateur     && s.formattedFormateur !== filters.formateur) return false;
        if (filters.groupe        && s.groupe !== filters.groupe) return false;
        if (filters.grade         && s.grade !== filters.grade) return false;
        return true;
      });
  }, [seances, currentDate, filters, personnelMap]);

  const dynamicOptions = useMemo(() => ({
    formateurs: [...new Set(seances.map(s => s.formateur))].filter(Boolean),
    salles:     [...new Set(seances.map(s => s.salle))].filter(Boolean),
    groupes:    [...new Set(seances.map(s => s.groupe))].filter(Boolean),
    modules:    [...new Set(seances.map(s => s.module))].filter(Boolean),
  }), [seances]);

  const handleDayClick = (date, daySeances) => {
    setSelectedDate(date); setPanelSeances(daySeances); setPanelOpen(true);
  };

  const handleSave = async (formData) => {
    const newSeance = {
      ...formData,
      id:   Date.now(),
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-01'),
      formateur: formData.formateur_id,
      salle:  formData.salle_id,
      groupe: formData.groupe_id,
      module: formData.module_id,
    };
    setSeances(prev => [...prev, newSeance]);
    try {
      await seanceService.create(newSeance);
      toast.success('Séance ajoutée.');
    } catch {
      toast.error('Backend indisponible, séance conservée localement.');
    }
  };

  const stats = useMemo(() => ({
    total:   filteredSeances.length,
    cours:   filteredSeances.filter(s => s.type === 'cours').length,
    tp:      filteredSeances.filter(s => s.type === 'tp').length,
    examens: filteredSeances.filter(s => s.type === 'examen').length,
  }), [filteredSeances]);

  const goPrev  = () => setCurrentDate(d => subMonths(d, 1));
  const goNext  = () => setCurrentDate(d => addMonths(d, 1));
  const goToday = () => setCurrentDate(startOfMonth(today));

  const monthLabel       = format(currentDate, 'MMMM yyyy', { locale: fr });
  const monthCapitalised = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const isCurrentMonth   = format(currentDate, 'yyyy-MM') === format(today, 'yyyy-MM');

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Séances" value={stats.total} color="border-primary-500" />
        <StatCard label="Cours" value={stats.cours} color="border-green-500" />
        <StatCard label="TP" value={stats.tp} color="border-blue-500" />
        <StatCard label="Examens" value={stats.examens} color="border-red-500" />
      </div>

      <FilterBar 
        data={seances} 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleReset} 
      />

      <div className="flex items-center justify-between mb-4">
        <Legend data={seances} />

        <div className="flex items-center gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-2 mr-4 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button onClick={goPrev} aria-label="Mois précédent"
              className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-500 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-sm font-bold text-slate-700 font-display whitespace-nowrap">{monthCapitalised}</span>
            </div>
            <button onClick={goNext} aria-label="Mois suivant"
              className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-500 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <Button onClick={() => { setModalJour(null); setPanelOpen(false); setModalOpen(true); }}>
            <Plus size={14} /> Ajouter
          </Button>
          <Button variant="secondary" onClick={() => setRefreshKey(k => k + 1)} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="card flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
            <p className="text-sm text-slate-400">Chargement du calendrier…</p>
          </div>
        </div>
      ) : (
        <MonthlyCalendar currentDate={currentDate} seances={filteredSeances}
          selectedDate={selectedDate} onDayClick={handleDayClick} />
      )}

      {panelOpen && (
        <DayDetailPanel date={selectedDate} seances={panelSeances}
          onClose={() => { setPanelOpen(false); setSelectedDate(null); }}
          onAddClick={() => { setModalJour(selectedDate?.getDay()); setPanelOpen(false); setModalOpen(true); }} />
      )}

      <AddSessionModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onSave={handleSave} initialJour={modalJour ? String(modalJour) : undefined} editData={null} options={dynamicOptions} />
    </>
  );
}
