// src/pages/Pendings.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, CardActions, IconButton,
  Chip, List, ListItem, ListItemText, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import * as pendingService from '../services/pendingService';

const Pendings = () => {
  const { isAuth } = useContext(AuthContext);
  const [pendings, setPendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de pendientes
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPendingId, setCurrentPendingId] = useState(null);
  const [pendingForm, setPendingForm] = useState({
    title: '',
    description: '',
    completed: false
  });
  
  // Cargar pendientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Intentando cargar pendientes...');
        setLoading(true);
        
        // Obtener pendientes
        const response = await pendingService.getPendings();
        console.log('Pendientes recibidos:', response);
        setPendings(response);
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar pendientes:', err);
        setError('Error al cargar los pendientes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);
  
  // Abrir diálogo para crear pendiente
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentPendingId(null);
    setPendingForm({
      title: '',
      description: '',
      completed: false
    });
    setOpen(true);
  };
  
  // Abrir diálogo para editar pendiente
  const handleOpenEdit = (pending) => {
    setIsEditing(true);
    setCurrentPendingId(pending._id);
    setPendingForm({
      title: pending.title,
      description: pending.description || '',
      completed: pending.completed || false
    });
    setOpen(true);
  };
  
  // Cerrar diálogo
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentPendingId(null);
    setPendingForm({
      title: '',
      description: '',
      completed: false
    });
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setPendingForm({
      ...pendingForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Crear o actualizar pendiente
  const savePending = async () => {
    try {
      // Validar que se haya ingresado un título
      if (!pendingForm.title.trim()) {
        setError('Por favor, ingresa un título para el pendiente.');
        return;
      }
      
      if (isEditing) {
        // Actualizar pendiente existente
        console.log('Actualizando pendiente:', pendingForm);
        const updatedPending = await pendingService.updatePending(currentPendingId, pendingForm);
        
        // Actualizar el pendiente en la lista
        setPendings(pendings.map(pending => pending._id === currentPendingId ? updatedPending : pending));
      } else {
        // Crear nuevo pendiente
        console.log('Creando nuevo pendiente:', pendingForm);
        const newPending = await pendingService.createPending(pendingForm);
        
        // Agregar el nuevo pendiente a la lista
        setPendings([...pendings, newPending]);
      }
      
      // Cerrar diálogo
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al guardar pendiente:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el pendiente. Por favor, intenta nuevamente.`);
    }
  };
  
  // Eliminar pendiente
  const deletePending = async (id) => {
    try {
      console.log('Eliminando pendiente:', id);
      await pendingService.deletePending(id);
      
      // Eliminar el pendiente de la lista
      setPendings(pendings.filter(pending => pending._id !== id));
      
      setError(null);
    } catch (err) {
      console.error('Error al eliminar pendiente:', err);
      setError('Error al eliminar el pendiente. Por favor, intenta nuevamente.');
    }
  };
  
  // Cambiar estado del pendiente
  const changePendingStatus = async (id, completed) => {
    try {
      const pending = pendings.find(pending => pending._id === id);
      
      if (!pending) return;
      
      const updatedPending = {
        ...pending,
        completed: completed
      };
      
      console.log(`Cambiando estado de pendiente ${id} a ${completed ? 'completado' : 'pendiente'}`);
      const response = await pendingService.updatePending(id, updatedPending);
      
      // Actualizar el pendiente en la lista
      setPendings(pendings.map(pending => pending._id === id ? response : pending));
      
      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado del pendiente:', err);
      setError('Error al cambiar el estado del pendiente. Por favor, intenta nuevamente.');
    }
  };
  
  // Marcar pendiente como completado
  const completePending = (id) => {
    changePendingStatus(id, true);
  };
  
  // Marcar pendiente como no completado
  const reopenPending = (id) => {
    changePendingStatus(id, false);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando pendientes...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cosas Pendientes
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ mb: 3 }}
        >
          Nuevo Pendiente
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {pendings.length === 0 ? (
          <Typography>No tienes pendientes registrados.</Typography>
        ) : (
          <Grid container spacing={3}>
            {pendings.map(pending => (
              <Grid item xs={12} sm={6} md={4} key={pending._id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: pending.completed ? 0.7 : 1
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ 
                      textDecoration: pending.completed ? 'line-through' : 'none',
                      mb: 2
                    }}>
                      {pending.title}
                    </Typography>
                    
                    {pending.description && (
                      <Typography variant="body2" color="text.secondary">
                        {pending.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={pending.completed ? "Completado" : "Pendiente"} 
                        color={pending.completed ? "success" : "warning"}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    {pending.completed ? (
                      <IconButton 
                        aria-label="reabrir"
                        onClick={() => reopenPending(pending._id)}
                        color="warning"
                        title="Marcar como pendiente"
                      >
                        <UndoIcon />
                      </IconButton>
                    ) : (
                      <IconButton 
                        aria-label="completar"
                        onClick={() => completePending(pending._id)}
                        color="success"
                        title="Marcar como completado"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      aria-label="editar"
                      onClick={() => handleOpenEdit(pending)}
                      title="Editar pendiente"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="eliminar"
                      onClick={() => deletePending(pending._id)}
                      title="Eliminar pendiente"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Diálogo para crear/editar pendiente */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Pendiente' : 'Nuevo Pendiente'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Título del pendiente"
              name="title"
              value={pendingForm.title}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Descripción"
              name="description"
              multiline
              rows={4}
              value={pendingForm.description}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={savePending} variant="contained">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pendings;