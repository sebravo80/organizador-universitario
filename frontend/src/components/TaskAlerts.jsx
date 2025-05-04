import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { getDaysRemaining } from '../utils/dateUtils';
import { Snackbar, Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, DialogActions } from '@mui/material';
import { Alert } from '@mui/material';

const TaskAlerts = () => {
  const { tasks } = useAppData();
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [openUrgentSnackbar, setOpenUrgentSnackbar] = useState(false);
  const [openOverdueSnackbar, setOpenOverdueSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('urgent'); // 'urgent' o 'overdue'

  // Memoize la función de filtrado de tareas
  const filterTasks = useCallback(() => {
    if (!tasks || tasks.length === 0) return;
    
    // Filtrar tareas no completadas
    const pendingTasks = tasks.filter(task => task.status !== 'Completada');
    
    // Tareas urgentes (que vencen hoy o mañana)
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
    
    // Mostrar alertas solo si hay tareas
    if (urgent.length > 0 && !localStorage.getItem('urgentTasksAlertDismissed')) {
      setOpenUrgentSnackbar(true);
    }
    
    if (overdue.length > 0 && !localStorage.getItem('overdueTasksAlertDismissed')) {
      setOpenOverdueSnackbar(true);
    }
  }, [tasks]);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const handleCloseUrgentSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenUrgentSnackbar(false);
    localStorage.setItem('urgentTasksAlertDismissed', 'true');
    
    // Reset el estado después de 24 horas
    setTimeout(() => {
      localStorage.removeItem('urgentTasksAlertDismissed');
    }, 24 * 60 * 60 * 1000);
  };

  const handleCloseOverdueSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenOverdueSnackbar(false);
    localStorage.setItem('overdueTasksAlertDismissed', 'true');
    
    // Reset el estado después de 24 horas
    setTimeout(() => {
      localStorage.removeItem('overdueTasksAlertDismissed');
    }, 24 * 60 * 60 * 1000);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Snackbar 
        open={openUrgentSnackbar} 
        autoHideDuration={10000} 
        onClose={handleCloseUrgentSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseUrgentSnackbar} 
          severity="warning"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => handleOpenDialog('urgent')}
            >
              Ver
            </Button>
          }
        >
          Tienes {urgentTasks.length} {urgentTasks.length === 1 ? 'tarea urgente' : 'tareas urgentes'}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={openOverdueSnackbar} 
        autoHideDuration={10000} 
        onClose={handleCloseOverdueSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseOverdueSnackbar} 
          severity="error"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => handleOpenDialog('overdue')}
            >
              Ver
            </Button>
          }
        >
          Tienes {overdueTasks.length} {overdueTasks.length === 1 ? 'tarea vencida' : 'tareas vencidas'}
        </Alert>
      </Snackbar>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === 'urgent' ? 'Tareas Urgentes' : 'Tareas Vencidas'}
        </DialogTitle>
        <DialogContent>
          <List>
            {(dialogType === 'urgent' ? urgentTasks : overdueTasks).map(task => (
              <ListItem key={task._id}>
                <ListItemText 
                  primary={task.title} 
                  secondary={`Vence: ${new Date(task.dueDate).toLocaleDateString()}`} 
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Usar memo para evitar re-renderizados innecesarios
export default memo(TaskAlerts);