import api from './api';

// Obtener todos los eventos
export const getEvents = async () => {
  try {
    console.log('Solicitando eventos al servidor');
    const response = await api.get('/events');
    console.log(`Recibidos ${response.data.length} eventos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener eventos:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Crear un nuevo evento
export const createEvent = async (eventData) => {
  try {
    console.log('Enviando datos de evento al servidor:', eventData);
    const response = await api.post('/events', eventData);
    console.log('Evento creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear evento:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Actualizar un evento existente
export const updateEvent = async (eventId, eventData) => {
  try {
    console.log(`Actualizando evento ${eventId}:`, eventData);
    const response = await api.put(`/events/${eventId}`, eventData);
    console.log('Evento actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar evento:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Eliminar un evento
export const deleteEvent = async (eventId) => {
  try {
    console.log(`Eliminando evento ${eventId}`);
    const response = await api.delete(`/events/${eventId}`);
    console.log('Evento eliminado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar evento:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Obtener eventos por curso
export const getEventsByCourse = async (courseId) => {
  try {
    const response = await api.get(`/events/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener eventos por curso:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Obtener eventos por rango de fechas
export const getEventsByDateRange = async (start, end) => {
  try {
    const response = await api.get(`/events/range?start=${start}&end=${end}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener eventos por rango de fechas:', error.response?.data || error);
    throw error.response?.data || error;
  }
};
