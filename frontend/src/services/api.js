import axios from 'axios';

// Obtener URL base del archivo .env según el entorno
const baseURL = import.meta.env.VITE_API_URL || 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api';
console.log("API configurada con URL base:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir el token en cada solicitud
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;