import React, { memo } from 'react';
import {
  Card, CardContent, CardActions, Typography, Box, 
  IconButton, Chip, Avatar, Tooltip, CardActionArea
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

// Formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'PPP', { locale: es });
};

// Obtener color para el estado
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

// Obtener color para la prioridad
const getPriorityColorHex = (priority) => {
  switch (priority) {
    case 'Alta':
      return '#f44336'; // Rojo
    case 'Media':
      return '#fb8c00'; // Naranja
    case 'Baja':
      return '#4caf50'; // Verde
    default:
      return '#9e9e9e'; // Gris
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'Alta':
      return <FlagIcon sx={{ color: getPriorityColorHex(priority), fontSize: '0.9rem' }} />;
    case 'Media':
      return <FlagIcon sx={{ color: getPriorityColorHex(priority), fontSize: '0.9rem' }} />;
    case 'Baja':
      return <FlagIcon sx={{ color: getPriorityColorHex(priority), fontSize: '0.9rem' }} />;
    default:
      return null;
  }
};

const TaskCard = memo(({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete, 
  onReopen 
}) => {
  const cardColor = task.course ? task.course.color : getPriorityColorHex(task.priority);
  const dueDate = new Date(task.dueDate);
  
  return (
    <Card 
      className={`task-card ${task.status === 'Completada' ? 'task-completed' : ''}`}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: task.status === 'Completada' ? 0.8 : 1,
        borderLeft: `5px solid ${cardColor}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)',
        background: task.status === 'Completada' ? 
          'rgba(240, 240, 240, 0.5)' : 
          'rgba(255, 255, 255, 0.85)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: task.status === 'Completada' ? 
          'rgba(0, 0, 0, 0.03)' : 
          `${cardColor}15`
      }}>
        <Chip 
          label={task.priority} 
          size="small"
          icon={getPriorityIcon(task.priority)}
          sx={{ 
            fontSize: '0.75rem',
            bgcolor: getPriorityColorHex(task.priority),
            color: '#fff',
            fontWeight: 'bold'
          }}
        />
        <Chip 
          label={task.status} 
          size="small"
          sx={{
            fontWeight: 500,
            bgcolor: task.status === 'Completada' ? 'success.light' :
                    task.status === 'En progreso' ? 'info.light' : 'warning.light',
            color: '#fff'
          }}
        />
      </Box>

      <CardActionArea onClick={() => onEdit(task)} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ 
          flexGrow: 1, 
          p: { xs: 1.5, sm: 2 },  // Padding reducido en móviles
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="h6" component="h2" sx={{ 
            mb: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            textDecoration: task.status === 'Completada' ? 'line-through' : 'none',
            color: task.status === 'Completada' ? 'text.disabled' : 'text.primary'
          }}>
            {task.title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {task.description && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: { xs: 0.5, sm: 1 }, // Espacio reducido en móviles
                mb: { xs: 0.5, sm: 1 }   // Margen inferior reducido en móviles
              }}>
                <DescriptionIcon 
                  fontSize="small" 
                  color="action" 
                  sx={{ 
                    mt: 0.3, 
                    opacity: 0.7,
                    fontSize: { xs: '0.9rem', sm: '1rem' } // Tamaño de icono reducido en móviles
                  }} 
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: { xs: 1, sm: 2 }, // Solo 1 línea en móviles
                    WebkitBoxOrient: 'vertical',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' } // Tamaño de texto reducido en móviles
                  }}
                >
                  {task.description}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(task.dueDate)}
              </Typography>
            </Box>

            {task.course && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                <Typography variant="body2" color="text.secondary">
                  {task.course.name}
                </Typography>
              </Box>
            )}
            
            {task.status !== 'Completada' && (
              <Box sx={{ mt: 1 }}>
                <TaskCountdown dueDate={task.dueDate} />
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ 
        padding: 1,
        display: 'flex', 
        justifyContent: 'flex-end', 
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: task.status === 'Completada' ? 
          'rgba(0, 0, 0, 0.03)' : 
          'transparent'
      }}>
        {task.status === 'Completada' ? (
          <Tooltip title="Marcar como pendiente">
            <IconButton 
              size="small"
              onClick={() => onReopen(task._id)}
              color="warning"
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Marcar como completada">
            <IconButton 
              size="small"
              onClick={() => onComplete(task._id)}
              color="success"
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Editar tarea">
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar tarea">
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
});

// Asignar displayName para herramientas de desarrollo
TaskCard.displayName = 'TaskCard';

export default TaskCard;