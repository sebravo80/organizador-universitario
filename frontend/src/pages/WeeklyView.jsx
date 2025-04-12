// src/pages/WeeklyView.jsx
import { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, CircularProgress, Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService';
import { getCourses } from '../services/courseService';

function WeeklyView() {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estado para el diálogo de evento
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hora después
    allDay: false,
    course: '',
    type: 'otro'
  });
  
  // Cargar eventos y cursos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar eventos y cursos en paralelo
        const [eventsData, coursesData] = await Promise.all([
          getEvents().catch(err => {
            console.error('Error al cargar eventos:', err);
            throw err;
          }),
          getCourses().catch(err => {
            console.error('Error al cargar cursos:', err);
            throw err;
          })
        ]);
        
        console.log('Eventos cargados:', eventsData.length);
        console.log('Cursos cargados:', coursesData.length);
        
        // Formatear eventos para FullCalendar
        const formattedEvents = eventsData.map(event => ({
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          extendedProps: {
            description: event.description,
            course: event.course,
            type: event.type
          },
          backgroundColor: event.course?.color || '#3788d8'
        }));
        
        setEvents(formattedEvents);
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejar clic en fecha/hora
  const handleDateClick = (info) => {
    // Resetear formulario
    setEventForm({
      title: '',
      description: '',
      start: info.date,
      end: new Date(info.date.getTime() + 60 * 60 * 1000), // 1 hora después
      allDay: info.allDay,
      course: '',
      type: 'otro'
    });
    
    setEditingEvent(null);
    setOpenEventDialog(true);
  };
  
  // Manejar clic en evento
  const handleEventClick = (info) => {
    const event = info.event;
    
    // Llenar formulario con datos del evento
    setEventForm({
      title: event.title,
      description: event.extendedProps.description || '',
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : null,
      allDay: event.allDay,
      course: event.extendedProps.course?._id || '',
      type: event.extendedProps.type || 'otro'
    });
    
    setEditingEvent({
      _id: event.id,
      ...event.extendedProps
    });
    
    setOpenEventDialog(true);
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: name === 'allDay' ? checked : value
    });
  };
  
  // Manejar cambios en las fechas
  const handleDateChange = (name, date) => {
    setEventForm({
      ...eventForm,
      [name]: date
    });
  };
  
  // Guardar evento
  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Formatear fechas a ISO
      const formattedEvent = {
        ...eventForm,
        start: eventForm.start instanceof Date ? eventForm.start.toISOString() : eventForm.start,
        end: eventForm.end instanceof Date ? eventForm.end.toISOString() : eventForm.end
      };
      
      console.log('Enviando evento formateado:', formattedEvent);
      
      let savedEvent;
      if (editingEvent) {
        // Actualizar evento existente
        savedEvent = await updateEvent(editingEvent._id, formattedEvent);
        console.log('Evento actualizado:', savedEvent);
      } else {
        // Crear nuevo evento
        savedEvent = await createEvent(formattedEvent);
        console.log('Evento creado:', savedEvent);
      }
      
      // Actualizar lista de eventos
      await fetchEvents();
      
      // Cerrar diálogo y mostrar mensaje de éxito
      setOpenEventDialog(false);
      setSuccess(editingEvent ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setError('Error al guardar el evento: ' + (err.msg || err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar evento
  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await deleteEvent(editingEvent._id);
      
      // Actualizar lista de eventos
      await fetchEvents();
      
      // Cerrar diálogo y mostrar mensaje de éxito
      setOpenEventDialog(false);
      setSuccess('Evento eliminado correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setError('Error al eliminar el evento: ' + (err.msg || err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar eventos
  const fetchEvents = async () => {
    try {
      const eventsData = await getEvents();
      
      // Formatear eventos para FullCalendar
      const formattedEvents = eventsData.map(event => ({
        id: event._id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        extendedProps: {
          description: event.description,
          course: event.course,
          type: event.type
        },
        backgroundColor: event.course?.color || '#3788d8'
      }));
      
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('Error al cargar los eventos. Por favor, intenta de nuevo más tarde.');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Horario Semanal
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Paper sx={{ p: 2 }}>
        {loading && !events.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            locale={esLocale}
            allDaySlot={true}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            height="auto"
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
          />
        )}
      </Paper>
      
      {/* Diálogo para crear/editar evento */}
      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
        </DialogTitle>
        
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Título"
            name="title"
            value={eventForm.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Descripción"
            name="description"
            value={eventForm.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
          
          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="Fecha y hora de inicio"
              value={eventForm.start}
              onChange={(date) => handleDateChange('start', date)}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="Fecha y hora de fin"
              value={eventForm.end}
              onChange={(date) => handleDateChange('end', date)}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              disabled={eventForm.allDay}
            />
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={eventForm.allDay}
                onChange={handleChange}
                name="allDay"
              />
            }
            label="Todo el día"
            sx={{ mt: 1 }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Curso</InputLabel>
            <Select
              name="course"
              value={eventForm.course}
              onChange={handleChange}
              label="Curso"
            >
              <MenuItem value="">Ninguno</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={eventForm.type}
              onChange={handleChange}
              label="Tipo"
            >
              <MenuItem value="clase">Clase</MenuItem>
              <MenuItem value="examen">Examen</MenuItem>
              <MenuItem value="taller">Taller</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions>
          {editingEvent && (
            <Button 
              onClick={handleDeleteEvent} 
              color="error"
              disabled={loading}
            >
              Eliminar
            </Button>
          )}
          <Button onClick={() => setOpenEventDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveEvent} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WeeklyView;