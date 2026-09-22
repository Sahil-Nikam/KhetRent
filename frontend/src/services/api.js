import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authLogin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const authRegister = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// ── Owner Dashboard ───────────────────────────────────────────────────────────

export const getOwnerDashboard = async () => {
  const response = await api.get('/owner/dashboard');
  return response.data;
};

// ── Equipment — public ────────────────────────────────────────────────────────

export const getCategories = async () => {
  const response = await api.get('/equipment/categories');
  return response.data;
};

export const getEquipmentDetails = async (id) => {
  const response = await api.get(`/equipment/${id}`);
  return response.data;
};

/**
 * Browse / search all equipment (public endpoint — no auth required).
 * @param {Object} params  — { keyword, category, location, maxPrice, availability }
 */
export const browseEquipment = async (params = {}) => {
  // Remove undefined/empty values so they're not sent as empty query params
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const response = await api.get('/equipment/browse', { params: clean });
  return response.data;
};

// ── Equipment — owner-only ────────────────────────────────────────────────────

export const addEquipment = async (equipmentData) => {
  const response = await api.post('/equipment', equipmentData);
  return response.data;
};

export const updateEquipment = async (id, equipmentData) => {
  const response = await api.put(`/equipment/${id}`, equipmentData);
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await api.delete(`/equipment/${id}`);
  return response.data;
};

export const uploadEquipmentImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/equipment/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ── Bookings — farmer ─────────────────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data;
};

// ── Bookings — owner ──────────────────────────────────────────────────────────

export const getOwnerBookings = async () => {
  const response = await api.get('/bookings/owner');
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.put(`/bookings/${id}/status?status=${status}`);
  return response.data;
};

export default api;
