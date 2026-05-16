// ── Jours ────────────────────────────────────────────────────
export const JOURS = [
  { key: 1, label: 'Lundi' },
  { key: 2, label: 'Mardi' },
  { key: 3, label: 'Mercredi' },
  { key: 4, label: 'Jeudi' },
  { key: 5, label: 'Vendredi' },
  { key: 6, label: 'Samedi' },
];

// ── Créneaux horaires (8h → 18h) ────────────────────────────
export const CRENEAUX = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
  '18:00',
];

export const HEURE_DEBUT = '08:00';
export const HEURE_FIN   = '18:00';
export const SLOT_HEIGHT = 48; // px par demi-heure

// ── Types de séance ──────────────────────────────────────────
export const TYPES_SEANCE = [
  { value: 'seance',  label: 'seance',   color: 'bg-blue-500',    light: 'bg-blue-50 border-blue-300 text-blue-800' },
  { value: 'stage',     label: 'stage',      color: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
  { value: 'exam', label: 'exam',  color: 'bg-red-500',     light: 'bg-red-50 border-red-300 text-red-800' },
];

export const getTypeStyle = (type) =>
  TYPES_SEANCE.find(t => t.value === type)?.light ||
  'bg-slate-50 border-slate-300 text-slate-800';

export const getTypeBadge = (type) =>
  TYPES_SEANCE.find(t => t.value === type)?.color || 'bg-slate-400';

// ── Convertit "HH:MM" en nombre de minutes depuis 08:00 ─────
export const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// Calcule la position top et la hauteur d'une séance dans la grille
export const getSlotPosition = (heureDebut, heureFin) => {
  const BASE = timeToMinutes(HEURE_DEBUT); // 480 min
  const start = timeToMinutes(heureDebut) - BASE;
  const duration = timeToMinutes(heureFin) - timeToMinutes(heureDebut);
  const top    = (start / 30) * SLOT_HEIGHT;
  const height = (duration / 30) * SLOT_HEIGHT - 4; // -4px gap
  return { top, height };
};

// ── Données de démo (supprimées pour la production) ──────────
export const MOCK_SEANCES = [];


// ── Fin des constantes ───────────────────────────────────────

