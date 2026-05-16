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
import { userService } from '../../services/crudServices';
import useFetch from '../../hooks/useFetch';

const ROLE_STYLES = {
  directeurducomplexe:    'badge badge-blue',
  gestionnairecfmr:  'badge badge-green',
};

const COLONNES = [
  { key: 'name',  header: 'Nom' },
  { key: 'email', header: 'Email' },
  { key: 'role',  header: 'Rôle',   render: v => <span className={ROLE_STYLES[v] || 'badge badge-gray'}>{v || '—'}</span> },
  { key: 'actif', header: 'Statut', render: v => <span className={v ? 'badge badge-green' : 'badge badge-red'}>{v ? 'Actif' : 'Inactif'}</span> },
];

const ROLES = [
  { value: 'directeurducomplexe',    label: 'Directeur-du-Complexe' },
  { value: 'gestionnairecfmr',  label: 'Gestionnaire-CFMR' },
];

const svc = {
  getAll:  userService.getAll,
  getById: userService.getById,
  create:  userService.create,
  update:  userService.update,
  remove:  userService.remove,
};

function UserFields({ form, errors, handleChange, isEdit }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Nom complet" name="name"  value={form.name || ''}  onChange={handleChange} error={errors.name}  required className="md:col-span-2" />
      <Input label="Email"       name="email" type="email" value={form.email || ''} onChange={handleChange} error={errors.email} required />
      <Select label="Rôle"       name="role"  value={form.role || 'employee'} onChange={handleChange} options={ROLES} required />
      {!isEdit && (
        <>
          <Input label="Mot de passe"           name="password"        type="password" value={form.password || ''}        onChange={handleChange} error={errors.password}        required />
          <Input label="Confirmer mot de passe" name="confirmPassword" type="password" value={form.confirmPassword || ''} onChange={handleChange} error={errors.confirmPassword} required />
        </>
      )}
    </div>
  );
}

const validateCreate = (form) => {
  const e = {};
  if (!form.name)  e.name  = 'Obligatoire.';
  if (!form.email) e.email = 'Obligatoire.';
  if (!form.password) e.password = 'Obligatoire.';
  if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas.';
  return e;
};

const validateEdit = (form) => {
  const e = {};
  if (!form.name)  e.name  = 'Obligatoire.';
  if (!form.email) e.email = 'Obligatoire.';
  return e;
};

export function UserList() {
  return (
    <CrudList title="Utilisateurs" subtitle="Gestion des accès et des comptes"
      basePath="/users" service={svc} columns={COLONNES}
      searchKeys={['name', 'email', 'role']}
      emptyMessage="Aucun utilisateur enregistré." />
  );
}

export function CreateUser() {
  return (
    <CrudForm title="Nouvel utilisateur" backTo="/users" service={svc}
      initialValues={{ role: 'employee', actif: true }}
      renderFields={(props) => <UserFields {...props} isEdit={false} />}
      validate={validateCreate} />
  );
}

export function EditUser() {
  const { id } = useParams();
  return (
    <CrudForm title="Modifier l'utilisateur" backTo="/users" service={svc} id={id}
      renderFields={(props) => <UserFields {...props} isEdit={true} />}
      validate={validateEdit} />
  );
}

export function ShowUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, loading, error } = useFetch(() => userService.getById(id), [id]);
  const u = raw?.data || raw;

  if (loading) return <MainLayout><Loader /></MainLayout>;
  if (error)   return <MainLayout><ErrorMessage message={error} /></MainLayout>;

  return (
    <MainLayout>
      <PageHeader title="Détail utilisateur" backTo="/users"
        actions={<Button onClick={() => navigate(`/users/${id}/edit`)}>Modifier</Button>} />
      <Card>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DetailRow label="Nom"    value={u?.name} />
          <DetailRow label="Email"  value={u?.email} />
          <DetailRow label="Rôle"   value={<span className={ROLE_STYLES[u?.role] || 'badge badge-gray'}>{u?.role}</span>} />
          <DetailRow label="Statut" value={<span className={u?.actif ? 'badge badge-green' : 'badge badge-red'}>{u?.actif ? 'Actif' : 'Inactif'}</span>} />
        </dl>
      </Card>
    </MainLayout>
  );
}
