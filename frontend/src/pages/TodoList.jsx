import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, Typography, Box, TextField, Button, 
  Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, CircularProgress, Divider, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from 'axios';

const TodoList = () => {
  const { isAuth } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

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
      console.log("Cargando pendientes...");
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No hay token disponible");
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/pendings', {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        }
      });
      
      console.log("Respuesta completa de la API:", response);
      
      if (typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          console.log("Datos recibidos (array):", response.data);
          setItems(response.data);
        } else {
          console.error("La respuesta no es un array:", response.data);
          setItems([]); // Establecemos un array vacío
          setServerError("Formato de respuesta inesperado: se recibió un objeto, pero no un array");
        }
      } else {
        console.error("La respuesta no es un objeto:", response.data);
        setItems([]);
        setServerError(`Formato de respuesta inesperado: ${typeof response.data}`);
      }
    } catch (error) {
      console.error("Error al cargar los pendientes:", error);
      setItems([]);
      
      // Mostrar información más detallada sobre el error
      const errorMessage = error.response 
        ? `Error ${error.response.status}: ${error.response.data}` 
        : error.message;
        
      setServerError(`No pudimos cargar tus pendientes. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.trim()) return;
    
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("No has iniciado sesión");
        return;
      }
      
      const response = await axios.post(`${baseURL}/pendings`, 
        { 
          title: newItem,
          description: '' 
        }, 
        { 
          headers: { 
            'x-auth-token': token, 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          } 
        }
      );
      
      console.log("Pendiente creado:", response.data);
      setItems(Array.isArray(items) ? [...items, response.data] : [response.data]);
      setNewItem('');
      setServerError(null);
    } catch (error) {
      console.error("Error al añadir pendiente:", error);
      setServerError(`No pudimos añadir el pendiente. ${error.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.delete(`${baseURL}/pendings/${id}`, {
        headers: { 
          'x-auth-token': token,
          'Accept': 'application/json'
        }
      });
      
      setItems(Array.isArray(items) ? items.filter(item => item._id !== id) : []);
      setServerError(null);
    } catch (error) {
      console.error("Error al eliminar pendiente:", error);
      setServerError(`No pudimos eliminar el pendiente. ${error.message}`);
    }
  };

  if (!isAuth) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            Debes iniciar sesión para ver tu lista de pendientes
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lista de Cosas Pendientes
        </Typography>
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleAddItem} style={{ display: 'flex', marginBottom: '20px' }}>
            <TextField
              fullWidth
              label="Añadir un nuevo pendiente..."
              variant="outlined"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<AddCircleIcon />}
              disabled={!newItem.trim()}
            >
              Añadir
            </Button>
          </form>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 0 }}>
            <List>
              {!Array.isArray(items) || items.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No tienes pendientes en tu lista"
                    primaryTypographyProps={{ align: 'center' }}
                  />
                </ListItem>
              ) : (
                items.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
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
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default TodoList;