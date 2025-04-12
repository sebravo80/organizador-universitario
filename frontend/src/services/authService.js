// src/services/authService.js
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
    console.error('Error en registro:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Iniciar sesión
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Obtener datos del usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Actualizar perfil de usuario
export const updateUser = async (userData) => {
  try {
    const response = await api.put('/auth/user', userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Cambiar contraseña
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error.response?.data || error);
    throw error.response?.data || error;
  }
};