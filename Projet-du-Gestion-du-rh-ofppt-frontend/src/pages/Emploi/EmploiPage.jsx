import { useState, useCallback, useEffect } from 'react';
import { Plus, RefreshCw, AlertTriangle, Building2, User, Users, Filter } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ScheduleCalendar from './ScheduleCalendar';
import AddSessionModal from './AddSessionModal';
import PlanningExcelImportButton from '../../components/ui/PlanningExcelImportButton';
import api from '../../services/api';
import { toast } from '../../components/ui/Toast';
import {
  MOCK_ETABLISSEMENTS, MOCK_FORMATEURS, MOCK_GROUPES,
} from './scheduleConstants';

const fetchSeances = async () => {
  try {
    const response = await api.get('/seances');
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    // Map new database schema to calendar format
    return data.map(s => {
      const d = new Date(s.start_date);
      return {
        id: s.id,
        jour: d.getDay() || 1,
        heureDebut: '08:00',
        heureFin: '12:00',
        type: 'cours',
        module: s.type || s.assignment || 'Affectation',
        formateur: s.full_name || 'Personnel',
        salle: s.grade || 'Salle',
        groupe: s.matricule || 'Mle',
        _raw: s
      };
    });
  } catch (err) {
    console.error("Failed to fetch seances", err);
    return [];
  }
};

// ── Stat mini-badge ──────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${color} text-xs font-semibold`}>
    <span>{value}</span>
    <span className="font-normal opacity-75">{label}</span>
  </div>
);

