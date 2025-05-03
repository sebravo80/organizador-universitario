import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, Typography, Box, TextField, Button, 
  Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, CircularProgress, Divider, Alert, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import axios from 'axios';

const TodoList = () => {
  const { isAuth } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar todos los pendientes al iniciar
  useEffect(() => {
    if (isAuth) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [isAuth]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // URL del backend
      const API_URL = import.meta.env.VITE_API_URL || 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api';
      console.log("Usando API URL:", API_URL);
      
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No hay token disponible");
        setError("Debes iniciar sesión primero");
        setLoading(false);
        return;
      }
      
      // Hacer petición a la API
      const response = await axios.get(`${API_URL}/pendings`, {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        }
      });

      console.log('Respuesta recibida:', response);
      
      // Verificar que la respuesta contenga datos válidos
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setItems(response.data);
        } else {
          console.warn('La respuesta no es un array:', response.data);
          setItems([]);
        }
      } else {
        console.warn('Respuesta vacía o inválida');
        setItems([]);
      }
    } catch (err) {
      console.error('Error al cargar los pendientes:', err);
      
      // Mostrar mensaje de error más amigable
      const errorMsg = err.response?.data?.msg || err.message || 'Error al cargar los pendientes';
      setError(errorMsg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.trim()) return;
    
    try {
      setError(null);
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Debes iniciar sesión primero");
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/pendings`, 
        { title: newItem, description: '' },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      if (response && response.data) {
        // Mostrar mensaje de éxito
        setSuccess('Pendiente añadido correctamente');
        
        // Limpiar el campo de texto
        setNewItem('');
        
        // Recargar los items
        await loadItems();
      }
    } catch (err) {
      console.error('Error al añadir pendiente:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Error al añadir el pendiente';
      setError(errorMsg);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      setError(null);
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Debes iniciar sesión primero");
        return;
      }
      
      await axios.delete(`${API_URL}/pendings/${id}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Actualizar la lista sin necesidad de recargar todos los elementos
      setItems(items.filter(item => item._id !== id));
      setSuccess('Pendiente eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar pendiente:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Error al eliminar el pendiente';
      setError(errorMsg);
    }
  };
  
  const handleToggleComplete = async (item) => {
    try {
      setError(null);
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://organizador-universitario-api-49b169773d7f.herokuapp.com/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Debes iniciar sesión primero");
        return;
      }
      
      const updatedItem = {
        ...item,
        completed: !item.completed
      };
      
      const response = await axios.put(
        `${API_URL}/pendings/${item._id}`, 
        updatedItem,
        { headers: { 'x-auth-token': token } }
      );
      
      if (response && response.data) {
        // Actualizar el item en la lista
        setItems(items.map(i => i._id === item._id ? response.data : i));
        setSuccess(`Pendiente marcado como ${response.data.completed ? 'completado' : 'pendiente'}`);
      }
    } catch (err) {
      console.error('Error al actualizar pendiente:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Error al actualizar el pendiente';
      setError(errorMsg);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  // Si el usuario no está autenticado
  if (!isAuth) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            Debes iniciar sesión para ver tu lista de pendientes
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Lista de Cosas Pendientes
        </Typography>
        
        {/* Formulario para añadir nuevo elemento */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <form onSubmit={handleAddItem} style={{ display: 'flex' }}>
            <TextField
              fullWidth
              label="Añadir nuevo pendiente..."
              variant="outlined"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              sx={{ mr: 1 }}
              autoComplete="off"
            />
            <Button 
              type="submit" 
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              disabled={!newItem.trim()}
              sx={{ px: 3 }}
            >
              Añadir
            </Button>
          </form>
        </Paper>
        
        {/* Lista de pendientes */}
        <Paper sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {items.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No tienes pendientes en tu lista"
                    primaryTypographyProps={{ align: 'center' }}
                  />
                </ListItem>
              ) : (
                items.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem 
                      sx={{ 
                        backgroundColor: item.completed ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        opacity: item.completed ? 0.7 : 1
                      }}
                    >
                      <IconButton 
                        edge="start" 
                        color={item.completed ? "success" : "default"}
                        onClick={() => handleToggleComplete(item)}
                      >
                        {item.completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                      </IconButton>
                      
                      <ListItemText 
                        primary={item.title}
                        secondary={item.description}
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="eliminar"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </Paper>
      </Box>
      
      {/* Mensaje de error */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Mensaje de éxito */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TodoList;