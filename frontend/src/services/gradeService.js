import api from './api';

// Obtener todas las notas
export const getGrades = async () => {
  try {
    const response = await api.get('/grades');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener notas por curso
export const getGradesByCourse = async (courseId) => {
  try {
    const response = await api.get(`/grades/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear una nueva nota
export const createGrade = async (gradeData) => {
  try {
    const response = await api.post('/grades', gradeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar una nota
export const updateGrade = async (id, gradeData) => {
  try {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar una nota
export const deleteGrade = async (id) => {
  try {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};