import { useState, useEffect, useOptimistic, useTransition, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Pencil, Trash2, Eye, ChevronDown,
  FileSpreadsheet, Download, Filter, Users, GraduationCap, Briefcase,
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PersonnelForm from '../../components/common/PersonnelForm';
import ExcelImportModal from '../../components/common/ExcelImportModal';
import { Loader } from '../../components/common/index';
import { toast } from '../../components/ui/Toast';
import { personnelService } from '../../services/crudServices';
import { exportExcel } from '../../services/ExcelService';
import { formatDate } from '../../utils/helpers';

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { key: 'all',                  label: 'Tous',                 icon: Users,         count: null },
  { key: 'administratif',        label: 'Administratifs',       icon: Briefcase,     count: null },
  { key: 'formateur_permanent',  label: 'Formateurs Permanents',icon: GraduationCap, count: null },
  { key: 'formateur_vacataire',  label: 'Formateurs Vacataires',icon: GraduationCap, count: null },
];

const GRADE_OPTIONS = [
  { value: '', label: 'Tous grades' },
  { value: 'Cadre ',            label: 'Cadre' },
  { value: 'Maitrise Principale',          label: 'Maitrise Principale' },
  { value: 'Maitrise',              label: 'Maitrise' },
  { value: 'Technicien',  label: 'Technicien' },
  { value: 'Formateur',          label: 'Formateur' },
  { value: 'Formateur Principal',label: 'Formateur Principal' },
  { value: 'Formateur Expert',   label: 'Formateur Expert' },
  { value: 'Vacataire',          label: 'Vacataire' },
];

const CATEGORIE_LABEL = {
  administratif:        'Administratif',
  formateur_permanent:  'Formateur Permanent',
  formateur_vacataire:  'Formateur Vacataire',
};
const CATEGORIE_BADGE = {
  administratif:        'badge badge-blue',
  formateur_permanent:  'badge badge-green',
  formateur_vacataire:  'badge badge-yellow',
};

const EMPTY_FORM = { categorie: '', prenom: '', nom: '', cin: '', email: '', telephone: '',
  matricule: '', poste: '', service: '', grade: '', dateNaissance: '', dateEmbauche: '',
  adresse: '', specialite: '', heuresParSemaine: '', tarifHeure: '' };

const validate = (form) => {
  const e = {};
  if (!form.categorie) e.categorie = 'Sélectionnez un type.';
  if (!form.prenom)    e.prenom    = 'Obligatoire.';
  if (!form.nom)       e.nom       = 'Obligatoire.';
  if (form.categorie === 'administratif' && !form.fonction) e.fonction = 'Obligatoire.';
  if ((form.categorie === 'formateur_permanent' || form.categorie === 'formateur_vacataire') && !form.specialite)
    e.specialite = 'Obligatoire.';
  return e;
};

const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

// ── Data mapping helpers ──────────────────────────────────────
const mapBackendToFrontend = (item) => {
  let categorie = 'administratif';
  if (item.type_personnel === 'formateur') {
    categorie = item.statut === 'vacataire' ? 'formateur_vacataire' : 'formateur_permanent';
  }
  let specialite = item.specialite || '';
  if (!specialite && item.specialites && item.specialites.length > 0) {
    specialite = item.specialites[0].nom_specialite || item.specialites[0].nom || '';
  }
  let adresse = item.adresse || item.adresse_actuelle || '';
  return { ...item, categorie, specialite, adresse };
};

const mapFrontendToBackend = (form) => {
  const payload = { ...form };
  if (form.categorie === 'administratif') {
    payload.type_personnel = 'administratif';
    payload.statut = 'permanent';
  } else {
    payload.type_personnel = 'formateur';
    payload.statut = form.categorie === 'formateur_vacataire' ? 'vacataire' : 'permanent';
  }
  return payload;
};

