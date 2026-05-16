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
  { key: 'matricule',  header: 'Matricule' },
  { key: 'prenom',     header: 'Prénom' },
  { key: 'nom',        header: 'Nom' },
  { key: 'specialite', header: 'Spécialité' },
  { key: 'grade',      header: 'Grade' },
  { key: 'email',      header: 'Email' },
];

const GRADES = [
  { value: 'Formateur Adjoint',   label: 'Formateur Adjoint' },
  { value: 'Formateur',           label: 'Formateur' },
  { value: 'Formateur Principal', label: 'Formateur Principal' },
  { value: 'Formateur Expert',    label: 'Formateur Expert' },
];

const FORMATEUR_CATEGORIES = ['formateur_permanent', 'formateur_vacataire'];
const toArray = (result) => Array.isArray(result) ? result : result?.data || [];

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

const svc = {
  getAll: async () => {
    const result = await personnelService.getAll();
    return toArray(result)
      .map(mapBackendToFrontend)
      .filter((item) => FORMATEUR_CATEGORIES.includes(item.categorie));
  },
  getById: async (id) => {
    const result = await personnelService.getById(id);
    return mapBackendToFrontend(result?.data || result);
  },
  create: async (data) => {
    const res = await personnelService.create({ ...data, categorie: data.categorie || 'formateur_permanent' });
    return mapBackendToFrontend(res?.data || res);
  },
  update: async (id, data) => {
    const res = await personnelService.update(id, data);
    return mapBackendToFrontend(res?.data || res);
  },
  remove:  personnelService.remove,
};

function FormateurFields({ form, errors, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Matricule"  name="matricule"  value={form.matricule || ''}  onChange={handleChange} />
      <Input label="Prénom"     name="prenom"     value={form.prenom || ''}     onChange={handleChange} error={errors.prenom}    required />
      <Input label="Nom"        name="nom"        value={form.nom || ''}        onChange={handleChange} error={errors.nom}       required />
      <Input label="CIN"        name="cin"        value={form.cin || ''}        onChange={handleChange} />
      <Input label="Email"      name="email"      type="email" value={form.email || ''} onChange={handleChange} />
      <Input label="Téléphone"  name="telephone"  value={form.telephone || ''}  onChange={handleChange} />
      <Input label="Spécialité" name="specialite" value={form.specialite || ''} onChange={handleChange} error={errors.specialite} required />
      <Select label="Grade"     name="grade"      value={form.grade || ''}      onChange={handleChange} options={GRADES} />
      <Input label="Date d&apos;embauche" name="dateEmbauche" type="date" value={form.dateEmbauche || ''} onChange={handleChange} />
      <Input label="Département" name="departement" value={form.departement || ''} onChange={handleChange} />
    </div>
  );
}

const validate = (form) => {
  const e = {};
  if (!form.prenom)     e.prenom     = 'Obligatoire.';
  if (!form.nom)        e.nom        = 'Obligatoire.';
  if (!form.specialite) e.specialite = 'Obligatoire.';
  return e;
};

export function FormateurList() {
  return (
    <CrudList title="Formateurs" subtitle="Gestion des formateurs OFPPT"
      basePath="/formateurs" service={svc} columns={COLONNES}
      searchKeys={['nom', 'prenom', 'specialite', 'matricule']}
      emptyMessage="Aucun formateur enregistré." />
  );
}

export function CreateFormateur() {
  return (
    <CrudForm title="Nouveau formateur" backTo="/formateurs" service={svc}
      renderFields={(props) => <FormateurFields {...props} />} validate={validate} />
  );
}

export function EditFormateur() {
  const { id } = useParams();
  return (
    <CrudForm title="Modifier le formateur" backTo="/formateurs" service={svc} id={id}
      renderFields={(props) => <FormateurFields {...props} />} validate={validate} />
  );
}

export function ShowFormateur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, loading, error } = useFetch(() => personnelService.getById(id), [id]);
  const f = raw?.data || raw;

  if (loading) return <MainLayout><Loader /></MainLayout>;
  if (error)   return <MainLayout><ErrorMessage message={error} /></MainLayout>;

  return (
    <MainLayout>
      <PageHeader title="Détail du formateur" backTo="/formateurs"
        actions={<Button onClick={() => navigate(`/formateurs/${id}/edit`)}>Modifier</Button>} />
      <Card>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DetailRow label="Matricule"      value={f?.matricule} />
          <DetailRow label="Prénom"         value={f?.prenom} />
          <DetailRow label="Nom"            value={f?.nom} />
          <DetailRow label="Spécialité"     value={f?.specialite} />
          <DetailRow label="Grade"          value={f?.grade} />
          <DetailRow label="Email"          value={f?.email} />
          <DetailRow label="Téléphone"      value={f?.telephone} />
          <DetailRow label="Département"    value={f?.departement} />
          <DetailRow label="Date d'embauche" value={formatDate(f?.dateEmbauche)} />
        </dl>
      </Card>
    </MainLayout>
  );
}
