import axios from 'axios';

// Determinar la URL base según el entorno
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log("API configurada con URL base:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'  // Añadimos esta línea para asegurar que aceptamos JSON
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
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

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

// Interceptor para detectar respuestas con formato incorrecto
api.interceptors.response.use(
  response => {
    // Verificar si la respuesta es HTML en lugar de JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('La API respondió con HTML en lugar de JSON:', response);
      return Promise.reject(new Error('La API respondió con HTML en lugar de JSON'));
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;