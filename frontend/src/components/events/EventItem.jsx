import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Chip, 
  Tooltip,
  Paper,
  CardActionArea
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const EventItem = ({ event, onEdit, onDelete }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const formatDate = (date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };
  
  const formatTime = (date) => {
    return format(date, 'HH:mm', { locale: es });
  };
  
  // Extraer el día para mostrarlo grande
  const day = format(startDate, 'd');
  const month = format(startDate, 'MMM', { locale: es });
  
  return (
    <Card 
      elevation={2}
      sx={{ 
        mb: 2, 
        position: 'relative',
        overflow: 'visible',
        borderLeft: `5px solid ${event.color || '#4CAF50'}`,
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {/* Fecha destacada en el lateral */}
        <Box 
          sx={{ 
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            bgcolor: 'action.hover',
            borderRight: '1px solid',
            borderColor: 'divider',
            width: '80px',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {day}
          </Typography>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
            {month}
          </Typography>
        </Box>
        
        <CardActionArea onClick={() => onEdit(event)} sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                {event.title}
              </Typography>
              
              {event.course && (
                <Chip 
                  size="small" 
                  label={event.course.name} 
                  sx={{ 
                    bgcolor: event.course.color || event.color || '#4CAF50',
                    color: 'white',
                    fontWeight: 'medium',
                    ml: 1,
                  }} 
                />
              )}
            </Box>
            
            {event.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {event.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {formatDate(startDate)} {startDate.toDateString() !== endDate.toDateString() && ` - ${formatDate(endDate)}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {formatTime(startDate)} - {formatTime(endDate)}
                </Typography>
              </Box>
              
              {event.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {event.location}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          p: 1,
          justifyContent: 'space-around' 
        }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(event)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => onDelete(event._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default EventItem;