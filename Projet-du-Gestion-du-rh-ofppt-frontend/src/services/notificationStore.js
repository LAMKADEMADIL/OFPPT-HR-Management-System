/**
 * notificationStore.js
 * Gestion des notifications en-application avec persistance localStorage.
 * Fonctionne sans backend — notifications générées par les actions CRUD.
 */

const STORAGE_KEY = 'ofppt_notifications';

const TYPES = {
  INFO:    'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER:  'danger',
};

// ── Core store ────────────────────────────────────────────────
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const save = (notifications) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

let _listeners = [];
const notify = () => _listeners.forEach(fn => fn(load()));

export const notificationStore = {
  /** Subscribe to notifications changes */
  subscribe: (fn) => {
    _listeners.push(fn);
    fn(load()); // initial state
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  },

  /** Get all notifications */
  getAll: () => load(),

  /** Get unread count */
  getUnreadCount: () => load().filter(n => !n.read).length,

  /** Add a notification */
  add: ({ title, message, type = TYPES.INFO, link, sendEmail = false, emailParams = null }) => {
    const notifications = load();
    const newNotif = {
      id:        Date.now(),
      title,
      message,
      type,
      link:      link || null,
      read:      false,
      createdAt: new Date().toISOString(),
      sendEmail,
      emailParams,
    };
    notifications.unshift(newNotif); // newest first
    // Keep max 50 notifications
    save(notifications.slice(0, 50));
    notify();
    return newNotif;
  },

  /** Mark one notification as read */
  markRead: (id) => {
    const notifications = load().map(n =>
      n.id === Number(id) ? { ...n, read: true } : n
    );
    save(notifications);
    notify();
  },

  /** Mark all as read */
  markAllRead: () => {
    const notifications = load().map(n => ({ ...n, read: true }));
    save(notifications);
    notify();
  },

  /** Delete one notification */
  remove: (id) => {
    const notifications = load().filter(n => n.id !== Number(id));
    save(notifications);
    notify();
  },

  /** Clear all */
  clear: () => { save([]); notify(); },

  TYPES,
};

// ── Pre-built notification factories ─────────────────────────
export const Notifs = {
  congeDepose: (employe) =>
    notificationStore.add({
      title:   'Nouvelle demande de congé',
      message: `${employe} a soumis une demande de congé.`,
      type:    TYPES.WARNING,
      link:    '/conges',
      sendEmail: true,
    }),

  congeApprouve: (employe) =>
    notificationStore.add({
      title:   'Congé approuvé',
      message: `La demande de congé de ${employe} a été approuvée.`,
      type:    TYPES.SUCCESS,
      link:    '/conges',
    }),

  congeRefuse: (employe) =>
    notificationStore.add({
      title:   'Congé refusé',
      message: `La demande de congé de ${employe} a été refusée.`,
      type:    TYPES.DANGER,
      link:    '/conges',
    }),

  absenceDeclaree: (employe) =>
    notificationStore.add({
      title:   'Absence déclarée',
      message: `Une absence a été déclarée pour ${employe}.`,
      type:    TYPES.WARNING,
      link:    '/absences',
    }),

  personnelAjoute: (nom) =>
    notificationStore.add({
      title:   'Nouveau membre du personnel',
      message: `${nom} a été ajouté(e) au système.`,
      type:    TYPES.SUCCESS,
      link:    '/personnels',
    }),

  emploiModifie: (formateur) =>
    notificationStore.add({
      title:   'Emploi du temps modifié',
      message: `Le planning de ${formateur} a été mis à jour.`,
      type:    TYPES.INFO,
      link:    '/emploi-du-temps',
    }),

  importReussi: (count, type) =>
    notificationStore.add({
      title:   'Import Excel réussi',
      message: `${count} enregistrement(s) de type "${type}" importé(s).`,
      type:    TYPES.SUCCESS,
    }),
};

export default notificationStore;
