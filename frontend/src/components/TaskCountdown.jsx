// src/components/TaskCountdown.jsx
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Chip } from '@mui/material';
import AlarmIcon from '@mui/icons-material/Alarm';

const TaskCountdown = memo(({ dueDate }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  
  // Calcular días restantes con useMemo
  const daysRemaining = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [dueDate]);
  
  // Determinar color y mensaje según días restantes con useMemo
  const { color, message } = useMemo(() => {
    if (daysRemaining < 0) {
      return { color: 'error', message: 'Atrasada' };
    } else if (daysRemaining === 0) {
      return { color: 'error', message: '¡Hoy es la entrega!' };
    } else if (daysRemaining === 1) {
      return { color: 'warning', message: '¡Vence mañana!' };
    } else if (daysRemaining <= 3) {
      return { color: 'warning', message: `Vence en ${daysRemaining} días` };
    } else {
      return { color: 'success', message: `Vence en ${daysRemaining} días` };
    }
  }, [daysRemaining]);
  
  useEffect(() => {
    setTimeRemaining(message);
  }, [message]);
  
  return (
    <Chip 
      label={timeRemaining} 
      color={color}
      size="small"
      variant="outlined"
      icon={<AlarmIcon />}
    />
  );
});

// Asignar displayName para herramientas de desarrollo
TaskCountdown.displayName = 'TaskCountdown';

export default TaskCountdown;