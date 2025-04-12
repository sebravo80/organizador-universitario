import api from './api';

// Obtener todos los eventos
export const getEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Obtener un evento por ID
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Crear un nuevo evento
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Actualizar un evento existente
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Eliminar un evento
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Obtener eventos por curso
export const getEventsByCourse = async (courseId) => {
  try {
    const response = await api.get(`/events/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Obtener eventos por rango de fechas
export const getEventsByDateRange = async (start, end) => {
  try {
    const response = await api.get(`/events/range?start=${start}&end=${end}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};