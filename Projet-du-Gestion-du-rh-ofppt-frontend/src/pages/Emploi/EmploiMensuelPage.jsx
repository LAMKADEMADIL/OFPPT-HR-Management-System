import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, CalendarRange,
  Building2, User, Filter, RefreshCw, Plus,
} from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import MonthlyCalendar from './MonthlyCalendar';
import DayDetailPanel from './DayDetailPanel';
import AddSessionModal from './AddSessionModal';
import scheduleService from '../../services/scheduleService';
import { generateMonthlyMock } from './monthlyMock';
import { MOCK_ETABLISSEMENTS, MOCK_FORMATEURS } from './scheduleConstants';

// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className={`card p-4 flex flex-col gap-1 border-l-4 ${color}`}>
      <p className="text-2xl font-bold text-slate-800 font-display">{value}</p>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function EmploiMensuelPage() {
  const today = new Date();

  const [currentDate, setCurrentDate]   = useState(startOfMonth(today));
  const [seances, setSeances]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshKey, setRefreshKey]     = useState(0); // increment to trigger reload
  const [selectedDate, setSelectedDate] = useState(null);
  const [panelSeances, setPanelSeances] = useState([]);
  const [panelOpen, setPanelOpen]       = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalJour, setModalJour]       = useState(null);
  const [filters, setFilters] = useState({ etablissement_id: '', formateur_id: '' });

  // ── Load data — async IIFE inside effect (avoids sync setState) ──
  useEffect(() => {
    let cancelled = false;
    const month = currentDate.getMonth() + 1;
    const year  = currentDate.getFullYear();

    (async () => {
      setLoading(true);
      try {
        const data = await scheduleService.getMonthlySchedule(month, year, filters);
        if (!cancelled) setSeances(Array.isArray(data) ? data : data?.data || []);
      } catch {
        // Backend unavailable — fall back to demo data
        if (!cancelled) setSeances(generateMonthlyMock(year, month));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentDate, filters, refreshKey]);

  // ── Navigation ─────────────────────────────────────────────
  const goPrev  = () => setCurrentDate(d => subMonths(d, 1));
  const goNext  = () => setCurrentDate(d => addMonths(d, 1));
  const goToday = () => setCurrentDate(startOfMonth(today));
  const refresh = () => setRefreshKey(k => k + 1);

  // ── Filters ────────────────────────────────────────────────
  const handleFilter = ({ target: { name, value } }) =>
    setFilters(prev => ({ ...prev, [name]: value }));

  const resetFilters = () => setFilters({ etablissement_id: '', formateur_id: '' });

  // ── Day click ──────────────────────────────────────────────
  const handleDayClick = (date, daySeances) => {
    setSelectedDate(date);
    setPanelSeances(daySeances);
    setPanelOpen(true);
  };

  // ── Add session ────────────────────────────────────────────
  const handleAddClick = (jour) => {
    setModalJour(jour ?? null);
    setPanelOpen(false);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    // Optimistic update
    const newSeance = {
      ...formData,
      id:        Date.now(),
      date:      selectedDate
        ? format(selectedDate, 'yyyy-MM-dd')
        : `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`,
      module:    `Module ${formData.module_id}`,
      formateur: MOCK_FORMATEURS.find(f => String(f.id) === String(formData.formateur_id))?.nom || 'Formateur',
      salle:     `Salle ${formData.salle_id}`,
      groupe:    `Groupe ${formData.groupe_id}`,
    };
    setSeances(prev => [...prev, newSeance]);

    try {
      await scheduleService.createSeance(formData);
      refresh(); // sync with server
    } catch {
      // Optimistic state kept — server sync will happen on next navigation
    }
  };

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   seances.length,
    cours:   seances.filter(s => s.type === 'cours').length,
    tp:      seances.filter(s => s.type === 'tp').length,
    examens: seances.filter(s => s.type === 'examen').length,
    jours:   new Set(seances.map(s => s.date)).size,
  }), [seances]);

  const monthLabel       = format(currentDate, 'MMMM yyyy', { locale: fr });
  const monthCapitalised = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const isCurrentMonth   = format(currentDate, 'yyyy-MM') === format(today, 'yyyy-MM');
  const hasActiveFilters = filters.etablissement_id || filters.formateur_id;

  return (
    <MainLayout>
      <PageHeader
        title="Vue Mensuelle"
        subtitle={`Emploi du temps — ${monthCapitalised}`}
        actions={
          <>
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </Button>
            <Button onClick={() => handleAddClick(null)}>
              <Plus size={15} />
              Ajouter une séance
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Séances ce mois"   value={stats.total}   sub={`${stats.jours} jours actifs`} color="border-primary-500" />
        <StatCard label="Cours magistraux"  value={stats.cours}   color="border-blue-400" />
        <StatCard label="Travaux Pratiques" value={stats.tp}       color="border-emerald-400" />
        <StatCard label="Examens"           value={stats.examens} color="border-red-400" />
      </div>

      {/* Navigation + Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap items-center gap-4">

          {/* Month navigator */}
          <div className="flex items-center gap-2">
            <button onClick={goPrev} aria-label="Mois précédent"
              className="p-2 rounded-xl hover:bg-surface-100 text-slate-500 hover:text-slate-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 min-w-[160px] justify-center">
              <CalendarRange size={16} className="text-primary-500 flex-shrink-0" />
              <span className="text-base font-bold text-slate-800 font-display whitespace-nowrap">
                {monthCapitalised}
              </span>
            </div>
            <button onClick={goNext} aria-label="Mois suivant"
              className="p-2 rounded-xl hover:bg-surface-100 text-slate-500 hover:text-slate-800 transition-colors">
              <ChevronRight size={18} />
            </button>
            {!isCurrentMonth && (
              <button onClick={goToday}
                className="text-xs text-primary-600 font-semibold border border-primary-200 hover:bg-primary-50 px-2.5 py-1 rounded-lg transition-colors">
                Aujourd&apos;hui
              </button>
            )}
          </div>

          <div className="h-8 w-px bg-surface-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Filter size={13} className="text-primary-500" />
            Filtres
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            {/* Établissement */}
            <div className="flex flex-col gap-0.5 min-w-[190px]">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Building2 size={10} /> Établissement
              </label>
              <select name="etablissement_id" value={filters.etablissement_id}
                onChange={handleFilter} className="input-field text-sm py-1.5">
                <option value="">Tous</option>
                {MOCK_ETABLISSEMENTS.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>

            {/* Formateur */}
            <div className="flex flex-col gap-0.5 min-w-[170px]">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <User size={10} /> Formateur
              </label>
              <select name="formateur_id" value={filters.formateur_id}
                onChange={handleFilter} className="input-field text-sm py-1.5">
                <option value="">Tous</option>
                {MOCK_FORMATEURS.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-xs text-red-500 hover:underline ml-auto">
              Réinitialiser
            </button>
          )}
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
        <MonthlyCalendar
          currentDate={currentDate}
          seances={seances}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />
      )}

      {/* Day detail panel */}
      {panelOpen && (
        <DayDetailPanel
          date={selectedDate}
          seances={panelSeances}
          onClose={() => { setPanelOpen(false); setSelectedDate(null); }}
          onAddClick={() => handleAddClick(selectedDate?.getDay())}
        />
      )}

      {/* Add session modal */}
      <AddSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialJour={modalJour ? String(modalJour) : undefined}
        editData={null}
      />
    </MainLayout>
  );
}
