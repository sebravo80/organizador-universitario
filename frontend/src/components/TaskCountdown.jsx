// src/components/TaskCountdown.jsx
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

const TaskCountdown = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const due = new Date(dueDate);
      
      // Se verifica si la fecha de vencimiento ya pasó
      if (due <= now) {
        setIsExpired(true);
        return;
      }
      
      // Se calcula el tiempo restante
      const days = differenceInDays(due, now);
      const hours = differenceInHours(due, now) % 24;
      const minutes = differenceInMinutes(due, now) % 60;
      
      setTimeLeft({ days, hours, minutes });
    };
    
    // Se calcula el tiempo restante inicialmente
    calculateTimeLeft();
    
    // Se actualiza cada minuto
    const interval = setInterval(calculateTimeLeft, 60000);
    
    // Se limpia intervalo al desmontar
    return () => clearInterval(interval);
  }, [dueDate]);
  
  // Se determina el color según el tiempo restante
  const getColor = () => {
    if (isExpired) {
      return 'error.main';
    }
    
    if (timeLeft.days === 0) {
      if (timeLeft.hours < 6) {
        return 'error.main';
      } else {
        return 'warning.main';
      }
    } else if (timeLeft.days <= 2) {
      return 'warning.main';
    } else {
      return 'success.main';
    }
  };
  
  return (
    <Box sx={{ 
      p: 1, 
      borderRadius: 1,
      backgroundColor: `${getColor()}20`,
      display: 'inline-block'
    }}>
      {isExpired ? (
        <Typography variant="body2" color="error.main" fontWeight="bold">
          ¡Vencida!
        </Typography>
      ) : (
        <Typography variant="body2" color={getColor()} fontWeight="bold">
          {timeLeft.days > 0 && `${timeLeft.days} día${timeLeft.days !== 1 ? 's' : ''} `}
          {timeLeft.hours > 0 && `${timeLeft.hours} hora${timeLeft.hours !== 1 ? 's' : ''} `}
          {timeLeft.days === 0 && `${timeLeft.minutes} minuto${timeLeft.minutes !== 1 ? 's' : ''}`}
        </Typography>
      )}
    </Box>
  );
};

export default TaskCountdown;