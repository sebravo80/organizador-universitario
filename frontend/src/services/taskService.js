import api from './api';

// Obtener todas las tareas
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener una tarea por ID
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear una nueva tarea
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar una tarea
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar una tarea
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};