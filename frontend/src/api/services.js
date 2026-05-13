import axiosClient from './axiosClient';

export const parkService = {
  getAll: () => axiosClient.get('/parks'),
  getById: (id) => axiosClient.get(`/parks/${id}`),
  create: (data) => axiosClient.post('/parks', data),
  update: (id, data) => axiosClient.put(`/parks/${id}`, data),
  remove: (id) => axiosClient.delete(`/parks/${id}`),
};

export const authService = {
  login: (data) => axiosClient.post('/auth/login', data),
  register: (data) => axiosClient.post('/auth/register', data),
  me: () => axiosClient.get('/auth/me'),
};

export const reservationService = {
  getAll: () => axiosClient.get('/reservations'),
  getMine: () => axiosClient.get('/reservations/my'),
  create: (data) => axiosClient.post('/reservations', data),
  approve: (id) => axiosClient.patch(`/reservations/${id}/approve`),
  reject: (id) => axiosClient.patch(`/reservations/${id}/reject`),
  cancel: (id) => axiosClient.delete(`/reservations/${id}`),
};

export const eventService = {
  getPublic: () => axiosClient.get('/events/public'),
  getMine: () => axiosClient.get('/events/my'),
  create: (data) => axiosClient.post('/events', data),
  approve: (id) => axiosClient.patch(`/events/${id}/approve`),
  reject: (id) => axiosClient.patch(`/events/${id}/reject`),
};

export const incidentService = {
  getMine: () => axiosClient.get('/incidents/my'),
  getAll: () => axiosClient.get('/incidents'),
  create: (data) => axiosClient.post('/incidents', data),
  updateStatus: (id, estado) => axiosClient.patch(`/incidents/${id}/estado`, { estado }),
};

export const maintenanceService = {
  getAll: () => axiosClient.get('/maintenance'),
  create: (data) => axiosClient.post('/maintenance', data),
  updateStatus: (id, estado) => axiosClient.patch(`/maintenance/${id}/estado`, { estado }),
};

export const inventoryService = {
  getAll: () => axiosClient.get('/inventory'),
  getById: (id) => axiosClient.get(`/inventory/${id}`),
  create: (data) => axiosClient.post('/inventory', data),
  update: (id, data) => axiosClient.put(`/inventory/${id}`, data),
  remove: (id) => axiosClient.delete(`/inventory/${id}`),
};
