import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Pencil, Trash2, FileSpreadsheet, Download } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PlanningExcelImportButton from '../../components/ui/PlanningExcelImportButton';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ExcelImportModal from '../../components/common/ExcelImportModal';
import { Loader } from '../../components/common/index';
import api from '../../services/api';
import { toast } from '../../components/ui/Toast';
import { congeService, personnelService } from '../../services/crudServices';
import { exportExcel } from '../../services/ExcelService';
import { formatDate, daysBetween } from '../../utils/helpers';

const STATUT_STYLES = {
  en_attente: 'badge badge-yellow',
  approuvé:   'badge badge-green',
  refusé:     'badge badge-red',
};
const TYPES_CONGE = [
  { value: 'Congé Annuel',       label: 'Congé Annuel' },
  { value: 'Congé Maladie',      label: 'Congé Maladie' },
  { value: 'Congé Maternité',    label: 'Congé Maternité' },
  { value: 'Congé Exceptionnel', label: 'Congé Exceptionnel' },
  { value: 'Congé Sans Solde',   label: 'Congé Sans Solde' },
];
const STATUTS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'approuvé',   label: 'Approuvé' },
  { value: 'refusé',     label: 'Refusé' },
];
const EMPTY = { idPersonnel: '', type_conge: 'Congé Annuel', date_debut: '', date_fin: '', motif: '', statut: 'en_attente' };
const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

