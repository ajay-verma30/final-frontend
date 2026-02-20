import axios from 'axios';

const api = axios.create({
  baseURL: 'https://final-backend-1-2vg5.onrender.com',
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