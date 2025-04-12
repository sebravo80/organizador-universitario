import api from './api';

// Obtener todos los cursos
export const getCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener un curso por ID
export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear un nuevo curso
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses', courseData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar un curso
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar un curso
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};