// ─────────────────────────────────────────────────────────────
export default function PersonnelPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Data state ────────────────────────────────────────────
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isPending, startTransition]= useTransition();

  // ── UI state ──────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState('all');
  const [search, setSearch]         = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [fonctionFilter, setFonctionFilter] = useState('');

  // ── Modal state ───────────────────────────────────────────
  const [formOpen, setFormOpen]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importOpen, setImportOpen]   = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // ── Load data ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await personnelService.getAll();
        const data = toArray(res).map(mapBackendToFrontend);
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── useOptimistic for delete ───────────────────────────────
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (current, idToRemove) => current.filter(i => i.id !== idToRemove)
  );

  // ── Filter pipeline ───────────────────────────────────────
  const filtered = useMemo(() => {
  return optimisticItems
    .filter(i => activeTab === 'all' || i.categorie === activeTab)
    .filter(i => !gradeFilter   || (i.grade    || '').toLowerCase().includes(gradeFilter.toLowerCase()))
    .filter(i => !fonctionFilter || (i.fonction || '').toLowerCase().includes(fonctionFilter.toLowerCase()))
    .filter(i => !search.trim() || [i.prenom, i.nom, i.matricule, i.cin, i.email, i.specialite, i.fonction]
      .some(v => (v || '').toLowerCase().includes(search.toLowerCase())));
  }, [optimisticItems, activeTab, gradeFilter, fonctionFilter, search]);

  // ── Tab counts ────────────────────────────────────────────
  const counts = {
    all:                   optimisticItems.length,
    administratif:         optimisticItems.filter(i => i.categorie === 'administratif').length,
    formateur_permanent:   optimisticItems.filter(i => i.categorie === 'formateur_permanent').length,
    formateur_vacataire:   optimisticItems.filter(i => i.categorie === 'formateur_vacataire').length,
  };

  // ── Unique fonctions for filter ────────────────────────────
  const fonctions = useMemo(() => 
    [...new Set(optimisticItems.map(i => i.fonction).filter(Boolean))].sort()
  , [optimisticItems]);

  // ── Form handlers ─────────────────────────────────────────
  const openCreate = (categorie = '') => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, categorie });
    setErrors({});
    setFormOpen(true);
    setShowAddMenu(false);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({ ...EMPTY_FORM, ...item });
    setErrors({});
    setFormOpen(true);
  };

  useEffect(() => {
    if (!location.state?.openCreate) return;
    openCreate(location.state.categorie || '');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    
    const payload = mapFrontendToBackend(form);
    
    try {
      if (editTarget) {
        const res = await personnelService.update(editTarget.id, payload);
        const updated = mapBackendToFrontend(res?.data || res);
        setItems(prev => prev.map(i => i.id === editTarget.id ? updated : i));
        toast.success('Personnel mis à jour avec succès.');
      } else {
        const res = await personnelService.create(payload);
        const created = mapBackendToFrontend(res?.data || res);
        setItems(prev => [...prev, created]);
        toast.success('Personnel ajouté avec succès.');
      }
      setFormOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      toast.error(msg);
      if (err.response?.data?.errors) {
        // Map backend errors (which could be arrays) to string
        const mappedErrors = {};
        Object.entries(err.response.data.errors).forEach(([key, val]) => {
          mappedErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(mappedErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      removeOptimistic(deleteTarget.id);
      setDeleteTarget(null);
      try {
        await personnelService.remove(deleteTarget.id);
        setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
        toast.success('Personnel supprimé.');
      } catch {
        const res = await personnelService.getAll();
        setItems(toArray(res));
        toast.error('Erreur lors de la suppression.');
      }
    });
  };

  // ── Excel import ──────────────────────────────────────────
  const handleImport = async (rows) => {
    let count = 0;
    for (const row of rows) {
      const cat = activeTab !== 'all' ? activeTab : row.categorie || 'administratif';
      const payload = mapFrontendToBackend({ ...row, categorie: cat });
      const res = await personnelService.create(payload);
      setItems(prev => [...prev, mapBackendToFrontend(res?.data || res)]);
      count++;
    }
    toast.success(`${count} enregistrement${count > 1 ? 's' : ''} importé${count > 1 ? 's' : ''}.`);
  };

  const handleExport = () => {
    const schema = activeTab === 'all' ? 'administratif'
      : activeTab === 'formateur_permanent' ? 'formateur_permanent'
      : activeTab === 'formateur_vacataire' ? 'formateur_vacataire'
      : 'administratif';
    exportExcel(filtered, schema, `personnel_${activeTab}_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.info(`Export de ${filtered.length} enregistrement(s) lancé.`);
  };

  // ── Table columns ─────────────────────────────────────────
  const COLUMNS = [
    { key: 'matricule',  header: 'Matricule', render: v => <span className="font-mono text-xs text-slate-500">{v || '—'}</span> },
    { key: 'prenom',     header: 'Prénom' },
    { key: 'nom',        header: 'Nom',  render: v => <span className="font-semibold">{v}</span> },
    {
      key: 'categorie', header: 'Type',
      render: v => <span className={CATEGORIE_BADGE[v] || 'badge badge-gray'}>{CATEGORIE_LABEL[v] || v}</span>,
    },
    {
      key: '_detail', header: 'Fonction / Spécialité',
      render: (_, row) => <span className="text-xs text-slate-500">{row.fonction || row.specialite || '—'}</span>,
    },
    {
      key: 'grade', header: 'Grade',
      render: v => v ? <span className="badge badge-gray">{v}</span> : '—',
    },
    { key: 'dateEmbauche', header: 'Embauche', render: v => formatDate(v) },
    {
      key: '_actions', header: 'Actions', width: '110px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/personnels/${row.id}`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Voir">
            <Eye size={14} />
          </button>
          <button onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Modifier">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Gestion du Personnel"
        subtitle={`${counts.all} agents — ${counts.administratif} administratifs · ${counts.formateur_permanent} formateurs permanents · ${counts.formateur_vacataire} vacataires`}
        actions={
          <div className="flex items-center gap-2">
            {/* Export */}
            <Button variant="secondary" onClick={handleExport}>
              <Download size={15} /> Exporter
            </Button>

            {/* Import */}
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet size={15} /> Importer
            </Button>

            {/* Add dropdown */}
            <div className="relative">
              <Button onClick={() => setShowAddMenu(m => !m)}>
                <Plus size={15} /> Ajouter <ChevronDown size={13} />
              </Button>
              {showAddMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-card-hover border border-surface-200 z-30 py-1">
                  {[
                    { key: 'administratif',       label: 'Administratif',         icon: '🏢' },
                    { key: 'formateur_permanent',  label: 'Formateur Permanent',   icon: '🎓' },
                    { key: 'formateur_vacataire',  label: 'Formateur Vacataire',   icon: '⏱' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => openCreate(opt.key)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${activeTab === key
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'}`}
          >
            <Icon size={15} />
            {label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === key ? 'bg-white/20 text-white' : 'bg-surface-100 text-slate-500'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filter bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input type="search" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
        </div>

        <Select name="grade" value={gradeFilter}
          onChange={e => setGradeFilter(e.target.value)}
          options={GRADE_OPTIONS} className="min-w-[160px]" />

        {fonctions.length > 0 && (
          <select value={fonctionFilter} onChange={e => setFonctionFilter(e.target.value)}
            className="input-field min-w-[160px] text-sm py-2">
            <option value="">Toutes fonctions</option>
            {fonctions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {(search || gradeFilter || fonctionFilter) && (
          <button onClick={() => { setSearch(''); setGradeFilter(''); setFonctionFilter(''); }}
            className="text-xs text-red-500 hover:underline">Réinitialiser</button>
        )}

        <span className="ml-auto text-xs text-slate-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <Card padding={false}>
        {loading ? <Loader /> : (
          <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            <Table data={filtered} columns={COLUMNS} emptyMessage="Aucun personnel trouvé." />
          </div>
        )}
      </Card>

      {/* ── Add/Edit modal ─────────────────────────────────────── */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}
        title={editTarget ? 'Modifier le personnel' : 'Ajouter un membre du personnel'} size="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PersonnelForm form={form} errors={errors} handleChange={handleChange} isEdit={!!editTarget} />
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" loading={saving}>{editTarget ? 'Mettre à jour' : 'Enregistrer'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Excel import ───────────────────────────────────────── */}
      <ExcelImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        schemaType={activeTab !== 'all' ? activeTab : 'administratif'}
        entityLabel="le personnel"
        onImport={handleImport}
      />

      {/* ── Delete confirm ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isPending}
        title="Supprimer ce membre du personnel"
        message={deleteTarget ? `Supprimer ${deleteTarget.prenom} ${deleteTarget.nom} ? Cette action est irréversible.` : ''}
      />

      {/* Close dropdown on outside click */}
      {showAddMenu && <div className="fixed inset-0 z-20" onClick={() => setShowAddMenu(false)} />}
    </MainLayout>
  );
}

// Placeholder exports to prevent routing errors in AppRoutes.jsx
export function ShowPersonnel() {
  return <div>Détails du personnel (Composant à implémenter)</div>;
}

export function EditPersonnel() {
  return <div>Modification du personnel (Composant à implémenter)</div>;
}
