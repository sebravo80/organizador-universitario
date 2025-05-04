import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const AppDataContext = createContext({
  courses: [],
  tasks: [],
  events: [],
  loading: true,
  error: null,
});

export const AppDataProvider = ({ children }) => {
  const { isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos desde la API
  const fetchData = useCallback(async () => {
    if (!isAuth) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Intentar obtener datos en caché primero
      try {
        const cachedCourses = localStorage.getItem('cached_courses');
        const cachedTasks = localStorage.getItem('cached_tasks');
        const cachedEvents = localStorage.getItem('cached_events');
        
        if (cachedCourses) setCourses(JSON.parse(cachedCourses));
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));
        if (cachedEvents) setEvents(JSON.parse(cachedEvents));
      } catch (cacheError) {
        console.warn('Error al cargar caché:', cacheError);
      }
      
      // Obtener cursos
      try {
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        localStorage.setItem('cached_courses', JSON.stringify(coursesRes.data));
      } catch (courseErr) {
        console.error('Error al cargar cursos:', courseErr);
      }
      
      // Obtener tareas
      try {
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
        localStorage.setItem('cached_tasks', JSON.stringify(tasksRes.data));
      } catch (taskErr) {
        console.error('Error al cargar tareas:', taskErr);
      }
      
      // Obtener eventos
      try {
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data);
        localStorage.setItem('cached_events', JSON.stringify(eventsRes.data));
      } catch (eventErr) {
        console.error('Error al cargar eventos:', eventErr);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error general al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  // Cargar datos cuando cambia el estado de autenticación
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    courses,
    tasks,
    events,
    loading,
    error,
    setCourses,
    setTasks,
    setEvents,
    setError,
    refreshData: fetchData
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);