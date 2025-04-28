// src/pages/Events.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format, differenceInMinutes } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RoomIcon from '@mui/icons-material/Room';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';

const Events = () => {
  const { isAuth } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de evento
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: null,
    endDate: null,
    location: '',
    color: '#4CAF50',
    course: ''
  });
  
  // Cargar eventos y cursos
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
  
  // Abrir diálogo para crear evento
  const handleOpenCreate = () => {
    const now = new Date();
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);
    
    setEventForm({
      title: '',
      description: '',
      startDate: now,
      endDate: oneHourLater,
      location: '',
      color: '#4CAF50',
      course: ''
    });
    
    setOpen(true);
    setIsEditing(false);
  };
  
  // Abrir diálogo para editar evento
  const handleOpenEdit = (event) => {
    setIsEditing(true);
    setCurrentEventId(event._id);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: event.location || '',
      color: event.color || '#4CAF50',
      course: event.course ? event.course._id : ''
    });
    setOpen(true);
  };
  
  // Cerrar diálogo
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentEventId(null);
    setEventForm({
      title: '',
      description: '',
      startDate: null,
      endDate: null,
      location: '',
      color: '#4CAF50',
      course: ''
    });
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambio de fecha de inicio
  const handleStartDateChange = (date) => {
    // Si la fecha de fin es anterior a la nueva fecha de inicio, ajustarla
    let newEndDate = eventForm.endDate;
    if (eventForm.endDate && date && date > eventForm.endDate) {
      // Establecer la fecha de fin una hora después de la fecha de inicio
      newEndDate = new Date(date.getTime() + 60 * 60 * 1000);
    }
    
    setEventForm({
      ...eventForm,
      startDate: date,
      endDate: newEndDate
    });
  };
  
  // Manejar cambio de fecha de fin
  const handleEndDateChange = (date) => {
    setEventForm({
      ...eventForm,
      endDate: date
    });
  };
  
  // Crear o actualizar evento
  const saveEvent = async () => {
    try {
      // Validar que se haya ingresado un título y fechas
      if (!eventForm.title.trim() || !eventForm.startDate || !eventForm.endDate) {
        setError('Por favor, ingresa un título y fechas válidas.');
        return;
      }
      
      // Validar que la fecha de fin sea posterior a la fecha de inicio
      if (eventForm.endDate <= eventForm.startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio.');
        return;
      }
      
      await handleSubmit();
      
      // Cerrar diálogo
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el evento. Por favor, intenta nuevamente.`);
    }
  };
  
  // Eliminar evento
  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      
      // Eliminar el evento de la lista
      setEvents(events.filter(event => event._id !== id));
      
      setError(null);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setError('Error al eliminar el evento. Por favor, intenta nuevamente.');
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
  };
  
  // Formatear hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'p', { locale: es });
  };
  
  // Calcular duración del evento en horas y minutos
  const getEventDuration = (startDate, endDate) => {
    const minutes = differenceInMinutes(new Date(endDate), new Date(startDate));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minutos`;
    } else if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${remainingMinutes} minutos`;
    }
  };
  
  // Ordenar eventos por fecha
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  const handleSubmit = async () => {
    try {
      const eventData = {
        ...eventForm,
        // Si course es una cadena vacía, envíala tal cual
        // El backend la manejará como null
      };
      
      if (isEditing) {
        // Lógica para editar evento existente
        const res = await api.put(`/events/${currentEventId}`, eventData);
        
        // Actualizar el evento en la lista
        setEvents(events.map(event => event._id === currentEventId ? res.data : event));
      } else {
        // Lógica para crear nuevo evento
        const res = await api.post('/events', eventData);
        
        // Agregar el nuevo evento a la lista
        setEvents([...events, res.data]);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el evento. Por favor, intenta nuevamente.`);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando eventos...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Eventos
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ mb: 3 }}
        >
          Nuevo Evento
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {sortedEvents.length === 0 ? (
          <Typography>No tienes eventos registrados.</Typography>
        ) : (
          <Grid container spacing={3}>
            {sortedEvents.map(event => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card sx={{ 
                  borderLeft: `4px solid ${event.color || '#4CAF50'}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {formatDate(event.startDate)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Duración: {getEventDuration(event.startDate, event.endDate)}
                    </Typography>
                    
                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                    
                    {event.course && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Curso: {event.course.name}
                      </Typography>
                    )}
                    
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {event.description}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <IconButton 
                      aria-label="editar"
                      onClick={() => handleOpenEdit(event)}
                      title="Editar evento"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="eliminar"
                      onClick={() => deleteEvent(event._id)}
                      title="Eliminar evento"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Diálogo para crear/editar evento */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Título del evento"
              name="title"
              value={eventForm.title}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Descripción"
              name="description"
              multiline
              rows={3}
              value={eventForm.description}
              onChange={handleChange}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DateTimePicker
                    label="Fecha y hora de inicio"
                    value={eventForm.startDate}
                    onChange={handleStartDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DateTimePicker
                    label="Fecha y hora de fin"
                    value={eventForm.endDate}
                    onChange={handleEndDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDateTime={eventForm.startDate}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            
            <TextField
              margin="normal"
              fullWidth
              id="location"
              label="Ubicación"
              name="location"
              value={eventForm.location}
              onChange={handleChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="course-label">Curso relacionado</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                name="course"
                value={eventForm.course || ""}
                label="Curso relacionado"
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Ninguno</MenuItem>
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              id="color"
              label="Color"
              name="color"
              type="color"
              value={eventForm.color}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={saveEvent} variant="contained">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Events;