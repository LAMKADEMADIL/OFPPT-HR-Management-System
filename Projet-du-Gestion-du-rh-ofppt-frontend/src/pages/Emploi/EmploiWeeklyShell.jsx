/**
 * EmploiWeeklyShell — contenu de la vue hebdomadaire (sans MainLayout).
 * Utilisé à l'intérieur de EmploiUnifie.jsx.
 */
import { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, AlertTriangle, Building2, User, Users, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import ScheduleCalendar from './ScheduleCalendar';
import AddSessionModal from './AddSessionModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from '../../components/ui/Toast';
import FilterBar from './FilterBar';
import Legend from './Legend';
import { seanceService } from '../../services/crudServices';
import { useTimetable } from '../../context/TimetableContext';
import {
  JOURS,
} from './scheduleConstants';

const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

function StatPill({ label, value, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${color} text-xs font-semibold`}>
      <span>{value}</span>
      <span className="font-normal opacity-75">{label}</span>
    </div>
  );
}

export default function EmploiWeeklyShell() {
  const { 
    filters, handleFilterChange, handleReset, 
    seances, setSeances, loading: loadingData, 
    refreshKey, setRefreshKey, personnelMap 
  } = useTimetable();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editData, setEditData]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [clickedJour, setClickedJour]   = useState(null);
  const [clickedHeure, setClickedHeure] = useState(null);

  const filtered = useMemo(() => {
    return seances.map(s => {
      // Data formatting and enrichment using O(1) personnelMap
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
  }, [seances, filters, personnelMap]);

  const dynamicOptions = useMemo(() => ({
    formateurs: [...new Set(seances.map(s => s.formateur))].filter(Boolean),
    salles:     [...new Set(seances.map(s => s.salle))].filter(Boolean),
    groupes:    [...new Set(seances.map(s => s.groupe))].filter(Boolean),
    modules:    [...new Set(seances.map(s => s.module))].filter(Boolean),
  }), [seances]);

  const handleAddClick = (jour, heure) => {
    setEditData(null); setClickedJour(jour); setClickedHeure(heure); setModalOpen(true);
  };

  const handleEdit = (seance) => {
    setEditData(seance); setClickedJour(null); setClickedHeure(null); setModalOpen(true);
  };

  const handleSave = async (formData, id) => {
    const enriched  = {
      ...formData,
      jour:       Number(formData.jour),
      // En mode dynamique, ces champs sont déjà textuels dans le formulaire
      formateur:  formData.formateur_id,
      salle:      formData.salle_id,
      groupe:     formData.groupe_id,
      module:     formData.module_id,
    };
    try {
      if (id) {
        const res = await seanceService.update(id, enriched);
        setSeances(prev => prev.map(s => s.id === id ? (res?.data || res || { ...enriched, id }) : s));
        toast.success('Séance mise à jour.');
      } else {
        const res = await seanceService.create(enriched);
        setSeances(prev => [...prev, res?.data || res || enriched]);
        toast.success('Séance ajoutée.');
      }
    } catch {
      if (id) {
        setSeances(prev => prev.map(s => s.id === id ? { ...enriched, id } : s));
      } else {
        setSeances(prev => [...prev, { ...enriched, id: Date.now() }]);
      }
      toast.error('Backend indisponible, modification conservée localement.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await seanceService.remove(deleteTarget.id);
      setSeances(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success('Séance supprimée.');
    } catch {
      setSeances(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.error('Backend indisponible, suppression appliquée localement.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const nbCours   = filtered.filter(s => s.type === 'cours').length;
  const nbTP      = filtered.filter(s => s.type === 'tp').length;
  const nbExamens = filtered.filter(s => s.type === 'examen').length;

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <StatPill label="Séances" value={filtered.length} color="bg-primary-50 text-primary-700" />
        <StatPill label="Cours" value={nbCours} color="bg-green-50 text-green-700" />
        <StatPill label="TP" value={nbTP} color="bg-blue-50 text-blue-700" />
        <StatPill label="Examens" value={nbExamens} color="bg-red-50 text-red-700" />
      </div>

      <FilterBar 
        data={seances} 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleReset} 
      />

      <div className="flex items-center justify-between mb-2">
        <Legend data={seances} />
        
        <div className="flex items-center gap-2 mb-4">
          <Button onClick={() => { setEditData(null); setModalOpen(true); }}>
            <Plus size={14} /> Ajouter une séance
          </Button>
          <Button variant="secondary" onClick={() => setRefreshKey(k => k + 1)} disabled={loadingData}>
            <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Conflict banner */}
      {filtered.some((s, i, arr) =>
        arr.some((s2, j) => j !== i && s.jour === s2.jour &&
          s.formateur === s2.formateur &&
          s.heureDebut < s2.heureFin && s.heureFin > s2.heureDebut)
      ) && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-700">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span><strong>Attention :</strong> Des conflits ont été détectés. Vérifiez les colonnes marquées d&apos;un point rouge.</span>
        </div>
      )}

      <ScheduleCalendar seances={filtered} onAddClick={handleAddClick} onEdit={handleEdit} onDelete={setDeleteTarget} />

      <AddSessionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave}
        initialJour={clickedJour} initialHeure={clickedHeure} editData={editData} options={dynamicOptions} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm} loading={deleting}
        title="Supprimer la séance"
        message={deleteTarget
          ? `Supprimer "${deleteTarget.module}" du ${['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][deleteTarget.jour]} ?`
          : ''}
      />
    </>
  );
}
