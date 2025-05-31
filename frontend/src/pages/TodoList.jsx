import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/todoService';
import { 
  Container, Box, Typography, TextField, Button, 
  Card, CardContent, Paper, List, ListItem, 
  ListItemText, ListItemIcon, Checkbox, 
  IconButton, Pagination, Divider, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { toast } from 'react-toastify';
import '../styles/todo.css';
import Loading from '../components/Loading';

const TodoList = () => {
  const { isAuth } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [editMode, setEditMode] = useState(null);
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
        toast.error('Error al cargar los pendientes');
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
      toast.success('¡Pendiente agregado!');
    } catch (err) {
      console.error('Error al crear pendiente:', err);
      setError('Error al crear el pendiente. Por favor, intenta nuevamente.');
      toast.error('Error al crear pendiente');
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
      toast.success('¡Pendiente actualizado!');
    } catch (err) {
      console.error('Error al actualizar pendiente:', err);
      setError('Error al actualizar el pendiente. Por favor, intenta nuevamente.');
      toast.error('Error al actualizar pendiente');
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
      toast.info(updatedTodo.completed ? 'Pendiente completado' : 'Pendiente marcado como no completado');
    } catch (err) {
      console.error('Error al actualizar estado del pendiente:', err);
      setError('Error al actualizar el estado. Por favor, intenta nuevamente.');
      toast.error('Error al actualizar estado');
    }
  };
  
  // Eliminar pendiente
  const handleDeleteTodo = async (todoId) => {
    try {
      await deleteTodo(todoId);
      setTodos(todos.filter(todo => todo._id !== todoId));
      setError(null);
      toast.success('Pendiente eliminado');
    } catch (err) {
      console.error('Error al eliminar pendiente:', err);
      setError('Error al eliminar el pendiente. Por favor, intenta nuevamente.');
      toast.error('Error al eliminar pendiente');
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
    return <Loading message="Cargando pendientes" showLogo={true} />;
  }
  
  return (
    <Container maxWidth="md" className="todo-container page-transition">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" className="todo-title" gutterBottom>
          <FormatListBulletedIcon fontSize="large" sx={{ mr: 1 }} />
          Lista de Pendientes
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
            {error}
          </Typography>
        )}
        
        <Card className="todo-form-card">
          <CardContent>
            <Box component="form" onSubmit={handleAddTodo} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                className="todo-input"
                fullWidth
                variant="outlined"
                placeholder="Añadir nuevo pendiente..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!newTodo.trim()}
                sx={{
                  borderRadius: '50px',
                  height: '50px',
                  width: { xs: '50px', sm: 'auto' },
                  minWidth: '50px',
                  padding: { xs: 0, sm: '0 16px' }
                }}
              >
                <AddIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Añadir
                </Box>
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Paper elevation={2} className="todo-list-container">
          <List sx={{ width: '100%', p: 0 }}>
            {todos.length === 0 ? (
              <Box className="todo-empty-state">
                <AssignmentTurnedInIcon className="todo-empty-icon" />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tienes pendientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Añade una nueva tarea pendiente para empezar a organizarte
                </Typography>
              </Box>
            ) : (
              paginatedTodos.map((todo) => (
                <ListItem
                  key={todo._id} 
                  className="todo-item"
                  secondaryAction={
                    editMode === todo._id ? null : (
                      <div className="todo-actions">
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleStartEdit(todo)}
                          className="todo-action-btn todo-edit-btn"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteTodo(todo._id)}
                          className="todo-action-btn todo-delete-btn"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )
                  }
                  sx={{ pr: 10 }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo._id, todo.completed)}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  </ListItemIcon>
                  
                  {editMode === todo._id ? (
                    <Box className="todo-edit-form">
                      <TextField
                        fullWidth
                        variant="standard"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <IconButton 
                        onClick={() => handleSaveEdit(todo._id)}
                        color="primary"
                        disabled={!editText.trim()}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={handleCancelEdit} color="error">
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <ListItemText
                      className={todo.completed ? "todo-text todo-text-completed" : "todo-text"}
                      primary={todo.text}
                      primaryTypographyProps={{
                        style: {
                          wordBreak: 'break-word'
                        }
                      }}
                    />
                  )}
                </ListItem>
              ))
            )}
          </List>
        </Paper>
        
        {todos.length > itemsPerPage && (
          <Box className="todo-pagination">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              size="large"
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TodoList;