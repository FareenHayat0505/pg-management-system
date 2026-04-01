import axios from 'axios';

// Base URL of your backend
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://pg-management-system-j9ya.onrender.com/api'
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}); 
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/auth/profile');

// ROOMS
export const getRooms = () => API.get('/rooms');
export const getAvailableRooms = () => API.get('/rooms/available');
export const addRoom = (data) => API.post('/rooms', data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

// TENANTS
export const getTenants = () => API.get('/tenants');
export const addTenant = (data) => API.post('/tenants', data);
export const getMyProfile = () => API.get('/tenants/my-profile');
export const checkoutTenant = (id) => API.put(`/tenants/${id}/checkout`);

// PAYMENTS
export const getPayments = () => API.get('/payments');
export const getMyPayments = () => API.get('/payments/my-payments');
export const createPayment = (data) => API.post('/payments', data);
export const markAsPaid = (id, data) => API.put(`/payments/${id}/pay`, data);
export const getPaymentSummary = () => API.get('/payments/summary');
export const markOverdue = () => API.put('/payments/mark-overdue');

// MAINTENANCE
export const getMaintenanceRequests = () => API.get('/maintenance');
export const getMyRequests = () => API.get('/maintenance/my-requests');
export const createRequest = (data) => API.post('/maintenance', data);
export const sendMessage = (id, data) => API.post(`/maintenance/${id}/message`, data);
export const updateStatus = (id, data) => API.put(`/maintenance/${id}/status`, data);
export const getMaintenanceSummary = () => API.get('/maintenance/summary');

// NOTICES
export const getNotices = () => API.get('/notices');
export const createNotice = (data) => API.post('/notices', data);
export const deleteNotice = (id) => API.delete(`/notices/${id}`); 
export const getProperties = () => API.get('/properties');
export const createProperty = (data) => API.post('/properties', data);
export const getPropertyById = (id) => API.get(`/properties/${id}`);
export const updateProperty = (id, data) => API.put(`/properties/${id}`, data);
export const deleteProperty = (id) => API.delete(`/properties/${id}`); 
export const getBedSummary = () => API.get('/rooms/bed-summary');