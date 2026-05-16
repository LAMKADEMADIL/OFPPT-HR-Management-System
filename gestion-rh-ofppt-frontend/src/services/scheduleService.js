import api from './api';

/**
 * Schedule / Emploi du Temps — Service API
 * Endpoints attendus côté Laravel :
 *   GET    /seances                   → liste (filtres: etablissement_id, formateur_id, groupe_id, semaine)
 *   GET    /seances/:id               → détail
 *   POST   /seances                   → créer
 *   PUT    /seances/:id               → modifier
 *   DELETE /seances/:id               → supprimer
 *   GET    /etablissements            → liste des 6 établissements
 *   GET    /salles?etablissement_id=  → salles d'un établissement
 *   GET    /groupes?etablissement_id= → groupes d'un établissement
 *   GET    /modules                   → liste des modules
 */

const scheduleService = {
  // ── Séances ──────────────────────────────────────────────
  getSeances: (params = {}) =>
    api.get('/seances', { params }).then(r => r.data),

  getSeanceById: (id) =>
    api.get(`/seances/${id}`).then(r => r.data),

  createSeance: (data) =>
    api.post('/seances', data).then(r => r.data),

  updateSeance: (id, data) =>
    api.put(`/seances/${id}`, data).then(r => r.data),

  deleteSeance: (id) =>
    api.delete(`/seances/${id}`).then(r => r.data),

  // ── Référentiels ─────────────────────────────────────────
  getEtablissements: () =>
    api.get('/etablissements').then(r => r.data),

  getSalles: (etablissementId) =>
    api.get('/salles', { params: { etablissement_id: etablissementId } }).then(r => r.data),

  getGroupes: (etablissementId) =>
    api.get('/groupes', { params: { etablissement_id: etablissementId } }).then(r => r.data),

  getModules: () =>
    api.get('/modules').then(r => r.data),

  getFormateurs: () =>
    api.get('/formateurs').then(r => r.data),

  /**
   * Récupère les séances d'un mois entier.
   * @param {number} month   - Numéro du mois (1–12)
   * @param {number} year    - Année (ex: 2026)
   * @param {object} filters - { etablissement_id, formateur_id }
   */
  getMonthlySchedule: (month, year, filters = {}) =>
    api
      .get('/seances/monthly', { params: { month, year, ...filters } })
      .then(r => r.data),
};

export default scheduleService;
