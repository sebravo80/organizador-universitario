import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/todo.css';
import { 
  Container, Box, Typography, TextField, Button, List, ListItem, 
  ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, 
  Checkbox, Divider, Paper, Card, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/todoService';

const TodoList = () => {
  const { isAuth } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [editMode, setEditMode] = useState(null); // ID del todo en edición
  const [editText, setEditText] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Cargar pendientes al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const todosData = await getTodos();
        setTodos(todosData);
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
  
  // Agregar nuevo pendiente
  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodo.trim()) return;
    
    try {
      const todo = await createTodo(newTodo);
      setTodos([todo, ...todos]);
      setNewTodo('');
      setError(null);
    } catch (err) {
      console.error('Error al crear pendiente:', err);
      setError('Error al crear el pendiente. Por favor, intenta nuevamente.');
    }
  };
  
  // Iniciar edición de pendiente
  const handleStartEdit = (todo) => {
    setEditMode(todo._id);
    setEditText(todo.text);
  };
  
  // Guardar edición de pendiente
  const handleSaveEdit = async (todoId) => {
    if (!editText.trim()) return;
    
    try {
      const updatedTodo = await updateTodo(todoId, { text: editText });
      setTodos(todos.map(todo => todo._id === todoId ? updatedTodo : todo));
      setEditMode(null);
      setEditText('');
      setError(null);
    } catch (err) {
      console.error('Error al actualizar pendiente:', err);
      setError('Error al actualizar el pendiente. Por favor, intenta nuevamente.');
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditMode(null);
    setEditText('');
  };
  
  // Marcar pendiente como completado o no completado
  const handleToggleComplete = async (todoId, currentStatus) => {
    try {
      const updatedTodo = await updateTodo(todoId, { completed: !currentStatus });
      setTodos(todos.map(todo => todo._id === todoId ? updatedTodo : todo));
      setError(null);
    } catch (err) {
      console.error('Error al actualizar estado del pendiente:', err);
      setError('Error al actualizar el estado. Por favor, intenta nuevamente.');
    }
  };
  
  // Eliminar pendiente
  const handleDeleteTodo = async (todoId) => {
    try {
      await deleteTodo(todoId);
      setTodos(todos.filter(todo => todo._id !== todoId));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar pendiente:', err);
      setError('Error al eliminar el pendiente. Por favor, intenta nuevamente.');
    }
  };

  // Calcular pendientes paginados
  const paginatedTodos = todos.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // Manejar cambio de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(todos.length / itemsPerPage);
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando pendientes...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lista de Pendientes
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box component="form" onSubmit={handleAddTodo} sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Añadir nuevo pendiente..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                sx={{ mr: 2 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<AddIcon />}
                disabled={!newTodo.trim()}
              >
                Añadir
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Paper elevation={2}>
          <List sx={{ width: '100%' }}>
            {todos.length === 0 ? (
              <ListItem>
                <ListItemText primary="No tienes pendientes. ¡Añade uno!" />
              </ListItem>
            ) : (
              <>
                {paginatedTodos.map((todo, index) => (
                  <React.Fragment key={todo._id} className="staggered-item">
                    <ListItem 
                      className="todo-item"
                      sx={{
                        backgroundColor: todo.completed ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          className="todo-checkbox"
                          edge="start"
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo._id, todo.completed)}
                          sx={{ color: todo.completed ? 'success.main' : 'inherit' }}
                        />
                      </ListItemIcon>
                      
                      {editMode === todo._id ? (
                        <TextField
                          fullWidth
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <ListItemText
                          primary={
                            <Typography
                              className={todo.completed ? 'todo-text-completed' : ''}
                              sx={{ 
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'text.secondary' : 'text.primary' 
                              }}
                            >
                              {todo.text}
                            </Typography>
                          }
                        />
                      )}
                      
                      <ListItemSecondaryAction>
                        {editMode === todo._id ? (
                          <>
                            <IconButton 
                              edge="end" 
                              onClick={() => handleSaveEdit(todo._id)}
                              disabled={!editText.trim()}
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={handleCancelEdit} sx={{ ml: 1 }}>
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton 
                              edge="end" 
                              onClick={() => handleStartEdit(todo)}
                              disabled={todo.completed}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteTodo(todo._id)} sx={{ ml: 1 }}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < paginatedTodos.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                
                {/* Componente de paginación */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={handlePageChange} 
                      color="primary"
                      size={window.innerWidth < 600 ? "small" : "medium"}
                    />
                  </Box>
                )}
              </>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default TodoList;