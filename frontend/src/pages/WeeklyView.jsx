// src/pages/WeeklyView.jsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { scheduleEventNotification } from '../services/notificationService';
import { 
  Container, Typography, Box, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch,
  Avatar, Chip, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { Link } from 'react-router-dom';
import '../styles/calendar.css';
import { convertCoursesToEvents } from '../utils/scheduleHelper';

const WeeklyView = () => {
  const { isAuth } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de evento rápido
  const [open, setOpen] = useState(false);
  const [quickEvent, setQuickEvent] = useState({
    title: '',
    startDate: null,
    endDate: null,
    color: '#4CAF50'
  });

  // Añadir este estado
  const [showCourseSchedules, setShowCourseSchedules] = useState(true);

  // Añade este nuevo estado
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);

  // Añadir estos nuevos estados para los modales de tareas y eventos
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTaskInfo, setSelectedTaskInfo] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEventInfo, setSelectedEventInfo] = useState(null);
  
  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener eventos
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data);
        
        // Obtener cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        
        // Obtener tareas
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
        
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
  
  // Añade este useEffect para aplicar estilos directamente a los elementos del DOM
  useEffect(() => {
    if (!loading) {
      const applyStyles = () => {
        // Selecciona todas las celdas del calendario
        const cells = document.querySelectorAll('.fc-timegrid-slot, .fc-daygrid-day, .fc-col-header-cell, .fc-timegrid-axis');
        cells.forEach(cell => {
          cell.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
        });
        
        // Selecciona los encabezados
        const headers = document.querySelectorAll('.fc-col-header-cell, .fc-timegrid-axis');
        headers.forEach(header => {
          header.style.backgroundColor = 'rgba(0, 0, 0, 0.18)';
        });
      };
      
      // Aplica los estilos iniciales y configura un observer para cambios en el DOM
      applyStyles();
      const observer = new MutationObserver(applyStyles);
      observer.observe(document.querySelector('.fc'), { 
        childList: true, 
        subtree: true 
      });
      
      return () => observer.disconnect();
    }
  }, [loading]);
  
  // Memoizar eventos para el calendario
  const calendarEvents = useMemo(() => {
    // Obtener eventos de cursos (horarios) solo si está activada la opción
    const courseScheduleEvents = showCourseSchedules ? convertCoursesToEvents(courses) : [];
    
    return [
      // Eventos regulares
      ...events.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        backgroundColor: event.color || (event.course ? event.course.color : '#4CAF50'),
        borderColor: event.color || (event.course ? event.course.color : '#4CAF50'),
        textColor: '#fff',
        extendedProps: {
          description: event.description,
          location: event.location,
          type: 'event',
          course: event.course
        }
      })),
      
      // Tareas (como eventos de día completo en la fecha de vencimiento)
      ...tasks.map(task => ({
        id: `task-${task._id}`,
        title: `📝 ${task.title}`,
        start: task.dueDate,
        allDay: true,
        backgroundColor: task.status === 'Completada' ? '#9E9E9E' : getPriorityColor(task.priority),
        borderColor: task.status === 'Completada' ? '#9E9E9E' : getPriorityColor(task.priority),
        textColor: '#fff',
        extendedProps: {
          description: task.description,
          type: 'task',
          status: task.status,
          priority: task.priority,
          course: task.course
        }
      })),
      
      // Añadir los horarios de cursos
      ...courseScheduleEvents
    ];
  }, [events, tasks, courses, showCourseSchedules]); // Añadir showCourseSchedules a las dependencias
  
  // Obtener color de prioridad
  function getPriorityColor(priority) {
    switch (priority) {
      case 'Alta':
        return '#F44336';
      case 'Media':
        return '#FF9800';
      case 'Baja':
        return '#4CAF50';
      default:
        return '#2196F3';
    }
  }
  
  // Convertir funciones de manejo de eventos a useCallback
  const handleDateClick = useCallback((info) => {
    // Calcular hora de fin (1 hora después)
    const startDate = info.date;
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    setQuickEvent({
      title: '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      color: '#4CAF50'
    });
    
    setOpen(true);
  }, []);
  
  const handleEventClick = useCallback((info) => {
    const { event } = info;
    const eventType = event.extendedProps.type;
    
    if (eventType === 'task') {
      // Mostrar información de la tarea en un modal
      const taskId = event.id.replace('task-', '');
      
      // Encontrar la tarea completa para obtener todos sus datos
      const task = tasks.find(t => t._id === taskId);
      
      if (task) {
        setSelectedTaskInfo({
          id: task._id,
          title: task.title,
          description: task.description || 'Sin descripción',
          dueDate: new Date(task.dueDate),
          priority: task.priority,
          status: task.status,
          color: getPriorityColor(task.priority),
          course: task.course ? task.course.name : 'No asignado',
          courseId: task.course ? task.course._id : null,
          courseColor: task.course ? task.course.color : null
        });
        setTaskModalOpen(true);
      }
    } else if (eventType === 'course-schedule') {
      // Mostrar información del curso en un modal (código existente)
      const courseId = event.extendedProps.courseId;
      
      // Encontrar el curso completo para obtener todos sus datos
      const course = courses.find(c => c._id === courseId);
      
      if (course) {
        setSelectedCourseInfo({
          id: courseId,
          title: event.title,
          location: event.extendedProps.location || 'No especificada',
          professor: event.extendedProps.professor || 'No especificado',
          courseCode: course.courseCode || 'No especificado',
          color: event.backgroundColor,
          dayTime: `${event.extendedProps.dayName || ''} ${event.extendedProps.startTime || ''} - ${event.extendedProps.endTime || ''}`,
          description: event.extendedProps.description || ''
        });
        setCourseModalOpen(true);
      }
    } else {
      // Mostrar detalles del evento en un modal
      const eventId = event.id;
      const selectedEvent = events.find(e => e._id === eventId);
      
      if (selectedEvent) {
        setSelectedEventInfo({
          id: selectedEvent._id,
          title: selectedEvent.title,
          description: selectedEvent.description || 'Sin descripción',
          startDate: new Date(selectedEvent.startDate),
          endDate: new Date(selectedEvent.endDate),
          location: selectedEvent.location || 'No especificada',
          color: selectedEvent.color || '#4CAF50',
          course: selectedEvent.course ? selectedEvent.course.name : 'No asignado',
          courseId: selectedEvent.course ? selectedEvent.course._id : null
        });
        setEventModalOpen(true);
      }
    }
  }, [courses, events, tasks]); // Dependencias actualizadas
  
  // Manejar cambios en el formulario de evento rápido
  const handleQuickEventChange = (e) => {
    setQuickEvent({
      ...quickEvent,
      [e.target.name]: e.target.value
    });
  };
  
  // Manejar cambio de fecha de inicio
  const handleStartDateChange = (date) => {
    // Si la fecha de fin es anterior a la nueva fecha de inicio, ajustarla
    let newEndDate = quickEvent.endDate;
    if (quickEvent.endDate && date && date > quickEvent.endDate) {
      // Establecer la fecha de fin una hora después de la fecha de inicio
      newEndDate = new Date(date.getTime() + 60 * 60 * 1000);
    }
    
    setQuickEvent({
      ...quickEvent,
      startDate: date,
      endDate: newEndDate
    });
  };
  
  // Manejar cambio de fecha de fin
  const handleEndDateChange = (date) => {
    setQuickEvent({
      ...quickEvent,
      endDate: date
    });
  };
  
  // Cerrar diálogo
  const handleClose = () => {
    setOpen(false);
    setQuickEvent({
      title: '',
      startDate: null,
      endDate: null,
      color: '#4CAF50'
    });
  };
  
  // Crear evento rápido
  const createQuickEvent = async () => {
    try {
      // Validar que se haya ingresado un título y fechas
      if (!quickEvent.title.trim() || !quickEvent.startDate || !quickEvent.endDate) {
        setError('Por favor, ingresa un título y fechas válidas.');
        return;
      }
      
      // Validar que la fecha de fin sea posterior a la fecha de inicio
      if (quickEvent.endDate <= quickEvent.startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio.');
        return;
      }
      
      // Crear evento
      const eventData = {
        title: quickEvent.title,
        startDate: quickEvent.startDate,
        endDate: quickEvent.endDate,
        color: quickEvent.color
      };
      
      const res = await api.post('/events', eventData);
      await scheduleEventNotification(res.data);
      setEvents([...events, res.data]);
      
      // Cerrar diálogo
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al crear evento rápido:', err);
      setError('Error al crear el evento. Por favor, intenta nuevamente.');
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Calendario Semanal
          </Typography>
          
          <Box>
            <Button 
              component={Link}
              to="/events"
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              Gestionar Eventos
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Typography>Cargando calendario...</Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showCourseSchedules}
                    onChange={(e) => setShowCourseSchedules(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mostrar horario de clases"
              />
            </Box>
            <Box 
              sx={{ 
                height: 'calc(100vh - 200px)', 
                minHeight: '600px',
                '& .fc': {
                  '--fc-page-bg-color': 'transparent',
                  '--fc-neutral-bg-color': 'rgba(0, 0, 0, 0.12)',
                  '--fc-border-color': 'rgba(255, 255, 255, 0.15)',
                }
              }}
              className="custom-calendar-container"
            >
              <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek"}
                  headerToolbar={{
                    left: window.innerWidth < 768 ? 'prev,next' : 'prev,next today',
                    center: 'title',
                    right: window.innerWidth < 768 ? 'timeGridDay,dayGridMonth' : 'timeGridDay,timeGridWeek,dayGridMonth'
                  }}
                  locale={esLocale}
                  events={calendarEvents} // Mantener esto igual
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  editable={false}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  allDaySlot={true}
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  height="100%"
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                  }}
                  // Añadir esta propiedad para manejar eventos recurrentes en vista diaria
                  datesSet={(dateInfo) => {
                    // Este callback se ejecuta cuando cambia la vista o la fecha
                    const currentView = dateInfo.view.type;
                    const currentDate = dateInfo.start;
                    
                    // Si estamos en vista diaria, necesitamos asegurarnos que se muestren
                    // los eventos recurrentes del horario para el día actual
                    if (currentView === 'timeGridDay') {
                      console.log('Vista diaria activa, fecha:', currentDate);
                    }
                  }}
                  eventDidMount={(info) => {
                    // Configuración para eventos de horario
                    if (info.event.extendedProps.type === 'course-schedule') {
                      info.el.classList.add('course-schedule-event');
                      const titleEl = info.el.querySelector('.fc-event-title');
                      if (titleEl) {
                        titleEl.innerHTML = `<span style="font-weight:bold;">🎓 ${info.event.title}</span>`;
                        if (info.event.extendedProps.location) {
                          titleEl.innerHTML += `<br><small>Sala: ${info.event.extendedProps.location}</small>`;
                        }
                      }
                    } else if (info.event.extendedProps.type === 'event') {
                    info.el.classList.add('custom-event');
                    // Personalizar eventos regulares
                    const titleEl = info.el.querySelector('.fc-event-title');
                    if (titleEl) {
                      titleEl.innerHTML = `<span style="font-weight:bold;">📅 ${info.event.title}</span>`;
                      if (info.event.extendedProps.location) {
                        titleEl.innerHTML += `<br><small>Lugar: ${info.event.extendedProps.location}</small>`;
                      }
                    }
                  }
                }}
              />
            </Box>
          </>
        )}
      </Box>
      
      {/* Diálogo para crear evento rápido */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Evento Rápido</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Título del evento"
              name="title"
              value={quickEvent.title}
              onChange={handleQuickEventChange}
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha y hora de inicio"
                  value={quickEvent.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />
              </LocalizationProvider>
            </Box>
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha y hora de fin"
                  value={quickEvent.endDate}
                  onChange={handleEndDateChange}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  minDateTime={quickEvent.startDate}
                />
              </LocalizationProvider>
            </Box>
            
            <TextField
              margin="normal"
              fullWidth
              id="color"
              label="Color"
              name="color"
              type="color"
              value={quickEvent.color}
              onChange={handleQuickEventChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={createQuickEvent} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles del curso */}
      <Dialog 
        open={courseModalOpen} 
        onClose={() => setCourseModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCourseInfo && (
          <>
            <DialogTitle sx={{ 
              borderLeft: `4px solid ${selectedCourseInfo.color}`,
              bgcolor: `${selectedCourseInfo.color}15`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: selectedCourseInfo.color, mr: 1 }}>
                  <SchoolIcon />
                </Avatar>
                {selectedCourseInfo.title}
              </Box>
              <Chip 
                label={selectedCourseInfo.courseCode} 
                size="small"
                sx={{ bgcolor: `${selectedCourseInfo.color}30`, fontWeight: 'bold' }}
              />
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon sx={{ color: selectedCourseInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Horario" 
                    secondary={selectedCourseInfo.dayTime} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <RoomIcon sx={{ color: selectedCourseInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sala" 
                    secondary={selectedCourseInfo.location} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon sx={{ color: selectedCourseInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profesor" 
                    secondary={selectedCourseInfo.professor} 
                  />
                </ListItem>
              </List>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => setCourseModalOpen(false)} 
                color="primary"
              >
                Cerrar
              </Button>
              <Button 
                component={Link} 
                to={`/courses?id=${selectedCourseInfo.id}`}
                variant="contained" 
                sx={{ 
                  bgcolor: selectedCourseInfo.color,
                  '&:hover': { bgcolor: selectedCourseInfo.color, filter: 'brightness(0.9)' }
                }}
                startIcon={<EditIcon />}
              >
                Ver Curso
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal de detalles de tarea */}
      <Dialog 
        open={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedTaskInfo && (
          <>
            <DialogTitle sx={{ 
              borderLeft: `4px solid ${selectedTaskInfo.color}`,
              bgcolor: `${selectedTaskInfo.color}15`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: selectedTaskInfo.color, mr: 1 }}>
                  <AssignmentIcon />
                </Avatar>
                {selectedTaskInfo.title}
              </Box>
              <Chip 
                label={selectedTaskInfo.status} 
                color={selectedTaskInfo.status === 'Completada' ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon sx={{ color: selectedTaskInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fecha de vencimiento" 
                    secondary={format(selectedTaskInfo.dueDate, 'PPP, p', { locale: es })}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FlagIcon sx={{ color: selectedTaskInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Prioridad" 
                    secondary={selectedTaskInfo.priority} 
                  />
                </ListItem>
                
                {selectedTaskInfo.courseId && (
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon sx={{ color: selectedTaskInfo.courseColor || selectedTaskInfo.color }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Curso" 
                      secondary={selectedTaskInfo.course} 
                    />
                  </ListItem>
                )}
                
                {selectedTaskInfo.description && (
                  <ListItem>
                    <ListItemIcon>
                      <DescriptionIcon sx={{ color: selectedTaskInfo.color }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Descripción" 
                      secondary={selectedTaskInfo.description} 
                    />
                  </ListItem>
                )}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => setTaskModalOpen(false)} 
                color="primary"
              >
                Cerrar
              </Button>
              <Button 
                component={Link} 
                to={`/tasks?id=${selectedTaskInfo.id}`}
                variant="contained" 
                sx={{ 
                  bgcolor: selectedTaskInfo.color,
                  '&:hover': { bgcolor: selectedTaskInfo.color, filter: 'brightness(0.9)' }
                }}
                startIcon={<EditIcon />}
              >
                Ver Tarea
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal de detalles de evento */}
      <Dialog 
        open={eventModalOpen} 
        onClose={() => setEventModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEventInfo && (
          <>
            <DialogTitle sx={{ 
              borderLeft: `4px solid ${selectedEventInfo.color}`,
              bgcolor: `${selectedEventInfo.color}15`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: selectedEventInfo.color, mr: 1 }}>
                  <EventIcon />
                </Avatar>
                {selectedEventInfo.title}
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DateRangeIcon sx={{ color: selectedEventInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fecha" 
                    secondary={format(selectedEventInfo.startDate, 'PPP', { locale: es })}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon sx={{ color: selectedEventInfo.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Horario" 
                    secondary={`${format(selectedEventInfo.startDate, 'p', { locale: es })} - ${format(selectedEventInfo.endDate, 'p', { locale: es })}`}
                  />
                </ListItem>
                
                {selectedEventInfo.location !== 'No especificada' && (
                  <ListItem>
                    <ListItemIcon>
                      <RoomIcon sx={{ color: selectedEventInfo.color }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Ubicación" 
                      secondary={selectedEventInfo.location} 
                    />
                  </ListItem>
                )}
                
                {selectedEventInfo.courseId && (
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon sx={{ color: selectedEventInfo.color }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Curso relacionado" 
                      secondary={selectedEventInfo.course} 
                    />
                  </ListItem>
                )}
                
                {selectedEventInfo.description !== 'Sin descripción' && (
                  <ListItem>
                    <ListItemIcon>
                      <DescriptionIcon sx={{ color: selectedEventInfo.color }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Descripción" 
                      secondary={selectedEventInfo.description} 
                    />
                  </ListItem>
                )}
              </List>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => setEventModalOpen(false)} 
                color="primary"
              >
                Cerrar
              </Button>
              <Button 
                component={Link} 
                to={`/events?id=${selectedEventInfo.id}`}
                variant="contained" 
                sx={{ 
                  bgcolor: selectedEventInfo.color,
                  '&:hover': { bgcolor: selectedEventInfo.color, filter: 'brightness(0.9)' }
                }}
                startIcon={<EditIcon />}
              >
                Ver Evento
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default React.memo(WeeklyView);