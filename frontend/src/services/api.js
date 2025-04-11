import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configurar interceptor para incluir token en las peticiones
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/user')
};

// Servicios de cursos
export const courseService = {
  getCourses: () => api.get('/courses'),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`)
};

// Servicios de tareas
export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};

// Servicios de horario
export const scheduleService = {
  getEvents: () => api.get('/schedule'),
  createEvent: (eventData) => api.post('/schedule', eventData),
  updateEvent: (id, eventData) => api.put(`/schedule/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/schedule/${id}`)
};

export default api;