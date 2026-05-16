import { useState, useEffect, useRef, useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PageHeader from '../common/PageHeader';
import { Loader } from '../common/index';

/**
 * Generic form page using React 19 Actions (useActionState).
 * Handles both create and edit modes.
 */
export function CrudForm({
  title, backTo, service, id,
  renderFields, initialValues = {}, validate,
}) {
  const navigate    = useNavigate();
  const [form, setForm]         = useState(initialValues);
  const [errors, setErrors]     = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const hasFetched  = useRef(false);

  // Load existing data in edit mode — runs once per id
  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;

    const fn = service.getById || service.getItemById;
    let cancelled = false;

    // Wrap in async IIFE so we only call setState in the callback, not the effect body
    (async () => {
      setDataLoading(true);
      try {
        const data = await fn(id);
        if (!cancelled) setForm({ ...initialValues, ...(data?.data || data) });
      } catch {
        if (!cancelled) setErrors({ _load: 'Impossible de charger les données.' });
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // React 19 Action
  const submitAction = async (_prevState, _formData) => {
    if (validate) {
      const errs = validate(form);
      if (Object.keys(errs).length) {
        setErrors(errs);
        return { error: 'Veuillez corriger les erreurs ci-dessus.' };
      }
    }
    try {
      if (id) {
        await (service.update || service.updateItem)(id, form);
      } else {
        await (service.create || service.createItem)(form);
      }
      navigate(backTo);
      return { success: true };
    } catch (err) {
      return { error: err.response?.data?.message || "Erreur lors de l'enregistrement." };
    }
  };

  const [state, formAction, isPending] = useActionState(submitAction, null);

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (dataLoading) return <MainLayout><Loader /></MainLayout>;

  return (
    <MainLayout>
      <PageHeader title={title} backTo={backTo} />
      <Card>
        {(state?.error || errors._load) && (
          <div role="alert" className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {state?.error || errors._load}
          </div>
        )}
        <form action={formAction} className="flex flex-col gap-5">
          {renderFields({ form, errors, handleChange, setForm })}
          <div className="flex justify-end gap-3 pt-2 border-t border-surface-200">
            <Button variant="secondary" type="button" onClick={() => navigate(backTo)} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              {id ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
}
