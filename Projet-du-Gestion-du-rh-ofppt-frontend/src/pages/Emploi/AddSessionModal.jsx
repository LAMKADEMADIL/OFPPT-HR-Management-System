import { useState, useEffect, useRef } from 'react';
import { Clock, BookOpen, User, MapPin, Users } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import {
  JOURS, TYPES_SEANCE, CRENEAUX,
} from './scheduleConstants';

const INITIAL_FORM = {
  jour: '', heureDebut: '', heureFin: '',
  type: 'cours', module_id: '', formateur_id: '', salle_id: '', groupe_id: '',
};

const validate = (form) => {
  const errors = {};
  if (!form.jour)         errors.jour         = 'Obligatoire.';
  if (!form.heureDebut)   errors.heureDebut   = 'Obligatoire.';
  if (!form.heureFin)     errors.heureFin     = 'Obligatoire.';
  if (form.heureDebut && form.heureFin && form.heureDebut >= form.heureFin)
    errors.heureFin = "Doit être après l'heure de début.";
  if (!form.formateur_id) errors.formateur_id = 'Obligatoire.';
  if (!form.salle_id)     errors.salle_id     = 'Obligatoire.';
  if (!form.groupe_id)    errors.groupe_id    = 'Obligatoire.';
  if (!form.module_id)    errors.module_id    = 'Obligatoire.';
  return errors;
};

export default function AddSessionModal({ isOpen, onClose, onSave, initialJour, initialHeure, editData, options = {} }) {
  const [form, setForm]     = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const prevOpen = useRef(false);

  // Populate form when modal opens — avoid synchronous setState in effect
  useEffect(() => {
    if (!isOpen || prevOpen.current === isOpen) return;
    prevOpen.current = isOpen;

    const next = editData
      ? { ...INITIAL_FORM, ...editData }
      : { ...INITIAL_FORM, jour: initialJour ? String(initialJour) : '', heureDebut: initialHeure || '' };

    // Defer to next tick to avoid "setState during render" pattern
    const t = setTimeout(() => { setForm(next); setErrors({}); }, 0);
    return () => clearTimeout(t);
  }, [isOpen, editData, initialJour, initialHeure]);

  // Reset prevOpen tracker when closed
  useEffect(() => {
    if (!isOpen) prevOpen.current = false;
  }, [isOpen]);

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form, editData?.id);
      onClose();
    } catch (err) {
      setErrors({ _server: err.response?.data?.message || "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  };

  const creneauxOptions = CRENEAUX.map(c => ({ value: c, label: c }));
  const joursOptions    = JOURS.map(j => ({ value: String(j.key), label: j.label }));
  
  // Transforme les listes de chaînes en options { value, label }
  const toOpts = (arr) => (arr || []).map(val => ({ value: val, label: val }));

  const formateurOpts   = toOpts(options.formateurs);
  const salleOpts       = toOpts(options.salles);
  const groupeOpts      = toOpts(options.groupes);
  const moduleOpts      = toOpts(options.modules);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Modifier la séance' : 'Ajouter une séance'} size="md">
      {errors._server && (
        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {errors._server}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Jour + Type */}
        <div className="grid grid-cols-2 gap-4">
          <Select label="Jour" name="jour" value={form.jour} onChange={handleChange} options={joursOptions} error={errors.jour} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Type <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {TYPES_SEANCE.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    form.type === t.value ? `${t.color} text-white border-transparent` : 'bg-white border-surface-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Heures */}
        <div className="grid grid-cols-2 gap-4">
          {[{ name: 'heureDebut', label: 'Heure début', opts: creneauxOptions.slice(0, -1) },
            { name: 'heureFin',   label: 'Heure fin',   opts: creneauxOptions.slice(1) }].map(({ name, label, opts }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Clock size={13} /> {label} <span className="text-red-500">*</span>
              </label>
              <select name={name} value={form[name]} onChange={handleChange}
                className={`input-field ${errors[name] ? 'border-red-400' : ''}`}>
                <option value="">--:--</option>
                {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
            </div>
          ))}
        </div>

        {/* Module */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <BookOpen size={13} /> Module <span className="text-red-500">*</span>
          </label>
          <select name="module_id" value={form.module_id} onChange={handleChange}
            className={`input-field ${errors.module_id ? 'border-red-400' : ''}`}>
            <option value="">Sélectionner un module…</option>
            {moduleOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.module_id && <p className="text-xs text-red-500">{errors.module_id}</p>}
        </div>

        {/* Formateur + Groupe */}
        <div className="grid grid-cols-2 gap-4">
          {[{ name: 'formateur_id', label: 'Formateur', icon: User,  opts: formateurOpts },
            { name: 'groupe_id',    label: 'Groupe',    icon: Users, opts: groupeOpts    }].map(({ name, label, icon: Icon, opts }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Icon size={13} /> {label} <span className="text-red-500">*</span>
              </label>
              <select name={name} value={form[name]} onChange={handleChange}
                className={`input-field ${errors[name] ? 'border-red-400' : ''}`}>
                <option value="">Sélectionner…</option>
                {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
            </div>
          ))}
        </div>

        {/* Salle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <MapPin size={13} /> Salle <span className="text-red-500">*</span>
          </label>
          <select name="salle_id" value={form.salle_id} onChange={handleChange}
            className={`input-field ${errors.salle_id ? 'border-red-400' : ''}`}>
            <option value="">Sélectionner une salle…</option>
            {salleOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.salle_id && <p className="text-xs text-red-500">{errors.salle_id}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-surface-200 mt-1">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button type="submit" loading={saving}>{editData ? 'Mettre à jour' : 'Ajouter la séance'}</Button>
        </div>
      </form>
    </Modal>
  );
}
