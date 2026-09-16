import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
export const getComplaints = () => api.get('/complaints');
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const getHeatmap = () => api.get('/complaints/heatmap');
export const submitComplaint = (data) => api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateStatus = (id, status) => api.patch(`/complaints/${id}/status`, { status });
export const verifyComplaint = (id, payload) => api.post(`/complaints/${id}/verify`, payload);