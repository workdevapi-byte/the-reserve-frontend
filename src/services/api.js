import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://workdevapi-byte-the-reserve-backend.vercel.app/',
  headers: { 'Content-Type': 'application/json' },
});

// Add Authorization Header
api.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const banksApi = {
  list: () => api.get('/banks'),
  create: (data) => api.post('/banks', data),
  update: (id, data) => api.put(`/banks/${id}`, data),
  delete: (id) => api.delete(`/banks/${id}`),
};

export const expensesApi = {
  list: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const incomeApi = {
  list: () => api.get('/income'),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const insightsApi = {
  categoryTotals: () => api.get('/insights/category'),
  topCategory: () => api.get('/insights/top-category'),
  spendingByCategory: (category) => api.get('/insights/category-spending', { params: { category } }),
};

export default api;