export default function EmploiPage() {
  // ── State ─────────────────────────────────────────────────
  const [seances, setSeances]               = useState([]);
  const [loadingData, setLoadingData]       = useState(false);
  const [modalOpen, setModalOpen]           = useState(false);
  const [editData, setEditData]             = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleting, setDeleting]             = useState(false);
  const [clickedJour, setClickedJour]       = useState(null);
  const [clickedHeure, setClickedHeure]     = useState(null);
  
  useEffect(() => {
    handleRefresh();
  }, []);

  // ── Filtres ───────────────────────────────────────────────
  const [filters, setFilters] = useState({
    etablissement_id: '',
    formateur_id:     '',
    groupe_id:        '',
  });

  const handleFilterChange = useCallback(async ({ target: { name, value } }) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setLoadingData(true);
    const data = await fetchSeances(newFilters);
    setSeances(data);
    setLoadingData(false);
  }, [filters]);

  const handleRefresh = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchSeances();
    setSeances(data);
    setLoadingData(false);
  }, []);

  const handleImport = (newData) => {
    // 1. Update UI immediately (Optimistic Update)
    const mapped = newData.map((row, index) => {
      const start = row.date_debut || row['date de début'];
      const d = start ? new Date(start) : new Date();
      return {
        id: `temp-${Date.now()}-${index}`,
        jour: d.getDay() || 1,
        heureDebut: '08:00',
        heureFin: '12:00',
        type: 'cours',
        module: row.type_conge || row['droit 2025'] || row.affectation || 'Imported',
        formateur: row.nom_prenom || row.nom || 'Personnel',
        salle: row.grade || 'Salle',
        groupe: row.mle || row.matricule || 'Mle',
      };
    });
    
    setSeances(mapped);
    toast.info("Interface mise à jour, synchronisation serveur en cours...");

    // 2. Sync with Backend
    api.post('/seances/import', { seances: newData })
      .then(response => {
        toast.success(response.data?.message || "Synchronisation serveur réussie");
        handleRefresh(); // Fetch real IDs
      })
      .catch(err => {
        toast.error("Erreur serveur, l'import a échoué.");
      });
  };

  // ── Open modal on slot click ──────────────────────────────
  const handleAddClick = (jour, heure) => {
    setEditData(null);
    setClickedJour(jour);
    setClickedHeure(heure);
    setModalOpen(true);
  };

  // ── Edit existing séance ──────────────────────────────────
  const handleEdit = (seance) => {
    setEditData(seance);
    setClickedJour(null);
    setClickedHeure(null);
    setModalOpen(true);
  };

  // ── Save (create or update) ───────────────────────────────
  const handleSave = async (formData, id) => {
    // Resolve display names from mock data (backend would return full objects)
    const formateur = MOCK_FORMATEURS.find(f => String(f.id) === String(formData.formateur_id));
    // salle resolved server-side
    const groupe    = MOCK_GROUPES.find(g => String(g.id) === String(formData.groupe_id));

    // Try backend first; fall back to local state
    try {
      if (id) {
        await scheduleService.updateSeance(id, formData);
      } else {
        await scheduleService.createSeance(formData);
      }
      await handleRefresh();
    } catch {
      // Offline mode: update local state directly
      const enriched = {
        ...formData,
        id:         id || Date.now(),
        jour:       Number(formData.jour),
        formateur:  formateur?.nom || 'Formateur',
        salle:      `Salle ${formData.salle_id}`,
        groupe:     groupe?.nom || 'Groupe',
        module:     document.querySelector(`[name="module_id"] option[value="${formData.module_id}"]`)?.textContent
                    || `Module ${formData.module_id}`,
      };
      if (id) {
        setSeances(prev => prev.map(s => s.id === id ? enriched : s));
      } else {
        setSeances(prev => [...prev, enriched]);
      }
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await scheduleService.deleteSeance(deleteTarget.id);
      await handleRefresh();
    } catch {
      setSeances(prev => prev.filter(s => s.id !== deleteTarget.id));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Stats summary ─────────────────────────────────────────
  const nbCours   = seances.filter(s => s.type === 'cours').length;
  const nbTP      = seances.filter(s => s.type === 'tp').length;
  const nbExamens = seances.filter(s => s.type === 'examen').length;

  const etablissementOpts = MOCK_ETABLISSEMENTS.map(e => ({ value: String(e.id), label: e.nom }));
  const formateurOpts     = MOCK_FORMATEURS.map(f => ({ value: String(f.id), label: f.nom }));
  const groupeOpts        = MOCK_GROUPES.map(g => ({ value: String(g.id), label: g.nom }));

  return (
    <MainLayout>
      <PageHeader
        title="Emploi du Temps"
        subtitle="Vue hebdomadaire — Lundi au Samedi"
        actions={
          <>
            <PlanningExcelImportButton onImport={handleImport} />
            <Button variant="secondary" onClick={handleRefresh} disabled={loadingData}>
              <RefreshCw size={15} className={loadingData ? 'animate-spin' : ''} />
              Actualiser
            </Button>
            <Button onClick={() => { setEditData(null); setClickedJour(null); setClickedHeure(null); setModalOpen(true); }}>
              <Plus size={15} />
              Ajouter une séance
            </Button>
          </>
        }
      />
      
      {loadingData && seances.length === 0 && (
         <div className="flex justify-center p-8 text-slate-500">Chargement des données...</div>
      )}
      
      {!loadingData && seances.length === 0 && (
         <div className="flex justify-center p-8 text-slate-500 bg-slate-50 rounded-xl mb-4 border border-dashed border-slate-300">
           Aucune séance trouvée. En attente d'import.
         </div>
      )}

      {/* ── Filtres ─────────────────────────────────────────── */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 flex-shrink-0">
            <Filter size={15} className="text-primary-500" />
            Filtres
          </div>

          {/* Établissement */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Building2 size={11} /> Établissement
            </label>
            <select
              name="etablissement_id"
              value={filters.etablissement_id}
              onChange={handleFilterChange}
              className="input-field text-sm py-2"
            >
              <option value="">Tous les établissements</option>
              {etablissementOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Formateur */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <User size={11} /> Formateur
            </label>
            <select
              name="formateur_id"
              value={filters.formateur_id}
              onChange={handleFilterChange}
              className="input-field text-sm py-2"
            >
              <option value="">Tous les formateurs</option>
              {formateurOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Groupe */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Users size={11} /> Groupe
            </label>
            <select
              name="groupe_id"
              value={filters.groupe_id}
              onChange={handleFilterChange}
              className="input-field text-sm py-2"
            >
              <option value="">Tous les groupes</option>
              {groupeOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Reset */}
          {(filters.etablissement_id || filters.formateur_id || filters.groupe_id) && (
            <button
              onClick={() => {
                setFilters({ etablissement_id: '', formateur_id: '', groupe_id: '' });
                handleRefresh();
              }}
              className="text-xs text-primary-600 hover:underline mt-3"
            >
              Réinitialiser
            </button>
          )}

          {/* Stats */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <StatPill label="Cours"   value={nbCours}   color="bg-blue-50 text-blue-700" />
            <StatPill label="TP"      value={nbTP}      color="bg-emerald-50 text-emerald-700" />
            <StatPill label="Examens" value={nbExamens} color="bg-red-50 text-red-700" />
          </div>
        </div>
      </div>

      {/* ── Conflict warning banner ──────────────────────────── */}
      {seances.some((s, i, arr) =>
        arr.some((s2, j) => j !== i && s.jour === s2.jour &&
          s.formateur === s2.formateur &&
          s.heureDebut < s2.heureFin && s.heureFin > s2.heureDebut)
      ) && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-700">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>
            <strong>Attention :</strong> Des conflits ont été détectés (formateur double-réservé).
            Les colonnes marquées d&apos;un point rouge nécessitent une vérification.
          </span>
        </div>
      )}

      {/* ── Calendar ─────────────────────────────────────────── */}
      <ScheduleCalendar
        seances={seances}
        onAddClick={handleAddClick}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* ── Modals ───────────────────────────────────────────── */}
      <AddSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialJour={clickedJour}
        initialHeure={clickedHeure}
        editData={editData}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Supprimer la séance"
        message={deleteTarget
          ? `Supprimer "${deleteTarget.module}" du ${
              ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][deleteTarget.jour]
            } (${deleteTarget.heureDebut}–${deleteTarget.heureFin}) ?`
          : ''}
      />
    </MainLayout>
  );
}
