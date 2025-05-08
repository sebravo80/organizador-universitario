// src/pages/Events.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, CardActions, IconButton,
  Stack, Pagination
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format, differenceInMinutes } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventCard from '../components/EventCard';
import { scheduleEventNotification } from '../services/notificationService';

const Events = () => {
  const { isAuth } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  
  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      color: '#3788d8',
      course: '',
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data);
        
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStartDateChange = (date) => {
    let newEndDate = eventForm.endDate;
    if (eventForm.endDate && date && date > eventForm.endDate) {
      newEndDate = new Date(date.getTime() + 60 * 60 * 1000);
    }
    
    setEventForm({
      ...eventForm,
      startDate: date,
      endDate: newEndDate
    });
  };
  
  const handleEndDateChange = (date) => {
    setEventForm({
      ...eventForm,
      endDate: date
    });
  };
  
  const saveEvent = async () => {
    try {
      if (!eventForm.title.trim() || !eventForm.startDate || !eventForm.endDate) {
        setError('Por favor, ingresa un título y fechas válidas.');
        return;
      }
      
      if (eventForm.endDate <= eventForm.startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio.');
        return;
      }
      
      await handleSubmit();
      
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el evento. Por favor, intenta nuevamente.`);
    }
  };
  
  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      
      setEvents(events.filter(event => event._id !== id));
      
      setError(null);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setError('Error al eliminar el evento. Por favor, intenta nuevamente.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'p', { locale: es });
  };
  
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
  
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  const paginatedEvents = sortedEvents.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = Math.ceil(sortedEvents.length / rowsPerPage);
  
  const handleSubmit = async () => {
    const eventData = {
      title: eventForm.title,
      description: eventForm.description,
      startDate: eventForm.startDate,
      endDate: eventForm.endDate,
      location: eventForm.location,
      color: eventForm.color,
      course: eventForm.course === "" ? null : eventForm.course
    };

    try {
      let savedEvent;
      
      if (isEditing) {
        const res = await api.put(`/events/${currentEventId}`, eventData);
        savedEvent = res.data;
        setEvents(events.map(event => event._id === currentEventId ? savedEvent : event));
      } else {
        const res = await api.post('/events', eventData);
        savedEvent = res.data;
        setEvents([...events, savedEvent]);
      }
      
      // Programar notificación solo si el evento se guardó correctamente
      if (savedEvent && savedEvent._id) {
        try {
          await scheduleEventNotification(savedEvent);
        } catch (notifError) {
          console.error('Error al programar la notificación del evento:', notifError);
          // No interrumpimos el flujo si la notificación falla
        }
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
          <>
            <Grid container spacing={3}>
              {paginatedEvents.map(event => (
                <Grid item xs={12} sm={6} md={4} key={event._id} className="staggered-item">
                  <EventCard 
                    event={event} 
                    onEdit={handleOpenEdit}
                    onDelete={deleteEvent}
                  />
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  showFirstButton 
                  showLastButton
                  siblingCount={1}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                />
              </Stack>
            )}
          </>
        )}
      </Box>
      
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
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="course-select-label">Curso</InputLabel>
              <Select
                labelId="course-select-label"
                id="course"
                name="course"
                value={eventForm.course === null || eventForm.course === undefined ? "" : eventForm.course}
                onChange={handleChange}
                label="Curso"
                displayEmpty
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {courses.map((course) => (
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