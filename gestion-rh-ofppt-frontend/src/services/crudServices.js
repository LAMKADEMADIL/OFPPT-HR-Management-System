import api from './api';

const createService = (endpoint) => ({
  // We use .then(r => r.data) because Laravel Resources wrap data in a "data" key
  getAll: (params)  => api.get(endpoint, { params }).then(r => r.data),
  getById: (id)     => api.get(`${endpoint}/${id}`).then(r => r.data),
  create: (data)    => api.post(endpoint, data).then(r => r.data),
  update: (id, data)=> api.put(`${endpoint}/${id}`, data).then(r => r.data),
  remove: (id)      => api.delete(`${endpoint}/${id}`).then(r => r.data),
});

// Services
export const personnelService     = createService('/personnels');
export const userService          = createService('/users');
export const congeService         = createService('/conges');
export const absenceService       = createService('/absences');
export const seanceService        = createService('/seances');
export const etablissementService = createService('/etablissements');
export const specialiteService    = createService('/specialites');