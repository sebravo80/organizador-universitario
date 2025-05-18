
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
    throw error.response?.data || { msg: 'Error de autenticación' };
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
export const getUserInfo = async () => {
  try {
    const response = await api.get('/auth');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    throw error;
  }
};

// Actualizar perfil de usuario
export const updateUser = async (userData) => {
  try {
    console.log("Datos enviados para actualización:", userData);
    const response = await api.put('/auth/user', userData);
    console.log("Respuesta recibida:", response);
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error; 
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

// Solicitar restablecimiento de contraseña
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Restablecer contraseña con token
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Error al restablecer contraseña:', error.response?.data || error);
    throw error.response?.data || error;
  }
};
