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
import { absenceService } from '../../services/crudServices';
import { formatDate, daysBetween } from '../../utils/helpers';
import useFetch from '../../hooks/useFetch';

const TYPE_STYLES = {
  justifiée:    'badge badge-green',
  injustifiée:  'badge badge-red',
  'en attente': 'badge badge-yellow',
};

const COLONNES = [
  { key: 'employe',   header: 'Employé' },
  { key: 'dateDebut', header: 'Début', render: v => formatDate(v) },
  { key: 'dateFin',   header: 'Fin',   render: v => formatDate(v) },
  { key: 'nbJours',   header: 'Jours', render: (_, row) => row.dateDebut && row.dateFin ? daysBetween(row.dateDebut, row.dateFin) : '—' },
  { key: 'type',      header: 'Type',  render: v => <span className={TYPE_STYLES[v] || 'badge badge-gray'}>{v || '—'}</span> },
];

const TYPES = [
  { value: 'justifiée',   label: 'Justifiée' },
  { value: 'injustifiée', label: 'Injustifiée' },
  { value: 'en attente',  label: 'En attente' },
];

const svc = {
  getAll:  absenceService.getAll,
  getById: absenceService.getById,
  create:  absenceService.create,
  update:  absenceService.update,
  remove:  absenceService.remove,
};

function AbsenceFields({ form, errors, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Nom de l&apos;employé" name="employe" value={form.employe || ''} onChange={handleChange} error={errors.employe} required className="md:col-span-2" />
      <Input label="Date de début" name="dateDebut" type="date" value={form.dateDebut || ''} onChange={handleChange} error={errors.dateDebut} required />
      <Input label="Date de fin"   name="dateFin"   type="date" value={form.dateFin || ''}   onChange={handleChange} error={errors.dateFin}   required />
      <Select label="Type"         name="type"      value={form.type || 'en attente'} onChange={handleChange} options={TYPES} />
      <div className="md:col-span-2 flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Motif</label>
        <textarea name="motif" value={form.motif || ''} onChange={handleChange} rows={3}
          className="input-field resize-none" placeholder="Motif de l'absence…" />
      </div>
    </div>
  );
}

const validate = (form) => {
  const e = {};
  if (!form.employe)   e.employe   = 'Obligatoire.';
  if (!form.dateDebut) e.dateDebut = 'Obligatoire.';
  if (!form.dateFin)   e.dateFin   = 'Obligatoire.';
  return e;
};

export function AbsenceList() {
  return (
    <CrudList title="Absences" subtitle="Suivi des absences du personnel"
      basePath="/absences" service={svc} columns={COLONNES}
      searchKeys={['employe', 'type']}
      emptyMessage="Aucune absence enregistrée." />
  );
}

export function CreateAbsence() {
  return (
    <CrudForm title="Déclarer une absence" backTo="/absences" service={svc}
      initialValues={{ type: 'en attente' }}
      renderFields={(props) => <AbsenceFields {...props} />} validate={validate} />
  );
}

export function EditAbsence() {
  const { id } = useParams();
  return (
    <CrudForm title="Modifier l'absence" backTo="/absences" service={svc} id={id}
      renderFields={(props) => <AbsenceFields {...props} />} validate={validate} />
  );
}

export function ShowAbsence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, loading, error } = useFetch(() => absenceService.getById(id), [id]);
  const a = raw?.data || raw;

  if (loading) return <MainLayout><Loader /></MainLayout>;
  if (error)   return <MainLayout><ErrorMessage message={error} /></MainLayout>;

  return (
    <MainLayout>
      <PageHeader title="Détail de l'absence" backTo="/absences"
        actions={<Button onClick={() => navigate(`/absences/${id}/edit`)}>Modifier</Button>} />
      <Card>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DetailRow label="Employé"    value={a?.employe} />
          <DetailRow label="Type"       value={<span className={TYPE_STYLES[a?.type] || 'badge badge-gray'}>{a?.type}</span>} />
          <DetailRow label="Date début" value={formatDate(a?.dateDebut)} />
          <DetailRow label="Date fin"   value={formatDate(a?.dateFin)} />
          <DetailRow label="Nb. jours"  value={a?.dateDebut && a?.dateFin ? daysBetween(a.dateDebut, a.dateFin) : '—'} />
          <div className="col-span-full flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Motif</dt>
            <dd className="text-sm text-slate-800">{a?.motif || '—'}</dd>
          </div>
        </dl>
      </Card>
    </MainLayout>
  );
}
