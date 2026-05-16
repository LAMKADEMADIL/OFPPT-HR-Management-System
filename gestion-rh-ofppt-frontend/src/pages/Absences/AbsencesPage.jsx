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
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ExcelImportModal from '../../components/common/ExcelImportModal';
import { Loader } from '../../components/common/index';
import { toast } from '../../components/ui/Toast';
import { absenceService, personnelService } from '../../services/crudServices';
import { exportExcel } from '../../services/ExcelService';
import { formatDate } from '../../utils/helpers';

const TYPE_STYLES = {
  justifiée:    'badge badge-green',
  injustifiée:  'badge badge-red',
  'en attente': 'badge badge-yellow',
};
const TYPES = [
  { value: 'justifiée',   label: 'Justifiée' },
  { value: 'injustifiée', label: 'Injustifiée' },
  { value: 'en attente',  label: 'En attente' },
];
const EMPTY = { idPersonnel: '', date_absence: '', motif: '', type: 'en attente' };
const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

export default function AbsencesPage() {
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

  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [dateFilter, setDateFilter]   = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [absRes, persRes] = await Promise.all([
          absenceService.getAll(),
          personnelService.getAll({ per_page: 1000 })
        ]);
        if (!cancelled) {
          setItems(toArray(absRes));
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
    .filter(i => !search     || (i.employe || '').toLowerCase().includes(search.toLowerCase()))
    .filter(i => !typeFilter || i.type === typeFilter)
    .filter(i => !dateFilter || i.date_absence === dateFilter);

  const stats = {
    total:       optimisticItems.length,
    justifiee:   optimisticItems.filter(i => i.type === 'justifiée').length,
    injustifiee: optimisticItems.filter(i => i.type === 'injustifiée').length,
    attente:     optimisticItems.filter(i => i.type === 'en attente').length,
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setErrors({}); setFormOpen(true); };
  const openEdit   = (item) => { 
    setEditTarget(item); 
    setForm({ 
      idPersonnel: item.idPersonnel, 
      date_absence: item.date_absence, 
      motif: item.motif, 
      type: item.type || 'en attente' 
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
    if (!f.idPersonnel)  e.idPersonnel  = 'Sélectionnez un employé.';
    if (!f.date_absence) e.date_absence = 'Obligatoire.';
    if (!f.motif)        e.motif        = 'Obligatoire.';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const res = await absenceService.update(editTarget.id, form);
        setItems(prev => prev.map(i => i.id === editTarget.id ? (res?.data || res) : i));
        toast.success('Absence mise à jour.');
      } else {
        const res = await absenceService.create(form);
        setItems(prev => [...prev, res?.data || res]);
        toast.success('Absence enregistrée.');
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
        await absenceService.remove(deleteTarget.id);
        setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
        toast.success('Absence supprimée.');
      } catch {
        const res = await absenceService.getAll();
        setItems(toArray(res));
        toast.error('Erreur lors de la suppression.');
      }
    });
  };

  const handleImport = async (rows) => {
    let count = 0;
    for (const row of rows) {
      // Find personnel by matricule if possible
      const p = personnels.find(pers => pers.matricule === row.matricule);
      if (!p) continue;
      const res = await absenceService.create({ 
        idPersonnel: p.id, 
        date_absence: row.date_absence || row.date, 
        motif: row.motif || 'Import Excel',
        type: row.type || 'en attente' 
      });
      setItems(prev => [...prev, res?.data || res]);
      count++;
    }
    toast.success(`${count} absence(s) importée(s).`);
  };

  const COLUMNS = [
    { key: 'employe',      header: 'Employé', render: v => <span className="font-medium">{v}</span> },
    { key: 'date_absence', header: 'Date',    render: v => formatDate(v) },
    { key: 'type',         header: 'Type',    render: v => <span className={TYPE_STYLES[v] || 'badge badge-gray'}>{v || '—'}</span> },
    { key: 'motif',        header: 'Motif',   render: v => <span className="text-xs text-slate-500">{v || '—'}</span> },
    {
      key: '_actions', header: '', width: '80px',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  const resetFilters = () => { setSearch(''); setTypeFilter(''); setDateFilter(''); };
  const hasFilters = search || typeFilter || dateFilter;

  const personnelOptions = personnels.map(p => ({ 
    value: p.id, 
    label: `${(p.nom || '').toUpperCase()} ${(p.prenom || '')} (${p.matricule || '—'})` 
  }));

  return (
    <MainLayout>
      <PageHeader title="Absences" subtitle="Suivi des absences du personnel"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportExcel(filtered, 'absence', 'absences.xlsx')}><Download size={15} />Exporter</Button>
            <Button variant="secondary" onClick={() => setImportOpen(true)}><FileSpreadsheet size={15} />Importer</Button>
            <Button onClick={openCreate}><Plus size={15} />Déclarer</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: 'Total',        value: stats.total,       cls: 'bg-slate-100 text-slate-700' },
          { label: 'Justifiées',   value: stats.justifiee,   cls: 'bg-emerald-100 text-emerald-700' },
          { label: 'Injustifiées', value: stats.injustifiee, cls: 'bg-red-100 text-red-700' },
          { label: 'En attente',   value: stats.attente,     cls: 'bg-amber-100 text-amber-700' },
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
            <input type="search" placeholder="Rechercher un employé…" value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            <option value="">Tous types</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field text-sm py-2 w-44" />
          </div>
          {hasFilters && <button onClick={resetFilters} className="text-xs text-red-500 hover:underline">Réinitialiser</button>}
          <span className="ml-auto text-xs text-slate-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <Card padding={false}>
        {loading ? <Loader /> : (
          <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            <Table data={filtered} columns={COLUMNS} emptyMessage="Aucune absence enregistrée." />
          </div>
        )}
      </Card>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}
        title={editTarget ? "Modifier l'absence" : 'Déclarer une absence'} size="md">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Select label="Employé" name="idPersonnel" value={form.idPersonnel} onChange={handleChange} options={personnelOptions} error={errors.idPersonnel} required />
          <Input label="Date de l&apos;absence" name="date_absence" type="date" value={form.date_absence} onChange={handleChange} error={errors.date_absence} required />
          <Select label="Type" name="type" value={form.type} onChange={handleChange} options={TYPES} />
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
        schemaType="absence" entityLabel="les absences" onImport={handleImport} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={isPending} title="Supprimer cette absence"
        message={deleteTarget ? `Supprimer l'absence de ${deleteTarget.employe} ?` : ''} />
    </MainLayout>
  );
}
