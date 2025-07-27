import axios from 'axios';
import { Capacitor } from '@capacitor/core';

let baseURL = 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api';


if (Capacitor.isNativePlatform()) {
  console.log('Ejecutando en dispositivo nativo, usando URL:', baseURL);
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

api.interceptors.request.use(request => {
  console.log(`[${new Date().toISOString()}] Enviando ${request.method} a: ${request.url}`);
  console.log('Headers:', JSON.stringify(request.headers));
  console.log('Data:', request.data ? JSON.stringify(request.data) : 'Sin datos');
  return request;
});

api.interceptors.response.use(
  response => {
    console.log(`[${new Date().toISOString()}] Respuesta ${response.status} de: ${response.config.url}`);
    return response;
  },
  error => {
    console.error('Error API:', error);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data ? JSON.stringify(error.response.data) : 'Sin datos');
    return Promise.reject(error);
  }
);

export default api;
