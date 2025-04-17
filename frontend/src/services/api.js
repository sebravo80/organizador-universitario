// src/services/api.js
import axios from 'axios';

// Determinar la URL base según el entorno
const baseURL = import.meta.env.PROD 
  ? 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para mostrar las solicitudes en la consola (solo en desarrollo)
api.interceptors.request.use(
  config => {
    console.log('Enviando solicitud:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data ? (
        config.url.includes('/auth') || config.url.includes('/users') 
          ? { ...config.data, password: config.data.password ? '***' : undefined }
          : config.data
      ) : undefined
    });
    return config;
  },
  error => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

export default api;