export default function CongesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems]             = useState([]);
  const [personnels, setPersonnels]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isPending, startTransition]  = useTransition();
  const [formOpen, setFormOpen]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importOpen, setImportOpen]   = useState(false);

  // Filters
  const [search, setSearch]           = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [congRes, persRes] = await Promise.all([
          congeService.getAll(),
          personnelService.getAll({ per_page: 1000 })
        ]);
        if (!cancelled) {
          setItems(toArray(congRes));
          setPersonnels(toArray(persRes));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [optimisticItems, removeOptimistic] = useOptimistic(
    items, (current, id) => current.filter(i => i.id !== id)
  );

  const filtered = optimisticItems
    .filter(i => !search       || (i.employe || '').toLowerCase().includes(search.toLowerCase()))
    .filter(i => !statutFilter || i.statut === statutFilter)
    .filter(i => !typeFilter   || i.type_conge === typeFilter)
    .filter(i => !dateFrom     || i.date_debut >= dateFrom)
    .filter(i => !dateTo       || i.date_fin   <= dateTo);

  const stats = {
    total:     optimisticItems.length,
    attente:   optimisticItems.filter(i => i.statut === 'en_attente').length,
    approuve:  optimisticItems.filter(i => i.statut === 'approuvé').length,
    refuse:    optimisticItems.filter(i => i.statut === 'refusé').length,
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setErrors({}); setFormOpen(true); };
  const openEdit   = (item) => { 
    setEditTarget(item); 
    setForm({ 
      idPersonnel: item.idPersonnel, 
      type_conge: item.type_conge, 
      date_debut: item.date_debut, 
      date_fin: item.date_fin, 
      motif: item.motif || '', 
      statut: item.statut || 'en_attente' 
    }); 
    setErrors({}); 
    setFormOpen(true); 
  };

  useEffect(() => {
    if (!location.state?.openCreate) return;
    openCreate();
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (f) => {
    const e = {};
    if (!f.idPersonnel) e.idPersonnel = 'Sélectionnez un employé.';
    if (!f.type_conge)  e.type_conge  = 'Obligatoire.';
    if (!f.date_debut)  e.date_debut  = 'Obligatoire.';
    if (!f.date_fin)    e.date_fin    = 'Obligatoire.';
    if (f.date_debut && f.date_fin && f.date_debut > f.date_fin)
      e.date_fin = 'La date de fin doit être après la date de début.';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const res = await congeService.update(editTarget.id, form);
        setItems(prev => prev.map(i => i.id === editTarget.id ? (res?.data || res) : i));
        toast.success('Congé mis à jour.');
      } else {
        const res = await congeService.create(form);
        setItems(prev => [...prev, res?.data || res]);
        toast.success('Demande de congé créée.');
      }
      setFormOpen(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
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
        await congeService.remove(deleteTarget.id);
        setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
        toast.success('Congé supprimé.');
      } catch {
        const res = await congeService.getAll();
        setItems(toArray(res));
        toast.error('Erreur lors de la suppression.');
      }
    });
  };

  const handleImport = async (rows) => {
    let count = 0;
    for (const row of rows) {
      const p = personnels.find(pers => pers.matricule === row.matricule);
      if (!p) continue;
      const res = await congeService.create({ 
        idPersonnel: p.id, 
        type_conge: row.type_conge || row.type || 'Congé Annuel',
        date_debut: row.date_debut || row.debut,
        date_fin: row.date_fin || row.fin,
        statut: row.statut || 'en_attente' 
      });
      setItems(prev => [...prev, res?.data || res]);
      count++;
    }
    toast.success(`${count} congé(s) importé(s).`);
  };

  const handlePlanningImport = async (rows) => {
    toast.info("Importation du planning en cours...");
    try {
      const response = await api.post('/import-planning', { plannings: rows });
      toast.success(response.data?.message || 'Planning importé avec succès');
      const res = await congeService.getAll();
      setItems(toArray(res));
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0] || err.message;
      toast.error(`Erreur d'importation: ${errorMsg}`);
    }
  };

  const COLUMNS = [
    { key: 'employe',   header: 'Employé', render: v => <span className="font-medium">{v}</span> },
    { key: 'type_conge', header: 'Type' },
    { key: 'date_debut', header: 'Début',   render: v => formatDate(v) },
    { key: 'date_fin',   header: 'Fin',     render: v => formatDate(v) },
    { key: 'nbJours',   header: 'Jours',   render: (_, r) => r.date_debut && r.date_fin ? daysBetween(r.date_debut, r.date_fin) : '—' },
    { key: 'statut',    header: 'Statut',  render: v => <span className={STATUT_STYLES[v] || 'badge badge-gray'}>{v || '—'}</span> },
    {
      key: '_actions', header: '', width: '90px',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  const resetFilters = () => { setSearch(''); setStatutFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); };
  const hasFilters = search || statutFilter || typeFilter || dateFrom || dateTo;

  const personnelOptions = personnels.map(p => ({ 
    value: p.id, 
    label: `${(p.nom || '').toUpperCase()} ${(p.prenom || '')} (${p.matricule || '—'})` 
  }));

  return (
    <MainLayout>
      <PageHeader title="Congés" subtitle="Gestion des demandes de congé"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportExcel(filtered, 'conge', 'conges.xlsx')}><Download size={15} />Exporter</Button>
            <PlanningExcelImportButton onImport={handlePlanningImport} />
            <Button variant="secondary" onClick={() => setImportOpen(true)}><FileSpreadsheet size={15} />Importer Standard</Button>
            <Button onClick={openCreate}><Plus size={15} />Nouvelle demande</Button>
          </div>
        }
      />

      {/* Stats pills */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: 'Total',      value: stats.total,   cls: 'bg-slate-100 text-slate-700' },
          { label: 'En attente', value: stats.attente, cls: 'bg-amber-100 text-amber-700' },
          { label: 'Approuvés',  value: stats.approuve,cls: 'bg-emerald-100 text-emerald-700' },
          { label: 'Refusés',    value: stats.refuse,  cls: 'bg-red-100 text-red-700' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${cls}`}>
            <span className="text-base font-bold">{value}</span> {label}
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={14} className="text-slate-400" />
          <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 min-w-[200px] flex-1 max-w-xs">
            <Search size={13} className="text-slate-400" />
            <input type="search" placeholder="Nom de l'employé…" value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400" />
          </div>
          <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            <option value="">Tous statuts</option>
            {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            <option value="">Tous types</option>
            {TYPES_CONGE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field text-sm py-2 w-36" title="Date début" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field text-sm py-2 w-36" title="Date fin" />
          </div>
          {hasFilters && <button onClick={resetFilters} className="text-xs text-red-500 hover:underline">Réinitialiser</button>}
          <span className="ml-auto text-xs text-slate-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <Card padding={false}>
        {loading ? <Loader /> : (
          <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            <Table data={filtered} columns={COLUMNS} emptyMessage="Aucune demande de congé trouvée." />
          </div>
        )}
      </Card>

      {/* Form modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}
        title={editTarget ? 'Modifier le congé' : 'Nouvelle demande de congé'} size="md">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Select label="Employé" name="idPersonnel" value={form.idPersonnel} onChange={handleChange} options={personnelOptions} error={errors.idPersonnel} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type de congé" name="type_conge" value={form.type_conge} onChange={handleChange}
              options={TYPES_CONGE} error={errors.type_conge} required />
            <Select label="Statut" name="statut" value={form.statut} onChange={handleChange} options={STATUTS} />
            <Input label="Date de début" name="date_debut" type="date" value={form.date_debut} onChange={handleChange} error={errors.date_debut} required />
            <Input label="Date de fin"   name="date_fin"   type="date" value={form.date_fin}   onChange={handleChange} error={errors.date_fin}   required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Motif</label>
            <textarea name="motif" value={form.motif} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Motif…" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-surface-200">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      <ExcelImportModal isOpen={importOpen} onClose={() => setImportOpen(false)}
        schemaType="conge" entityLabel="les congés" onImport={handleImport} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={isPending} title="Supprimer ce congé"
        message={deleteTarget ? `Supprimer la demande de congé de ${deleteTarget.employe} ?` : ''} />
    </MainLayout>
  );
}
