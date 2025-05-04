import api from './api';

// Obtener todos los pendientes
export const getTodos = async () => {
  try {
    const response = await api.get('/todos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener pendientes:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Crear un nuevo pendiente
export const createTodo = async (text) => {
  try {
    const response = await api.post('/todos', { text });
    return response.data;
  } catch (error) {
    console.error('Error al crear pendiente:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Actualizar un pendiente
export const updateTodo = async (todoId, todoData) => {
  try {
    const response = await api.put(`/todos/${todoId}`, todoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar pendiente:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Eliminar un pendiente
export const deleteTodo = async (todoId) => {
  try {
    const response = await api.delete(`/todos/${todoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar pendiente:', error.response?.data || error);
    throw error.response?.data || error;
  }
};