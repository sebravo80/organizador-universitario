// src/pages/WeeklyView.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Container, Typography, Box, Paper } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

const WeeklyView = () => {
  const { isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  
  // Mapeo de abreviaturas de días a números de día de la semana
  const dayMap = {
    'Lun': 1, // Lunes
    'Mar': 2, // Martes
    'Mié': 3, // Miércoles
    'Jue': 4, // Jueves
    'Vie': 5, // Viernes
    'Sáb': 6, // Sábado
    'Dom': 0  // Domingo
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        
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
  
  // Convertir cursos y eventos a formato de FullCalendar
  useEffect(() => {
    const courseEvents = [];
    
    // Procesar cursos
    courses.forEach(course => {
      if (course.scheduleStrings && course.scheduleStrings.length > 0) {
        course.scheduleStrings.forEach(scheduleStr => {
          // Parsear el string de horario (ej: "Lun 10:00-12:00")
          const parts = scheduleStr.split(' ');
          if (parts.length !== 2) return;
          
          const dayAbbr = parts[0];
          const times = parts[1].split('-');
          if (times.length !== 2) return;
          
          const startTime = times[0];
          const endTime = times[1];
          
          // Obtener el número de día de la semana
          const dayOfWeek = dayMap[dayAbbr];
          if (dayOfWeek === undefined) return;
          
          // Crear evento recurrente
          courseEvents.push({
            title: course.name,
            daysOfWeek: [dayOfWeek],
            startTime,
            endTime,
            backgroundColor: course.color,
            borderColor: course.color,
            extendedProps: {
              type: 'course',
              professor: course.professor
            }
          });
        });
      }
    });
    
    // Procesar eventos
    const eventItems = events.map(event => ({
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      backgroundColor: event.color,
      borderColor: event.color,
      extendedProps: {
        type: 'event',
        description: event.description,
        location: event.location
      }
    }));
    
    setCalendarEvents([...courseEvents, ...eventItems]);
  }, [courses, events]);
  
  // Renderizar información del evento al hacer clic
  const handleEventClick = (info) => {
    const { event } = info;
    const { extendedProps } = event;
    
    let content = `<strong>${event.title}</strong><br>`;
    
    if (extendedProps.type === 'course') {
      if (extendedProps.professor) {
        content += `Profesor: ${extendedProps.professor}<br>`;
      }
      content += `Horario: ${event.startTime} - ${event.endTime}`;
    } else if (extendedProps.type === 'event') {
      content += `Fecha: ${new Date(event.start).toLocaleDateString()}<br>`;
      content += `Hora: ${new Date(event.start).toLocaleTimeString()} - ${new Date(event.end).toLocaleTimeString()}<br>`;
      
      if (extendedProps.location) {
        content += `Lugar: ${extendedProps.location}<br>`;
      }
      
      if (extendedProps.description) {
        content += `Descripción: ${extendedProps.description}`;
      }
    }
    
    // Mostrar información (puedes usar una librería de tooltips o modales)
    alert(content.replace(/<br>/g, '\n').replace(/<strong>|<\/strong>/g, ''));
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando calendario...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Calendario Semanal
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', minHeight: '600px' }}>
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="100%"
            locale={esLocale}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short'
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default WeeklyView;