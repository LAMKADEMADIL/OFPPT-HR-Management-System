import Input from '../ui/Input';
import Select from '../ui/Select';

const FONCTIONS_ADMIN = [
  { value: 'Secrétaire',               label: 'Secrétaire' },
  { value: 'Comptable',                label: 'Comptable' },
  { value: 'Responsable RH',           label: 'Responsable RH' },
  { value: 'Responsable Informatique', label: 'Responsable Informatique' },
  { value: "Agent d'accueil",          label: "Agent d'accueil" },
  { value: 'Technicien de surface',    label: 'Technicien de surface' },
  { value: 'Directeur',                label: 'Directeur' },
  { value: 'Autre',                    label: 'Autre' },
];

const GRADES_FORMATEUR = [
  { value: 'Formateur Adjoint',   label: 'Formateur Adjoint' },
  { value: 'Formateur',           label: 'Formateur' },
  { value: 'Formateur Principal', label: 'Formateur Principal' },
  { value: 'Formateur Expert',    label: 'Formateur Expert' },
  { value: 'Vacataire',           label: 'Vacataire' },
];

const GRADES_ADMIN = [
  { value: 'Adjoint',    label: 'Adjoint' },
  { value: 'Principal',  label: 'Principal' },
  { value: 'Cadre',      label: 'Cadre' },
  { value: 'Directeur',  label: 'Directeur' },
];

const DEPARTEMENTS = [
  { value: 'Informatique',       label: 'Informatique' },
  { value: 'Réseaux',            label: 'Réseaux' },
  { value: 'Commerce',           label: 'Commerce' },
  { value: 'Électronique',       label: 'Électronique' },
  { value: 'Langues',            label: 'Langues' },
  { value: 'Gestion',            label: 'Gestion' },
  { value: 'Mécanique',          label: 'Mécanique' },
  { value: 'Bâtiment & Travaux', label: 'Bâtiment & Travaux' },
];

/**
 * PersonnelForm — composant formulaire dynamique.
 * Les champs affichés varient selon la `categorie` du personnel.
 *
 * @param {object} form            - Données du formulaire
 * @param {object} errors          - Erreurs de validation
 * @param {function} handleChange  - Handler onChange
 * @param {boolean} isEdit         - Mode édition (masque la sélection de catégorie)
 */
export default function PersonnelForm({ form, errors, handleChange, isEdit = false }) {
  const cat = form.categorie;
  const isAdmin     = cat === 'administratif';
  const isPerminent = cat === 'formateur_permanent';
  const isVacataire = cat === 'formateur_vacataire';
  const isFormateur = isPerminent || isVacataire;

  return (
    <div className="flex flex-col gap-5">
      {/* Catégorie — only shown in create mode */}
      {!isEdit && (
        <div className="p-4 bg-surface-50 border border-surface-200 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Type de personnel</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'administratif',       label: 'Administratif', icon: '🏢' },
              { value: 'formateur_permanent', label: 'Formateur Permanent', icon: '🎓' },
              { value: 'formateur_vacataire', label: 'Formateur Vacataire', icon: '⏱' },
            ].map(({ value, label, icon }) => (
              <button key={value} type="button"
                onClick={() => handleChange({ target: { name: 'categorie', value } })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all
                  ${form.categorie === value
                    ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                    : 'border-surface-200 hover:border-primary-200 text-slate-600'}`}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </button>
            ))}
          </div>
          {errors.categorie && <p className="text-xs text-red-500 mt-2">{errors.categorie}</p>}
        </div>
      )}

      {/* Common fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="Matricule"  name="matricule" value={form.matricule || ''}  onChange={handleChange} />
        <Input label="Prénom"     name="prenom"    value={form.prenom || ''}     onChange={handleChange} error={errors.prenom}  required />
        <Input label="Nom"        name="nom"       value={form.nom || ''}        onChange={handleChange} error={errors.nom}     required />
        <Input label="CIN"        name="cin"       value={form.cin || ''}        onChange={handleChange} />
        <Input label="Email"      name="email"     type="email" value={form.email || ''} onChange={handleChange} />
        <Input label="Téléphone"  name="telephone" value={form.telephone || ''}  onChange={handleChange} />
        <Input label="Date d&apos;embauche" name="dateEmbauche" type="date" value={form.dateEmbauche || ''} onChange={handleChange} />

        {/* ── Administratif fields ── */}
        {isAdmin && (
          <>
            <Select label="Fonction" name="fonction" value={form.fonction || ''} onChange={handleChange} options={FONCTIONS_ADMIN} error={errors.fonction} required />
            <Input  label="Service"  name="service"  value={form.service || ''}  onChange={handleChange} />
            <Select label="Grade"    name="grade"    value={form.grade || ''}    onChange={handleChange} options={GRADES_ADMIN} />
            <Input  label="Date de naissance" name="dateNaissance" type="date" value={form.dateNaissance || ''} onChange={handleChange} />
            <Input  label="Adresse" name="adresse" value={form.adresse || ''} onChange={handleChange} className="md:col-span-2" />
          </>
        )}

        {/* ── Formateur fields (shared) ── */}
        {isFormateur && (
          <>
            <Input  label="Spécialité"  name="specialite"  value={form.specialite || ''}  onChange={handleChange} error={errors.specialite} required />
            <Select label="Département" name="departement" value={form.departement || ''} onChange={handleChange} options={DEPARTEMENTS} />
            <Select label="Grade"       name="grade"       value={form.grade || ''}       onChange={handleChange} options={GRADES_FORMATEUR} />
            <Input  label="Heures / Semaine" name="heuresParSemaine" type="number"
              value={form.heuresParSemaine || ''} onChange={handleChange}
              hint={isVacataire ? 'Nombre d\'heures hebdomadaires (vacataire)' : undefined}
            />
          </>
        )}

        {/* ── Vacataire-only fields ── */}
        {isVacataire && (
          <Input label="Tarif / Heure (DH)" name="tarifHeure" type="number"
            value={form.tarifHeure || ''} onChange={handleChange}
            hint="Rémunération horaire en dirhams" />
        )}
      </div>
    </div>
  );
}
