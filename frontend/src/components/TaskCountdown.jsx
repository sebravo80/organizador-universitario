// src/components/TaskCountdown.jsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, 
  Chip, Divider, Alert, CircularProgress
} from '@mui/material';
import { getTasks } from '../services/taskService';

// Función para calcular días restantes
const getDaysRemaining = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Función para obtener color según días restantes
const getCountdownColor = (days) => {
  if (days < 0) return 'error';
  if (days === 0) return 'error';
  if (days <= 2) return 'warning';
  if (days <= 5) return 'info';
  return 'success';
};

// Función para obtener texto según días restantes
const getCountdownText = (days) => {
  if (days < 0) return `¡Vencida hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}!`;
  if (days === 0) return '¡Vence hoy!';
  if (days === 1) return 'Vence mañana';
  return `Faltan ${days} días`;
};

function TaskCountdown() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await getTasks();
        
        // Filtrar tareas no completadas
        const pendingTasks = tasksData.filter(task => !task.completed);
        
        // Ordenar por días restantes (primero las más urgentes)
        pendingTasks.sort((a, b) => {
          const daysA = getDaysRemaining(a.dueDate);
          const daysB = getDaysRemaining(b.dueDate);
          return daysA - daysB;
        });
        
        setTasks(pendingTasks);
        setError(null);
      } catch (err) {
        setError('Error al cargar las tareas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (tasks.length === 0) {
    return <Alert severity="info">No tienes tareas pendientes</Alert>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Cuenta regresiva de tareas
      </Typography>
      <List>
        {tasks.slice(0, 5).map((task, index) => {
          const daysRemaining = getDaysRemaining(task.dueDate);
          const countdownColor = getCountdownColor(daysRemaining);
          const countdownText = getCountdownText(daysRemaining);
          
          return (
            <Box key={task._id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <>
                      {task.course?.name && `${task.course.name} - `}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </>
                  }
                />
                <Chip
                  label={countdownText}
                  color={countdownColor}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Paper>
  );
}

export default TaskCountdown;