import { useParams, useNavigate } from 'react-router-dom';
import { CrudList } from '../../components/common/CrudList';
import { CrudForm } from '../../components/common/CrudForm';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/common/PageHeader';
import DetailRow from '../../components/common/DetailRow';
import { Loader, ErrorMessage } from '../../components/common/index';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { congeService } from '../../services/crudServices';
import { formatDate, daysBetween } from '../../utils/helpers';
import useFetch from '../../hooks/useFetch';

const STATUT_STYLES = {
  en_attente: 'badge badge-yellow',
  approuvé:   'badge badge-green',
  refusé:     'badge badge-red',
};

const COLONNES = [
  { key: 'employe',   header: 'Employé' },
  { key: 'typeConge', header: 'Type' },
  { key: 'dateDebut', header: 'Début', render: v => formatDate(v) },
  { key: 'dateFin',   header: 'Fin',   render: v => formatDate(v) },
  { key: 'nbJours',   header: 'Jours', render: (_, row) => row.dateDebut && row.dateFin ? daysBetween(row.dateDebut, row.dateFin) : '—' },
  { key: 'statut',    header: 'Statut', render: v => <span className={STATUT_STYLES[v] || 'badge badge-gray'}>{v || 'en_attente'}</span> },
];

const TYPES = [
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

const svc = {
  getAll:  congeService.getAll,
  getById: congeService.getById,
  create:  congeService.create,
  update:  congeService.update,
  remove:  congeService.remove,
};

function CongeFields({ form, errors, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Nom de l&apos;employé" name="employe" value={form.employe || ''} onChange={handleChange} error={errors.employe} required className="md:col-span-2" />
      <Select label="Type de congé" name="typeConge" value={form.typeConge || ''} onChange={handleChange} options={TYPES} error={errors.typeConge} required />
      <Select label="Statut"        name="statut"    value={form.statut || 'en_attente'} onChange={handleChange} options={STATUTS} />
      <Input label="Date de début"  name="dateDebut" type="date" value={form.dateDebut || ''} onChange={handleChange} error={errors.dateDebut} required />
      <Input label="Date de fin"    name="dateFin"   type="date" value={form.dateFin || ''}   onChange={handleChange} error={errors.dateFin}   required />
      <div className="md:col-span-2 flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Motif</label>
        <textarea name="motif" value={form.motif || ''} onChange={handleChange} rows={3}
          className="input-field resize-none" placeholder="Motif de la demande…" />
      </div>
    </div>
  );
}

const validate = (form) => {
  const e = {};
  if (!form.employe)   e.employe   = 'Obligatoire.';
  if (!form.typeConge) e.typeConge = 'Obligatoire.';
  if (!form.dateDebut) e.dateDebut = 'Obligatoire.';
  if (!form.dateFin)   e.dateFin   = 'Obligatoire.';
  return e;
};

export function CongeList() {
  return (
    <CrudList title="Congés" subtitle="Gestion des demandes de congé"
      basePath="/conges" service={svc} columns={COLONNES}
      searchKeys={['employe', 'typeConge']}
      emptyMessage="Aucune demande de congé enregistrée." />
  );
}

export function CreateConge() {
  return (
    <CrudForm title="Nouvelle demande de congé" backTo="/conges" service={svc}
      initialValues={{ statut: 'en_attente' }}
      renderFields={(props) => <CongeFields {...props} />} validate={validate} />
  );
}

export function EditConge() {
  const { id } = useParams();
  return (
    <CrudForm title="Modifier la demande de congé" backTo="/conges" service={svc} id={id}
      renderFields={(props) => <CongeFields {...props} />} validate={validate} />
  );
}

export function ShowConge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, loading, error } = useFetch(() => congeService.getById(id), [id]);
  const c = raw?.data || raw;

  if (loading) return <MainLayout><Loader /></MainLayout>;
  if (error)   return <MainLayout><ErrorMessage message={error} /></MainLayout>;

  return (
    <MainLayout>
      <PageHeader title="Détail du congé" backTo="/conges"
        actions={<Button onClick={() => navigate(`/conges/${id}/edit`)}>Modifier</Button>} />
      <Card>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DetailRow label="Employé"    value={c?.employe} />
          <DetailRow label="Type"       value={c?.typeConge} />
          <DetailRow label="Statut"     value={<span className={STATUT_STYLES[c?.statut] || 'badge badge-gray'}>{c?.statut}</span>} />
          <DetailRow label="Date début" value={formatDate(c?.dateDebut)} />
          <DetailRow label="Date fin"   value={formatDate(c?.dateFin)} />
          <DetailRow label="Nb. jours"  value={c?.dateDebut && c?.dateFin ? daysBetween(c.dateDebut, c.dateFin) : '—'} />
          <div className="md:col-span-3 flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Motif</dt>
            <dd className="text-sm text-slate-800">{c?.motif || '—'}</dd>
          </div>
        </dl>
      </Card>
    </MainLayout>
  );
}
