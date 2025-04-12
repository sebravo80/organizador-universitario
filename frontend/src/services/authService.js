import api from './api';

// Registrar usuario
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Iniciar sesión
export const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return localStorage.getItem('token') ? true : false;
};