// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function Dashboard() {
  const { user, isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);

        // Obtener tareas
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);

        // Obtener eventos
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data);

        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>Cargando datos...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Bienvenido/a a tu Dashboard</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard-content">
        {/* Contenido del dashboard */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h2>
              Mis Cursos <Link to="/courses" className="see-all-link">VER TODOS</Link>
            </h2>
            {courses.length > 0 ? (
              <div className="courses-list">
                {/* Mostrar cursos */}
                {courses.map(course => (
                  <div key={course._id} className="course-item">
                    {/* Contenido del curso */}
                    {course.name}
                  </div>
                ))}
              </div>
            ) : (
              <p>No tienes cursos registrados.</p>
            )}
          </div>

          <div className="dashboard-card">
            <h2>
              Tareas Próximas <Link to="/tasks" className="see-all-link">VER TODAS</Link>
            </h2>
            {tasks.length > 0 ? (
              <div className="tasks-list">
                {/* Mostrar tareas */}
                {tasks.map(task => (
                  <div key={task._id} className="task-item">
                    {/* Contenido de la tarea */}
                    {task.title}
                  </div>
                ))}
              </div>
            ) : (
              <p>No tienes tareas pendientes.</p>
            )}
          </div>

          <div className="dashboard-card">
            <h2>
              Eventos Próximos <Link to="/events" className="see-all-link">VER CALENDARIO</Link>
            </h2>
            {events.length > 0 ? (
              <div className="events-list">
                {/* Mostrar eventos */}
                {events.map(event => (
                  <div key={event._id} className="event-item">
                    {/* Contenido del evento */}
                    {event.title}
                  </div>
                ))}
              </div>
            ) : (
              <p>No tienes eventos próximos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;