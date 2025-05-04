import { useState, useEffect, useContext } from 'react';
import { 
  Container, Typography, Box, TextField, Button, List, ListItem, 
  ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, 
  Divider, Paper, Checkbox, Card, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../context/AuthContext';
import { getTodoItems, createTodoItem, updateTodoItem, deleteTodoItem } from '../services/todoService';

const TodoList = () => {
  const { isAuth } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Cargar todos los elementos pendientes
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const data = await getTodoItems();
        setTodos(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar lista de pendientes:', err);
        setError('Error al cargar los elementos pendientes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuth) {
      fetchTodos();
    }
  }, [isAuth]);

  // Agregar nuevo elemento
  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodoText.trim()) return;
    
    try {
      const newTodo = await createTodoItem(newTodoText);
      setTodos([newTodo, ...todos]);
      setNewTodoText('');
      setError(null);
    } catch (err) {
      console.error('Error al agregar elemento:', err);
      setError('Error al agregar el elemento. Por favor, intenta nuevamente.');
    }
  };

  // Marcar como completado/pendiente
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const updatedTodo = await updateTodoItem(id, { completed: !currentStatus });
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al actualizar el elemento. Por favor, intenta nuevamente.');
    }
  };

  // Eliminar elemento
  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodoItem(id);
      setTodos(todos.filter(todo => todo._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar elemento:', err);
      setError('Error al eliminar el elemento. Por favor, intenta nuevamente.');
    }
  };

  // Iniciar edición
  const handleStartEdit = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.text);
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingId) return;
    
    try {
      const updatedTodo = await updateTodoItem(editingId, { text: editText });
      setTodos(todos.map(todo => todo._id === editingId ? updatedTodo : todo));
      setEditingId(null);
      setEditText('');
      setError(null);
    } catch (err) {
      console.error('Error al editar elemento:', err);
      setError('Error al editar el elemento. Por favor, intenta nuevamente.');
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando lista de pendientes...</Typography>
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
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Usa esta lista para anotar cosas que debes hacer eventualmente, sin asociarlas a un curso o fecha específica.
            </Typography>
            
            <Box component="form" onSubmit={handleAddTodo} sx={{ mt: 2, display: 'flex' }}>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Agregar nuevo elemento..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
              />
              <Button 
                type="submit"
                variant="contained"
                sx={{ ml: 1 }}
              >
                Agregar
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Paper>
          {todos.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Tu lista está vacía. Agrega elementos pendientes para comenzar.
              </Typography>
            </Box>
          ) : (
            <List>
              {todos.map((todo, index) => (
                <Box key={todo._id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo._id, todo.completed)}
                        sx={{
                          color: todo.completed ? 'success.main' : 'default',
                          '&.Mui-checked': {
                            color: 'success.main',
                          },
                        }}
                      />
                    </ListItemIcon>
                    
                    {editingId === todo._id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <Button onClick={handleSaveEdit} size="small" sx={{ ml: 1 }}>
                          Guardar
                        </Button>
                        <Button onClick={handleCancelEdit} size="small">
                          Cancelar
                        </Button>
                      </Box>
                    ) : (
                      <ListItemText
                        primary={todo.text}
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'text.secondary' : 'text.primary'
                        }}
                      />
                    )}
                    
                    {editingId !== todo._id && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleStartEdit(todo)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteTodo(todo._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default TodoList;