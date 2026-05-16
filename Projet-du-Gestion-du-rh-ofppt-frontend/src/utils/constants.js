export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const ROLES = {
  DIRECTEUR_COMPLEXE: 'directeur du complexe', 
  GESTIONNAIRE_CFMR: 'gestionnaire CFMR',
};

export const CONGE_TYPES = {
  ANNUEL: 'annuel',
  MALADIE: 'maladie',
  MATERNITE: 'maternité',
  EXCEPTIONNEL: 'exceptionnel',
  SANS_SOLDE: 'sans_solde',
};

export const STATUT_CONGE = {
  EN_ATTENTE: 'en_attente',
  APPROUVE: 'approuvé',
  REFUSE: 'refusé',
};
export const STATUT_ABSENCE = {
  EN_ATTENTE: 'en_attente',
  APPROUVE: 'approuvé',
  REFUSE: 'refusé',
}
export const MESSAGES = {
  LOAD_ERROR: 'Erreur lors du chargement des données.',
  SAVE_SUCCESS: 'Enregistrement réussi.',
  SAVE_ERROR: 'Erreur lors de l\'enregistrement.',
  DELETE_SUCCESS: 'Suppression réussie.',
  DELETE_ERROR: 'Erreur lors de la suppression.',
  LOGIN_ERROR: 'Email ou mot de passe incorrect.',
  REQUIRED: 'Ce champ est obligatoire.',
  EMAIL_INVALID: 'Adresse email invalide.',
};

export const NAV_LINKS = [
  { to: '/dashboard',      label: 'Tableau de bord',   icon: 'LayoutDashboard' },
  { to: '/personnels',     label: 'Personnels',         icon: 'Users' },
  { to: '/formateurs',     label: 'Formateurs',         icon: 'GraduationCap' },
  { to: '/administratifs', label: 'Administratifs',     icon: 'Briefcase' },
  { to: '/conges',         label: 'Congés',             icon: 'CalendarDays' },
  { to: '/absences',       label: 'Absences',           icon: 'CalendarX' },
  { to: '/users',          label: 'Utilisateurs',       icon: 'UserCog' },
];
