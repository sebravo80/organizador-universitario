import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, Typography, Box, Button, List, ListItem, 
  ListItemText, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Divider,
  Card, CardContent, CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import * as pendingService from '../services/pendingService';

const Pendings = () => {
  const { isAuth } = useContext(AuthContext);
  const [pendings, setPendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el diálogo de crear/editar
  const [open, setOpen] = useState(false);
  const [currentPending, setCurrentPending] = useState({ title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Cargar pendientes al iniciar
  useEffect(() => {
    const loadPendings = async () => {
      if (!isAuth) return;
      
      try {
        setLoading(true);
        console.log('Intentando cargar pendientes...');
        const data = await pendingService.getPendings();
        console.log('Pendientes recibidos:', data);
        setPendings(data);
      } catch (err) {
        console.error('Error al cargar pendientes:', err);
        setError('No se pudieron cargar los pendientes. ' + 
          (err.msg || 'Por favor, intenta nuevamente.'));
      } finally {
        setLoading(false);
      }
    };
    
    loadPendings();
  }, [isAuth]);
  
  const handleOpenDialog = (pending = null) => {
    if (pending) {
      setCurrentPending(pending);
      setIsEditing(true);
    } else {
      setCurrentPending({ title: '', description: '' });
      setIsEditing(false);
    }
    setOpen(true);
  };
  
  const handleCloseDialog = () => {
    setOpen(false);
  };
  
  const handleInputChange = (e) => {
    setCurrentPending({
      ...currentPending,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSave = async () => {
    try {
      if (!currentPending.title.trim()) {
        alert('El título es obligatorio');
        return;
      }
      
      if (isEditing) {
        // Actualizar pendiente existente
        const updated = await pendingService.updatePending(
          currentPending._id, 
          currentPending
        );
        setPendings(pendings.map(p => p._id === updated._id ? updated : p));
      } else {
        // Crear nuevo pendiente
        const created = await pendingService.createPending(currentPending);
        setPendings([...pendings, created]);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el pendiente: ${err.msg || err}`);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pendiente?')) return;
    
    try {
      await pendingService.deletePending(id);
      setPendings(pendings.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert(`Error al eliminar el pendiente: ${err.msg || err}`);
    }
  };

  if (!isAuth) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography>Debes iniciar sesión para ver tus pendientes.</Typography>
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
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
        >
          Nuevo Pendiente
        </Button>
        
        {loading && <Typography>Cargando pendientes...</Typography>}
        
        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}
        
        {!loading && !error && pendings.length === 0 && (
          <Typography>No tienes pendientes registrados.</Typography>
        )}
        
        {!loading && !error && pendings.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {pendings.map((pending) => (
              <Card key={pending._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3">
                    {pending.title}
                  </Typography>
                  {pending.description && (
                    <Typography variant="body2" color="text.secondary">
                      {pending.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Estado: {pending.completed ? 'Completado' : 'Pendiente'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    aria-label="editar" 
                    size="small" 
                    onClick={() => handleOpenDialog(pending)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="eliminar" 
                    size="small" 
                    onClick={() => handleDelete(pending._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Diálogo para crear/editar pendientes */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>
          {isEditing ? 'Editar Pendiente' : 'Nuevo Pendiente'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Título"
              name="title"
              value={currentPending.title}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Descripción"
              name="description"
              multiline
              rows={4}
              value={currentPending.description || ''}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pendings;