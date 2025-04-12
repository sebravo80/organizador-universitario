import api from './api';

// Obtener todos los eventos
export const getEvents = async () => {
  try {
    const response = await api.get('/schedule');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener un evento por ID
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/schedule/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear un nuevo evento
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/schedule', eventData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar un evento
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/schedule/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar un evento
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/schedule/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener eventos por curso
export const getEventsByCourse = async (courseId) => {
  try {
    const response = await api.get(`/schedule/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};