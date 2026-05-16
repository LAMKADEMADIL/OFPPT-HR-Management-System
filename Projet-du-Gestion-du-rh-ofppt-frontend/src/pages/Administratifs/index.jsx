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
import { personnelService } from '../../services/crudServices';
import { formatDate } from '../../utils/helpers';
import useFetch from '../../hooks/useFetch';

const COLONNES = [
  { key: 'matricule', header: 'Matricule' },
  { key: 'prenom',    header: 'Prénom' },
  { key: 'nom',       header: 'Nom' },
  { key: 'poste',     header: 'Fonction' },
  { key: 'service',   header: 'Service' },
  { key: 'telephone', header: 'Téléphone' },
];

const POSTES = [
  { value: 'Secrétaire',               label: 'Secrétaire' },
  { value: 'Comptable',                label: 'Comptable' },
  { value: 'Responsable RH',           label: 'Responsable RH' },
  { value: 'Responsable Informatique', label: 'Responsable Informatique' },
  { value: "Agent d'accueil",          label: "Agent d'accueil" },
  { value: 'Technicien de surface',    label: 'Technicien de surface' },
  { value: 'Autre',                    label: 'Autre' },
];

const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

const svc = {
  getAll: async () => {
    const result = await personnelService.getAll();
    return toArray(result).filter((item) => item.categorie === 'administratif');
  },
  getById: personnelService.getById,
  create:  (data) => personnelService.create({ ...data, categorie: 'administratif' }),
  update:  personnelService.update,
  remove:  personnelService.remove,
};

function AdminFields({ form, errors, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Matricule"  name="matricule" value={form.matricule || ''} onChange={handleChange} />
      <Input label="Prénom"     name="prenom"    value={form.prenom || ''}    onChange={handleChange} error={errors.prenom} required />
      <Input label="Nom"        name="nom"       value={form.nom || ''}       onChange={handleChange} error={errors.nom}    required />
      <Input label="CIN"        name="cin"       value={form.cin || ''}       onChange={handleChange} />
      <Input label="Email"      name="email"     type="email" value={form.email || ''} onChange={handleChange} />
      <Input label="Téléphone"  name="telephone" value={form.telephone || ''} onChange={handleChange} />
      <Select label="Fonction"  name="poste"     value={form.poste || ''}     onChange={handleChange} options={POSTES} error={errors.poste} required />
      <Input label="Service"    name="service"   value={form.service || ''}   onChange={handleChange} />
      <Input label="Date d&apos;embauche" name="dateEmbauche" type="date" value={form.dateEmbauche || ''} onChange={handleChange} />
    </div>
  );
}

const validate = (form) => {
  const e = {};
  if (!form.prenom)   e.prenom   = 'Obligatoire.';
  if (!form.nom)      e.nom      = 'Obligatoire.';
  if (!form.poste)    e.poste    = 'Obligatoire.';
  return e;
};

export function AdministratifList() {
  return (
    <CrudList title="Administratifs" subtitle="Personnel administratif de l'établissement"
      basePath="/administratifs" service={svc} columns={COLONNES}
      searchKeys={['nom', 'prenom', 'fonction', 'service']}
      emptyMessage="Aucun personnel administratif enregistré." />
  );
}

export function CreateAdministratif() {
  return (
    <CrudForm title="Nouveau personnel administratif" backTo="/administratifs" service={svc}
      renderFields={(props) => <AdminFields {...props} />} validate={validate} />
  );
}

export function EditAdministratif() {
  const { id } = useParams();
  return (
    <CrudForm title="Modifier l'administratif" backTo="/administratifs" service={svc} id={id}
      renderFields={(props) => <AdminFields {...props} />} validate={validate} />
  );
}

export function ShowAdministratif() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, loading, error } = useFetch(() => personnelService.getById(id), [id]);
  const a = raw?.data || raw;

  if (loading) return <MainLayout><Loader /></MainLayout>;
  if (error)   return <MainLayout><ErrorMessage message={error} /></MainLayout>;

  return (
    <MainLayout>
      <PageHeader title="Détail administratif" backTo="/administratifs"
        actions={<Button onClick={() => navigate(`/administratifs/${id}/edit`)}>Modifier</Button>} />
      <Card>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DetailRow label="Matricule"       value={a?.matricule} />
          <DetailRow label="Prénom"          value={a?.prenom} />
          <DetailRow label="Nom"             value={a?.nom} />
          <DetailRow label="Fonction"        value={a?.poste} />
          <DetailRow label="Service"         value={a?.service} />
          <DetailRow label="Email"           value={a?.email} />
          <DetailRow label="Téléphone"       value={a?.telephone} />
          <DetailRow label="Date d'embauche" value={formatDate(a?.dateEmbauche)} />
        </dl>
      </Card>
    </MainLayout>
  );
}
