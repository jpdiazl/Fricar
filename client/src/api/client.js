import axios from 'axios';
import { startGlobalLoading, stopGlobalLoading } from '../utils/loadingBus';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://fricar-server.vercel.app',
});

api.interceptors.request.use((config) => {
  startGlobalLoading();
  const token = localStorage.getItem('prx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  stopGlobalLoading();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  stopGlobalLoading();
  return response;
}, (error) => {
  stopGlobalLoading();
  return Promise.reject(error);
});

export default api;
