// Dung Pham Anh: Các hàm gọi API theo nhóm nghiệp vụ, tương ứng các endpoint của backend
import { http } from './client.js';

const enc = encodeURIComponent;

export const authApi = {
  login: (credentials) => http.post('/auth/login', credentials),
  me: () => http.get('/auth/me'),
  logout: () => http.post('/auth/logout'),
  changePassword: (data) => http.post('/auth/change-password', data),
};

export const catalogApi = {
  titles: (query) => http.get('/titles', query),
  title: (isbn) => http.get(`/titles/${enc(isbn)}`),
  createTitle: (data) => http.post('/titles', data),
  updateTitle: (isbn, data) => http.put(`/titles/${enc(isbn)}`, data),
  deleteTitle: (isbn) => http.delete(`/titles/${enc(isbn)}`),
  importTitles: (file) => http.upload('/titles/import', file),
  addCopies: (isbn, data) => http.post(`/titles/${enc(isbn)}/copies`, data),
  updateCopy: (barcode, data) => http.put(`/copies/${enc(barcode)}`, data),
  setCopyStatus: (barcode, data) => http.patch(`/copies/${enc(barcode)}/status`, data),
  categories: () => http.get('/categories'),
  saveCategory: (id, data) => (id ? http.put(`/categories/${enc(id)}`, data) : http.post('/categories', data)),
  deleteCategory: (id) => http.delete(`/categories/${enc(id)}`),
  publishers: () => http.get('/publishers'),
  savePublisher: (id, data) => (id ? http.put(`/publishers/${enc(id)}`, data) : http.post('/publishers', data)),
  deletePublisher: (id) => http.delete(`/publishers/${enc(id)}`),
};

export const readerApi = {
  list: (query) => http.get('/readers', query),
  detail: (id) => http.get(`/readers/${enc(id)}`),
  create: (data) => http.post('/readers', data),
  update: (id, data) => http.put(`/readers/${enc(id)}`, data),
  setLocked: (id, data) => http.patch(`/readers/${enc(id)}/lock`, data),
  renewCard: (id) => http.post(`/readers/${enc(id)}/renew-card`),
  resetPassword: (id) => http.post(`/readers/${enc(id)}/reset-password`),
  importExcel: (file) => http.upload('/readers/import', file),
};

export const circulationApi = {
  checkReader: (code) => http.get(`/circulation/readers/${enc(code)}`),
  checkCopy: (barcode, readerId) => http.get(`/circulation/copies/${enc(barcode)}`, { readerId }),
  createLoan: (data) => http.post('/loans', data),
  returnCopy: (data) => http.post('/circulation/return', data),
  reportLost: (data) => http.post('/circulation/lost', data),
  loans: (query) => http.get('/loans', query),
  loan: (id) => http.get(`/loans/${enc(id)}`),
  renew: (id) => http.post(`/loans/${enc(id)}/renew`),
};

export const reservationApi = {
  list: (query) => http.get('/reservations', query),
  create: (isbn) => http.post('/reservations', { isbn }),
  cancel: (id) => http.post(`/reservations/${enc(id)}/cancel`),
};

export const fineApi = {
  list: (query) => http.get('/fines', query),
  suggest: (query) => http.get('/fines/suggest', query),
  get: (id) => http.get(`/fines/${enc(id)}`),
  create: (data) => http.post('/fines', data),
  pay: (id) => http.post(`/fines/${enc(id)}/pay`),
};

export const reportApi = {
  summary: () => http.get('/reports/summary'),
  get: (type, query) => http.get(`/reports/${type}`, query),
  exportXlsx: (type, query) => http.download(`/reports/${type}/export`, query),
};

export const adminApi = {
  accounts: (query) => http.get('/accounts', query),
  createAccount: (data) => http.post('/accounts', data),
  updateAccount: (id, data) => http.put(`/accounts/${enc(id)}`, data),
  setStatus: (id, status) => http.patch(`/accounts/${enc(id)}/status`, { status }),
  setRole: (id, role) => http.patch(`/accounts/${enc(id)}/role`, { role }),
  resetPassword: (id, password) => http.post(`/accounts/${enc(id)}/reset-password`, { password }),
  settings: () => http.get('/settings'),
  updateSettings: (data) => http.put('/settings', data),
  auditLogs: (query) => http.get('/audit-logs', query),
  downloadTemplate: (type) => http.download(`/templates/${type}`),
};

export const meApi = {
  profile: () => http.get('/me/profile'),
  loans: () => http.get('/me/loans'),
  reservations: (query) => http.get('/me/reservations', query),
  fines: (query) => http.get('/me/fines', query),
};
