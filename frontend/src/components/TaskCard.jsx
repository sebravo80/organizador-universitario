import React, { memo } from 'react';
import {
  Card, CardContent, CardActions, Typography, Box, 
  IconButton, Chip, Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TaskCountdown from './TaskCountdown';
import '../styles/tasks.css';

// Función para calcular el color de contraste
const calculateContrastColor = (bgColor) => {
  // Eliminar el # si existe
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  
  // Si no es un formato hexadecimal válido, devolver blanco por defecto
  if (color.length !== 6) return '#ffffff';
  
  // Convertir a valores RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calcular la luminosidad (percepción del brillo)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Usar texto negro para colores claros y texto blanco para oscuros
  return luminance > 0.6 ? '#000000' : '#ffffff';
};

// Función para oscurecer un color
const darkenColor = (color, factor) => {
  let hex = color.charAt(0) === '#' ? color.substring(1, 7) : color;
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  r = Math.max(0, Math.floor(r * (1 - factor)));
  g = Math.max(0, Math.floor(g * (1 - factor)));
  b = Math.max(0, Math.floor(b * (1 - factor)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Obtener color de prioridad
const getPriorityColorHex = (priority) => {
  switch (priority) {
    case 'Alta':
      return '#f44336';
    case 'Media':
      return '#ff9800';
    case 'Baja':
      return '#4caf50';
    default:
      return '#757575';
  }
};

// Obtener color de estado
const getStatusColor = (status) => {
  switch (status) {
    case 'Completada':
      return 'success';
    case 'En progreso':
      return 'info';
    case 'Pendiente':
      return 'warning';
    default:
      return 'default';
  }
};

// Formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'PPP', { locale: es });
};

const TaskCard = memo(({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete, 
  onReopen 
}) => {
  const cardColor = task.course ? task.course.color : getPriorityColorHex(task.priority);
  
  return (
    <Card 
      className={`task-card ${task.status === 'Completada' ? 'task-completed' : ''}`}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: task.status === 'Completada' ? 0.7 : 1,
        borderLeft: `4px solid ${cardColor}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ 
            textDecoration: task.status === 'Completada' ? 'line-through' : 'none'
          }}>
            {task.title}
          </Typography>
          
          <Chip 
            label={task.status} 
            color={getStatusColor(task.status)}
            size="small"
            sx={{
              fontWeight: 500,
              textShadow: '0 0 1px rgba(0,0,0,0.2)'
            }}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={task.priority} 
            color={getStatusColor(task.priority)}
            size="small"
            sx={{ 
              mr: 1,
              fontWeight: 500,
            }}
          />
          
          {task.course && (
            <Chip
              avatar={
                <Avatar 
                  sx={{ 
                    bgcolor: task.course.color,
                    color: calculateContrastColor(task.course.color),
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                >
                  {task.course.name.substring(0, 1)}
                </Avatar>
              }
              label={task.course.name}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: task.course.color,
                color: 'text.primary'
              }}
            />
          )}
        </Box>
        
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
        )}
        
        <Typography variant="body2">
          Fecha de entrega: {formatDate(task.dueDate)}
        </Typography>
        
        {task.status !== 'Completada' && (
          <Box sx={{ mt: 2 }}>
            <TaskCountdown dueDate={task.dueDate} />
          </Box>
        )}
      </CardContent>
      
      <CardActions>
        {task.status === 'Completada' ? (
          <IconButton 
            aria-label="reabrir"
            onClick={() => onReopen(task._id)}
            color="warning"
            title="Marcar como pendiente"
          >
            <UndoIcon />
          </IconButton>
        ) : (
          <IconButton 
            aria-label="completar"
            onClick={() => onComplete(task._id)}
            color="success"
            title="Marcar como completada"
          >
            <CheckCircleIcon />
          </IconButton>
        )}
        <IconButton 
          aria-label="editar"
          onClick={() => onEdit(task)}
          title="Editar tarea"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          aria-label="eliminar"
          onClick={() => onDelete(task._id)}
          title="Eliminar tarea"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
});

// Asignar displayName para herramientas de desarrollo
TaskCard.displayName = 'TaskCard';

export default TaskCard;