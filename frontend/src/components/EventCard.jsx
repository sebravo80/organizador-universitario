// se importan las librerías necesarias
import React, { memo } from 'react';
import {
  Card, CardContent, CardActions, Typography, Box, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RoomIcon from '@mui/icons-material/Room';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

// Esto es para que la fecha sea en español
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'PPP', { locale: es });
};

// cambiamos el formato de la hora a 24 horas
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'p', { locale: es });
};

// con este componente se calcula la duración del evento en horas y minutos
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

// se define el componente de la tarjeta de evento con memo para evitar renderizados innecesarios
// esto con fin de tener un mejor rendimiento
const EventCard = memo(({ 
  event, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card sx={{ 
      borderLeft: `4px solid ${event.color || '#4CAF50'}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            {formatDate(event.startDate)} • {formatTime(event.startDate)} - {formatTime(event.endDate)}
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
          onClick={() => onEdit(event)}
          title="Editar evento"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          aria-label="eliminar"
          onClick={() => onDelete(event._id)}
          title="Eliminar evento"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
});

// Asignar displayName para herramientas de desarrollo 
EventCard.displayName = 'EventCard';

export default EventCard;