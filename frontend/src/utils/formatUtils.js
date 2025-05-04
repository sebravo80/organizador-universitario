import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear fecha
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'PPP', { locale: es });
};

// Formatear hora
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'p', { locale: es });
};

// Obtener color de prioridad
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Alta':
      return 'error';
    case 'Media':
      return 'warning';
    case 'Baja':
      return 'success';
    default:
      return 'default';
  }
};

// Obtener color de estado
export const getStatusColor = (status) => {
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

// Calcular duración entre fechas
export const getEventDuration = (startDate, endDate) => {
  const minutes = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60));
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