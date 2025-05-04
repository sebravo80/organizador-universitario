import api from './api';

// Obtener todos los elementos pendientes
export const getTodoItems = async () => {
  try {
    const response = await api.get('/todos');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear un nuevo elemento pendiente
export const createTodoItem = async (text) => {
  try {
    const response = await api.post('/todos', { text });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar un elemento pendiente
export const updateTodoItem = async (id, data) => {
  try {
    const response = await api.put(`/todos/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar un elemento pendiente
export const deleteTodoItem = async (id) => {
  try {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};