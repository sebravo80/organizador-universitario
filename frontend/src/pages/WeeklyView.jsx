// src/pages/WeeklyView.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Box, Paper, CircularProgress, 
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/scheduleService';
import { getCourses } from '../services/courseService';

function WeeklyView() {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // +1 hora
    allDay: false,
    course: '',
    color: '#4285F4'
  });
  
  const calendarRef = useRef(null);

  // Cargar eventos y cursos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventsData, coursesData] = await Promise.all([
          getEvents(),
          getCourses()
        ]);
        
        // Formatear eventos para FullCalendar
        const formattedEvents = eventsData.map(event => ({
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          backgroundColor: event.color,
          borderColor: event.color,
          extendedProps: {
            course: event.course
          }
        }));
        
        setEvents(formattedEvents);
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: name === 'allDay' ? checked : value
    });
  };

  // Manejar cambio de fecha de inicio
  const handleStartChange = (newDate) => {
    setEventForm({
      ...eventForm,
      start: newDate,
      // Si la fecha de fin es anterior a la nueva fecha de inicio, actualizarla
      end: newDate > eventForm.end ? new Date(newDate.getTime() + 60 * 60 * 1000) : eventForm.end
    });
  };

  // Manejar cambio de fecha de fin
  const handleEndChange = (newDate) => {
    setEventForm({
      ...eventForm,
      end: newDate
    });
  };

  // Manejar cambio de color
  const handleColorChange = (e) => {
    setEventForm({
      ...eventForm,
      color: e.target.value
    });
  };

  // Abrir diálogo para crear evento en fecha seleccionada
  const handleDateSelect = (selectInfo) => {
    setEventForm({
      title: '',
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay,
      course: '',
      color: '#4285F4'
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Abrir diálogo para editar evento existente
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setEventForm({
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end || event.start),
      allDay: event.allDay,
      course: event.extendedProps.course ? event.extendedProps.course._id : '',
      color: event.backgroundColor
    });
    setCurrentEventId(event.id);
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setCurrentEventId(null);
  };

  // Guardar evento (crear o actualizar)
  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      
      const eventData = {
        title: eventForm.title,
        start: eventForm.start,
        end: eventForm.end,
        allDay: eventForm.allDay,
        course: eventForm.course || null,
        color: eventForm.color
      };
      
      if (isEditing) {
        // Actualizar evento existente
        const updatedEvent = await updateEvent(currentEventId, eventData);
        
        // Actualizar eventos en el estado
        setEvents(events.map(event => 
          event.id === currentEventId ? {
            id: updatedEvent._id,
            title: updatedEvent.title,
            start: updatedEvent.start,
            end: updatedEvent.end,
            allDay: updatedEvent.allDay,
            backgroundColor: updatedEvent.color,
            borderColor: updatedEvent.color,
            extendedProps: {
              course: updatedEvent.course
            }
          } : event
        ));
      } else {
        // Crear nuevo evento
        const newEvent = await createEvent(eventData);
        
        // Añadir nuevo evento al estado
        setEvents([...events, {
          id: newEvent._id,
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          allDay: newEvent.allDay,
          backgroundColor: newEvent.color,
          borderColor: newEvent.color,
          extendedProps: {
            course: newEvent.course
          }
        }]);
      }
      
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el evento`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    try {
      setLoading(true);
      await deleteEvent(currentEventId);
      setEvents(events.filter(event => event.id !== currentEventId));
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError('Error al eliminar el evento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Horario Semanal
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading && events.length === 0 ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 'calc(100vh - 200px)' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale={esLocale}
              events={events}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="100%"
              allDaySlot={true}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
            />
          </Box>
        </Paper>
      )}
      
      {/* Diálogo para añadir/editar evento */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Título"
            type="text"
            fullWidth
            variant="outlined"
            value={eventForm.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Curso</InputLabel>
            <Select
              name="course"
              value={eventForm.course}
              onChange={handleChange}
              label="Curso"
            >
              <MenuItem value="">Ninguno</MenuItem>
              {courses.map(course => (
                <MenuItem key={course._id} value={course._id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DateTimePicker
            label="Inicio"
            value={eventForm.start}
            onChange={handleStartChange}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
          />
          <DateTimePicker
            label="Fin"
            value={eventForm.end}
            onChange={handleEndChange}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            minDateTime={eventForm.start}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Color</InputLabel>
            <Select
              name="color"
              value={eventForm.color}
              onChange={handleColorChange}
              label="Color"
            >
              <MenuItem value="#4285F4" sx={{ color: '#4285F4' }}>Azul</MenuItem>
              <MenuItem value="#EA4335" sx={{ color: '#EA4335' }}>Rojo</MenuItem>
              <MenuItem value="#FBBC05" sx={{ color: '#FBBC05' }}>Amarillo</MenuItem>
              <MenuItem value="#34A853" sx={{ color: '#34A853' }}>Verde</MenuItem>
              <MenuItem value="#8E24AA" sx={{ color: '#8E24AA' }}>Púrpura</MenuItem>
              <MenuItem value="#F4511E" sx={{ color: '#F4511E' }}>Naranja</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          {isEditing && (
            <Button 
              onClick={handleDeleteEvent} 
              color="error"
              sx={{ mr: 'auto' }}
            >
              Eliminar
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveEvent} 
            variant="contained"
            disabled={!eventForm.title}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WeeklyView;