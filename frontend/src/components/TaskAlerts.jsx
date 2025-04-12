// src/components/TaskAlerts.jsx
import { useState, useEffect } from 'react';
import { 
  Snackbar, Alert, Button, Dialog, DialogTitle, 
  DialogContent, List, ListItem, ListItemText, 
  Chip, DialogActions, Box
} from '@mui/material';
import { getTasks } from '../services/taskService';

// Reutilizamos las funciones de cálculo de días
const getDaysRemaining = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getCountdownColor = (days) => {
  if (days < 0) return 'error';
  if (days === 0) return 'error';
  if (days <= 2) return 'warning';
  if (days <= 5) return 'info';
  return 'success';
};

const getCountdownText = (days) => {
  if (days < 0) return `¡Vencida hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}!`;
  if (days === 0) return '¡Vence hoy!';
  if (days === 1) return 'Vence mañana';
  return `Faltan ${days} días`;
};

function TaskAlerts() {
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [openUrgentSnackbar, setOpenUrgentSnackbar] = useState(false);
  const [openOverdueSnackbar, setOpenOverdueSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('urgent'); // 'urgent' o 'overdue'

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await getTasks();
        
        // Filtrar tareas no completadas
        const pendingTasks = tasksData.filter(task => !task.completed);
        
        // Tareas urgentes (vencen hoy o mañana)
        const urgent = pendingTasks.filter(task => {
          const days = getDaysRemaining(task.dueDate);
          return days >= 0 && days <= 2;
        });
        
        // Tareas vencidas
        const overdue = pendingTasks.filter(task => {
          const days = getDaysRemaining(task.dueDate);
          return days < 0;
        });
        
        setUrgentTasks(urgent);
        setOverdueTasks(overdue);
        
        // Mostrar notificaciones si hay tareas
        if (urgent.length > 0) {
          setOpenUrgentSnackbar(true);
        }
        
        if (overdue.length > 0) {
          // Esperar un poco para no mostrar ambas notificaciones a la vez
          setTimeout(() => {
            setOpenOverdueSnackbar(true);
          }, 5000);
        }
      } catch (error) {
        console.error('Error al cargar tareas para alertas:', error);
      }
    };

    loadTasks();
    
    // Verificar periódicamente (cada hora)
    const interval = setInterval(loadTasks, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCloseUrgentSnackbar = () => {
    setOpenUrgentSnackbar(false);
  };

  const handleCloseOverdueSnackbar = () => {
    setOpenOverdueSnackbar(false);
  };

  const handleViewTasks = (type) => {
    setDialogType(type);
    if (type === 'urgent') {
      setOpenUrgentSnackbar(false);
    } else {
      setOpenOverdueSnackbar(false);
    }
    setOpenDialog(true);
  };

  return (
    <>
      {/* Alerta para tareas urgentes */}
      <Snackbar
        open={openUrgentSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseUrgentSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseUrgentSnackbar} 
          severity="warning" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={() => handleViewTasks('urgent')}>
              VER
            </Button>
          }
        >
          Tienes {urgentTasks.length} {urgentTasks.length === 1 ? 'tarea urgente' : 'tareas urgentes'}
        </Alert>
      </Snackbar>

      {/* Alerta para tareas vencidas */}
      <Snackbar
        open={openOverdueSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseOverdueSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseOverdueSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={() => handleViewTasks('overdue')}>
              VER
            </Button>
          }
        >
          Tienes {overdueTasks.length} {overdueTasks.length === 1 ? 'tarea vencida' : 'tareas vencidas'}
        </Alert>
      </Snackbar>

      {/* Diálogo para mostrar las tareas */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'urgent' ? 'Tareas Urgentes' : 'Tareas Vencidas'}
        </DialogTitle>
        <DialogContent>
          <List>
            {(dialogType === 'urgent' ? urgentTasks : overdueTasks).map(task => {
              const daysRemaining = getDaysRemaining(task.dueDate);
              
              return (
                <ListItem key={task._id} divider>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <>
                        {task.course?.name && `${task.course.name} - `}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </>
                    }
                  />
                  <Box sx={{ ml: 2 }}>
                    <Chip 
                      label={getCountdownText(daysRemaining)}
                      color={getCountdownColor(daysRemaining)}
                      size="small"
                    />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TaskAlerts;