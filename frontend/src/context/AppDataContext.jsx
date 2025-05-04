import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos desde la caché si están disponibles
  useEffect(() => {
    const cachedCourses = localStorage.getItem('cached_courses');
    const cachedTasks = localStorage.getItem('cached_tasks');
    const cachedEvents = localStorage.getItem('cached_events');
    
    if (cachedCourses) setCourses(JSON.parse(cachedCourses));
    if (cachedTasks) setTasks(JSON.parse(cachedTasks));
    if (cachedEvents) setEvents(JSON.parse(cachedEvents));
  }, []);

  // Cargar datos desde la API
  const fetchData = useCallback(async () => {
    if (!isAuth) return;
    
    try {
      setLoading(true);
      
      // Obtener cursos
      const coursesRes = await api.get('/courses');
      setCourses(coursesRes.data);
      localStorage.setItem('cached_courses', JSON.stringify(coursesRes.data));
      
      // Obtener tareas
      const tasksRes = await api.get('/tasks');
      setTasks(tasksRes.data);
      localStorage.setItem('cached_tasks', JSON.stringify(tasksRes.data));
      
      // Obtener eventos
      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data);
      localStorage.setItem('cached_events', JSON.stringify(eventsRes.data));
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  // Cargar datos cuando cambia el estado de autenticación
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Añadir un curso
  const addCourse = useCallback(async (courseData) => {
    try {
      const res = await api.post('/courses', courseData);
      const newCourses = [...courses, res.data];
      setCourses(newCourses);
      localStorage.setItem('cached_courses', JSON.stringify(newCourses));
      return res.data;
    } catch (err) {
      setError('Error al añadir el curso');
      throw err;
    }
  }, [courses]);

  // Actualizar un curso
  const updateCourse = useCallback(async (id, courseData) => {
    try {
      const res = await api.put(`/courses/${id}`, courseData);
      const newCourses = courses.map(course => course._id === id ? res.data : course);
      setCourses(newCourses);
      localStorage.setItem('cached_courses', JSON.stringify(newCourses));
      return res.data;
    } catch (err) {
      setError('Error al actualizar el curso');
      throw err;
    }
  }, [courses]);

  // Eliminar un curso
  const deleteCourse = useCallback(async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      const newCourses = courses.filter(course => course._id !== id);
      setCourses(newCourses);
      localStorage.setItem('cached_courses', JSON.stringify(newCourses));
    } catch (err) {
      setError('Error al eliminar el curso');
      throw err;
    }
  }, [courses]);

  // Funciones similares para tareas y eventos
  const addTask = useCallback(async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      const newTasks = [...tasks, res.data];
      setTasks(newTasks);
      localStorage.setItem('cached_tasks', JSON.stringify(newTasks));
      return res.data;
    } catch (err) {
      setError('Error al añadir la tarea');
      throw err;
    }
  }, [tasks]);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      const newTasks = tasks.map(task => task._id === id ? res.data : task);
      setTasks(newTasks);
      localStorage.setItem('cached_tasks', JSON.stringify(newTasks));
      return res.data;
    } catch (err) {
      setError('Error al actualizar la tarea');
      throw err;
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      const newTasks = tasks.filter(task => task._id !== id);
      setTasks(newTasks);
      localStorage.setItem('cached_tasks', JSON.stringify(newTasks));
    } catch (err) {
      setError('Error al eliminar la tarea');
      throw err;
    }
  }, [tasks]);

  const addEvent = useCallback(async (eventData) => {
    try {
      const res = await api.post('/events', eventData);
      const newEvents = [...events, res.data];
      setEvents(newEvents);
      localStorage.setItem('cached_events', JSON.stringify(newEvents));
      return res.data;
    } catch (err) {
      setError('Error al añadir el evento');
      throw err;
    }
  }, [events]);

  const updateEvent = useCallback(async (id, eventData) => {
    try {
      const res = await api.put(`/events/${id}`, eventData);
      const newEvents = events.map(event => event._id === id ? res.data : event);
      setEvents(newEvents);
      localStorage.setItem('cached_events', JSON.stringify(newEvents));
      return res.data;
    } catch (err) {
      setError('Error al actualizar el evento');
      throw err;
    }
  }, [events]);

  const deleteEvent = useCallback(async (id) => {
    try {
      await api.delete(`/events/${id}`);
      const newEvents = events.filter(event => event._id !== id);
      setEvents(newEvents);
      localStorage.setItem('cached_events', JSON.stringify(newEvents));
    } catch (err) {
      setError('Error al eliminar el evento');
      throw err;
    }
  }, [events]);

  // Refrescar los datos manualmente
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Limpiar caché
  const clearCache = useCallback(() => {
    localStorage.removeItem('cached_courses');
    localStorage.removeItem('cached_tasks');
    localStorage.removeItem('cached_events');
    fetchData();
  }, [fetchData]);

  return (
    <AppDataContext.Provider value={{
      courses, tasks, events,
      loading, error, setError,
      addCourse, updateCourse, deleteCourse,
      addTask, updateTask, deleteTask,
      addEvent, updateEvent, deleteEvent,
      refreshData, clearCache
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);