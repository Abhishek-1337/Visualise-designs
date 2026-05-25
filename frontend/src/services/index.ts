import api from './api';

export const authService = {
  getOAuthConfig: () => api.get('/auth/config'),
  verifyToken: () => api.get('/auth/verify'),
  register: (data) => api.post('/auth/register', data),
  tenantRegister: (data) => api.post('/auth/tenant/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: () => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/auth/google`,
  githubLogin: () => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/auth/github`,
  microsoftLogin: () => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/auth/microsoft`,
  setToken: (token) => localStorage.setItem('authToken', token),
  getToken: () => localStorage.getItem('authToken'),
  removeToken: () => localStorage.removeItem('authToken'),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateRole: (id, data) => api.patch(`/users/${id}/role`, data),
  deactivateUser: (id) => api.patch(`/users/${id}/deactivate`),
  activateUser: (id) => api.patch(`/users/${id}/activate`),
};

export const contactService = {
  getAll: (params) => api.get('/contacts', { params }),
  getStats: () => api.get('/contacts/stats'),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  search: (q) => api.get('/contacts/search', { params: { q } }),
  export: () => api.get('/contacts/export', { responseType: 'blob' }),
};

export const dealService = {
  getAll: (params) => api.get('/deals', { params }),
  getPipeline: () => api.get('/deals/pipeline'),
  getStats: () => api.get('/deals/stats'),
  getById: (id) => api.get(`/deals/${id}`),
  create: (data) => api.post('/deals', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  updateStage: (id, data) => api.patch(`/deals/${id}/stage`, data),
  delete: (id) => api.delete(`/deals/${id}`),
};

export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getStats: () => api.get('/projects/stats'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  createMilestone: (projectId, data) => api.post(`/projects/${projectId}/milestones`, data),
  updateMilestone: (milestoneId, data) => api.put(`/projects/milestones/${milestoneId}`, data),
  completeMilestone: (milestoneId) => api.patch(`/projects/milestones/${milestoneId}/complete`),
  deleteMilestone: (milestoneId) => api.delete(`/projects/milestones/${milestoneId}`),
  addMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getMyTasks: (params) => api.get('/tasks/my', { params }),
  getTodaysTasks: () => api.get('/tasks/my/today'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.patch(`/tasks/${id}/status`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const communicationService = {
  getAll: (params) => api.get('/communications', { params }),
  getStats: () => api.get('/communications/stats'),
  getById: (id) => api.get(`/communications/${id}`),
  create: (data) => api.post('/communications', data),
  update: (id, data) => api.put(`/communications/${id}`, data),
  delete: (id) => api.delete(`/communications/${id}`),
  getByContact: (contactId) => api.get(`/communications/contact/${contactId}`),
};

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  getStats: () => api.get('/invoices/stats'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  updateStatus: (id, data) => api.patch(`/invoices/${id}/status`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getByContact: (contactId) => api.get(`/invoices/contact/${contactId}`),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
  getFinancial: () => api.get('/dashboard/financial'),
  getTodaysTasks: () => api.get('/dashboard/tasks'),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

export const activityService = {
  getAll: (params) => api.get('/activities', { params }),
  getRecent: () => api.get('/activities/recent'),
  create: (data) => api.post('/activities', data),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const inviteService = {
  create: (data) => api.post('/invites', data),
  getAll: () => api.get('/invites'),
  getByToken: (token) => api.get(`/invites/${token}`),
  accept: (token, data) => api.post(`/invites/${token}/accept`, data),
  cancel: (id) => api.patch(`/invites/${id}/cancel`),
};

export const fileService = {
  getAll: (params) => api.get('/files', { params }),
  getById: (id) => api.get(`/files/${id}`),
  upload: (formData) => api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/files/${id}`),
  getByContact: (contactId) => api.get(`/files/contact/${contactId}`),
  getByProject: (projectId) => api.get(`/files/project/${projectId}`),
};

export const paymentService = {
  getPayments: (params) => api.get('/payments', { params }),
  createCheckoutSession: (data) => api.post('/payments/create-checkout-session', data),
};

export const taskSummaryService = {
  getDailySummaries: (params) => api.get('/tasks/summary', { params }),
};

export const seedService = {
  seed: () => api.post('/seed'),
  forceSeed: () => api.post('/seed/force'),
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId: string) => api.get(`/messages/${userId}`),
  send: (data: { receiverId: string; content: string }) => api.post('/messages', data),
};
