import axios from 'axios';

const api = axios.create({
  baseURL: 'https://final-backend-production-d094.up.railway.app',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;