import api from './api';

// Obtener todos los pendientes
export const getPendings = async () => {
  try {
    const response = await api.get('/pendings');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener un pendiente por ID
export const getPendingById = async (id) => {
  try {
    const response = await api.get(`/pendings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear un nuevo pendiente
export const createPending = async (pendingData) => {
  try {
    const response = await api.post('/pendings', pendingData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar un pendiente
export const updatePending = async (id, pendingData) => {
  try {
    const response = await api.put(`/pendings/${id}`, pendingData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar un pendiente
export const deletePending = async (id) => {
  try {
    const response = await api.delete(`/pendings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};