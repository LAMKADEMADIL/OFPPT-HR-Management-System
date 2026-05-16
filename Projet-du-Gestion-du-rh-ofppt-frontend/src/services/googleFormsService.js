/**
 * googleFormsService.js
 * Génère des liens Google Forms pré-remplis à partir des données locales.
 *
 * Comment récupérer les IDs des champs :
 *   1. Ouvrez votre Google Form dans Google Chrome
 *   2. Clic droit → "Inspecter" → Onglet "Réseau"
 *   3. Remplissez un champ manuellement et soumettez
 *   4. Cherchez la requête POST avec "formResponse" dans l'URL
 *   5. Les paramètres "entry.XXXXXXXX" sont les IDs de champs
 *
 * Exemple d'URL générée :
 *   https://docs.google.com/forms/d/[FORM_ID]/viewform?
 *     entry.123456=Hassan+Alami&
 *     entry.789012=Informatique
 */

// ── Configuration des formulaires OFPPT ──────────────────────
// Remplacez ces IDs par vos vrais IDs Google Forms
const FORMS = {
  demandeConge: {
    formId:   import.meta.env.VITE_GFORM_CONGE_ID   || '1FAIpQLSf_REMPLACEZ_MOI',
    fields: {
      nom:          'entry.111111111',
      prenom:       'entry.222222222',
      matricule:    'entry.333333333',
      departement:  'entry.444444444',
      typeConge:    'entry.555555555',
      dateDebut:    'entry.666666666',
      dateFin:      'entry.777777777',
    },
  },

  declarationAbsence: {
    formId:   import.meta.env.VITE_GFORM_ABSENCE_ID || '1FAIpQLSf_REMPLACEZ_MOI_2',
    fields: {
      nom:          'entry.111111112',
      prenom:       'entry.222222223',
      matricule:    'entry.333333334',
      motif:        'entry.444444445',
      dateAbsence:  'entry.555555556',
    },
  },

  ficheRenseignement: {
    formId:   import.meta.env.VITE_GFORM_FICHE_ID   || '1FAIpQLSf_REMPLACEZ_MOI_3',
    fields: {
      nom:          'entry.111111113',
      prenom:       'entry.222222224',
      email:        'entry.333333335',
      telephone:    'entry.444444446',
      departement:  'entry.555555557',
      grade:        'entry.666666668',
    },
  },
};

/**
 * Encode une valeur pour une URL Google Forms.
 */
const encodeValue = (value) =>
  encodeURIComponent(String(value || '').trim());

/**
 * Génère l'URL d'un Google Form pré-rempli.
 *
 * @param {string} formKey   - Clé dans l'objet FORMS (ex: 'demandeConge')
 * @param {object} data      - Données à pré-remplir (correspondant aux field names)
 * @returns {string}         - URL complète
 */
export const buildFormUrl = (formKey, data = {}) => {
  const form = FORMS[formKey];
  if (!form) {
    console.warn(`[GoogleForms] Formulaire inconnu : "${formKey}"`);
    return '#';
  }

  const base = `https://docs.google.com/forms/d/${form.formId}/viewform`;
  const params = [];

  Object.entries(form.fields).forEach(([dataKey, entryId]) => {
    const value = data[dataKey];
    if (value !== undefined && value !== null && value !== '') {
      params.push(`${entryId}=${encodeValue(value)}`);
    }
  });

  return params.length > 0 ? `${base}?${params.join('&')}` : base;
};

/**
 * Ouvre le formulaire Google dans un nouvel onglet.
 *
 * @param {string} formKey
 * @param {object} data
 */
export const openForm = (formKey, data = {}) => {
  const url = buildFormUrl(formKey, data);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Raccourcis pré-configurés pour l'application OFPPT-RH.
 */
export const openCongeForm = (personnel) => openForm('demandeConge', {
  nom:         personnel?.nom        || '',
  prenom:      personnel?.prenom     || '',
  matricule:   personnel?.matricule  || '',
  departement: personnel?.departement || personnel?.service || '',
});

export const openAbsenceForm = (personnel) => openForm('declarationAbsence', {
  nom:         personnel?.nom       || '',
  prenom:      personnel?.prenom    || '',
  matricule:   personnel?.matricule || '',
  dateAbsence: new Date().toISOString().split('T')[0],
});

export const openFicheForm = (personnel) => openForm('ficheRenseignement', {
  nom:         personnel?.nom        || '',
  prenom:      personnel?.prenom     || '',
  email:       personnel?.email      || '',
  telephone:   personnel?.telephone  || '',
  departement: personnel?.departement || personnel?.service || '',
  grade:       personnel?.grade      || '',
});

export default { buildFormUrl, openForm, openCongeForm, openAbsenceForm, openFicheForm };
