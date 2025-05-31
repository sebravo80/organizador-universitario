// importar dependencias 
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, TextField, InputAdornment, Tabs, Tab, Paper, Fab, Fade, Grid} 
  from '@mui/material';
//importar iconos de mui
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import TodayIcon from '@mui/icons-material/Today';
import UpcomingIcon from '@mui/icons-material/Upcoming';
//importar los componentes
import EventItem from '../components/events/EventItem';
import EventForm from '../components/events/EventForm';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';
import Loading from '../components/Loading';
import { format, isAfter, isBefore, isToday, startOfToday, addDays, isWithinInterval } from 'date-fns';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// componente de los eventos
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  const { user } = useContext(AuthContext);
  
  // Cargar eventos
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Filtrado de eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const today = startOfToday();
    const eventStart = new Date(event.startDate);
    const nextWeek = addDays(today, 7);
    
    switch (filter) {
      case 0: // Todos
        return matchesSearch;
      case 1: // Hoy
        return matchesSearch && isToday(eventStart);
      case 2: // Próximos
        return matchesSearch && 
              !isToday(eventStart) && 
              isWithinInterval(eventStart, { start: addDays(today, 1), end: nextWeek });
      case 3: // Pasados
        return matchesSearch && isBefore(eventStart, today);
      case 4: // Futuros
        return matchesSearch && isAfter(eventStart, today);
      default:
        return matchesSearch;
    }
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  // Manejadores
  const handleAddEvent = () => {
    setCurrentEvent(null);
    setOpenForm(true);
  };
  
  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setOpenForm(true);
  };
  
  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setOpenDeleteDialog(true);
  };
  
  const confirmDeleteEvent = async () => {
    try {
      await api.delete(`/events/${eventToDelete}`);
      setEvents(events.filter(event => event._id !== eventToDelete));
      console.log('Evento eliminado');
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };
  
  const handleSaveEvent = async (eventData) => {
    try {
      if (currentEvent) {
        // Actualizar evento
        const response = await api.put(`/events/${currentEvent._id}`, eventData);
        setEvents(events.map(event => event._id === currentEvent._id ? response.data : event));
        console.log('Evento actualizado');
      } else {
        // Crear evento
        const response = await api.post('/events', eventData);
        setEvents([...events, response.data]);
        console.log('Evento creado');
      }
      setOpenForm(false);
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };
  
  if (loading) {
    return <Loading message="Cargando eventos" showLogo={true} />;
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" sx={{display: 'flex', alignItems: 'center', gap: 1, color: '#72002a', fontWeight: 'bold',}}>
          <CalendarMonthIcon color="primary" fontSize="large" />
          Eventos
        </Typography>
      </Box>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nuevo Evento
          </Button>
        </Box>
        
        <Tabs 
          value={filter} 
          onChange={(e, newValue) => setFilter(newValue)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<EventIcon />} label="Todos" />
          <Tab icon={<TodayIcon />} label="Hoy" />
          <Tab icon={<UpcomingIcon />} label="Esta semana" />
          <Tab icon={<EventBusyIcon />} label="Pasados" />
          <Tab icon={<CalendarMonthIcon />} label="Futuros" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredEvents.length === 0 ? (
        <Paper 
          elevation={1}
          sx={{ 
            textAlign: 'center', 
            p: 4, 
            my: 3,
            borderRadius: 2,
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Box sx={{ mb: 1, opacity: 0.7 }}>
            <CalendarMonthIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay eventos{filter > 0 ? ' que coincidan con este filtro' : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 450 }}>
            {filter > 0 
              ? 'Prueba con otro filtro o crea un nuevo evento'
              : 'Añade tu primer evento para empezar a organizar tu agenda'
            }
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
            sx={{ px: 3, py: 1 }}
          >
            Añadir evento
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id} className="staggered-item">
              <EventItem
                event={event}
                onEdit={() => handleEditEvent(event)}
                onDelete={() => handleDeleteEvent(event._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Botón flotante para añadir eventos, solo para moviles */}
      <Fade in={true}>
        <Fab
          color="primary"
          aria-label="añadir evento"
          sx={{ position: 'fixed', bottom: 16, right: 16, display: { sm: 'none' } }}
          onClick={handleAddEvent}
        >
          <AddIcon />
        </Fab>
      </Fade>
      
      {/* Modal de Formulario */}
      <EventForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSaveEvent}
        event={currentEvent}
      />
      
      {/* Diálogo de Confirmación de Eliminación */}
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDeleteEvent}
        title="Eliminar Evento"
        content="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
      />
    </Container>
  );
};

export default Events;
