// src/pages/WeeklyView.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem
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
import { Link } from 'react-router-dom';

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
  
  // Convertir eventos para FullCalendar
  const calendarEvents = [
    // Eventos
    ...events.map(event => ({
      id: event._id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      backgroundColor: event.color || '#4CAF50',
      borderColor: event.color || '#4CAF50',
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
    }))
  ];
  
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
  
  // Manejar clic en fecha para crear evento rápido
  const handleDateClick = (info) => {
    // Calcular hora de fin (1 hora después)
    const startDate = new Date(info.dateStr);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    setQuickEvent({
      title: '',
      startDate,
      endDate,
      color: '#4CAF50'
    });
    
    setOpen(true);
  };
  
  // Manejar clic en evento
  const handleEventClick = (info) => {
    const { event } = info;
    const eventType = event.extendedProps.type;
    
    if (eventType === 'task') {
      // Redirigir a la página de tareas
      window.location.href = '/tasks';
    } else {
      // Mostrar detalles del evento
      const eventId = event.id;
      window.location.href = `/events?id=${eventId}`;
    }
  };
  
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
      
      // Agregar el nuevo evento a la lista
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
          <Box sx={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <FullCalendar
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale={esLocale}
              events={calendarEvents}
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
            />
          </Box>
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
    </Container>
  );
};

export default WeeklyView;