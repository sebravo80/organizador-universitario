// src/pages/Tasks.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, CardActions, IconButton,
  Chip, List, ListItem, ListItemText, Divider,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format, differenceInDays } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import TaskCountdown from '../components/TaskCountdown';
import '../styles/animations.css';
import '../styles/tasks.css';

// Función para calcular si debe usarse texto blanco o negro según el color de fondo
const calculateContrastColor = (bgColor) => {
  // Eliminar el # si existe
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  
  // Si no es un formato hexadecimal válido, devolver blanco por defecto
  if (color.length !== 6) return '#ffffff';
  
  // Convertir a valores RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calcular la luminosidad (percepción del brillo)
  // Fórmula: (0.299*R + 0.587*G + 0.114*B)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Usar texto negro para colores claros y texto blanco para oscuros
  return luminance > 0.6 ? '#000000' : '#ffffff';
};

// Función para oscurecer un color (para bordes)
const darkenColor = (color, factor) => {
  // Eliminar el # si existe
  let hex = color.charAt(0) === '#' ? color.substring(1, 7) : color;
  
  // Convertir a valores RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Oscurecer cada componente
  r = Math.max(0, Math.floor(r * (1 - factor)));
  g = Math.max(0, Math.floor(g * (1 - factor)));
  b = Math.max(0, Math.floor(b * (1 - factor)));
  
  // Convertir de nuevo a hexadecimal
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const Tasks = () => {
  const { isAuth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de tarea
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: null,
    priority: 'Media',
    status: 'Pendiente'
  });
  
  // Estado para filtros
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    course: 'all'
  });
  
  // Cargar tareas y cursos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener tareas
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
        
        // Obtener cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);
  
  // Abrir diálogo para crear tarea
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentTaskId(null);
    setTaskForm({
      title: '',
      description: '',
      course: '',
      dueDate: null,
      priority: 'Media',
      status: 'Pendiente'
    });
    setOpen(true);
  };
  
  // Abrir diálogo para editar tarea
  const handleOpenEdit = (task) => {
    setIsEditing(true);
    setCurrentTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      course: task.course ? task.course._id : '',
      dueDate: new Date(task.dueDate),
      priority: task.priority,
      status: task.status
    });
    setOpen(true);
  };
  
  // Cerrar diálogo
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentTaskId(null);
    setTaskForm({
      title: '',
      description: '',
      course: '',
      dueDate: null,
      priority: 'Media',
      status: 'Pendiente'
    });
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (date) => {
    setTaskForm({
      ...taskForm,
      dueDate: date
    });
  };
  
  // Crear o actualizar tarea
  const saveTask = async () => {
    try {
      // Validar que se haya ingresado un título y una fecha
      if (!taskForm.title.trim() || !taskForm.dueDate) {
        setError('Por favor, ingresa un título y una fecha de vencimiento.');
        return;
      }
      
      if (isEditing) {
        // Actualizar tarea existente
        console.log('Actualizando tarea:', taskForm);
        const res = await api.put(`/tasks/${currentTaskId}`, taskForm);
        
        // Actualizar la tarea en la lista
        setTasks(tasks.map(task => task._id === currentTaskId ? res.data : task));
      } else {
        // Crear nueva tarea
        console.log('Creando nueva tarea:', taskForm);
        const res = await api.post('/tasks', taskForm);
        
        // Agregar la nueva tarea a la lista
        setTasks([...tasks, res.data]);
      }
      
      // Cerrar diálogo
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la tarea. Por favor, intenta nuevamente.`);
    }
  };
  
  // Eliminar tarea
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      
      // Eliminar la tarea de la lista
      setTasks(tasks.filter(task => task._id !== id));
      
      setError(null);
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      setError('Error al eliminar la tarea. Por favor, intenta nuevamente.');
    }
  };
  
  // Cambiar estado de la tarea
  const changeTaskStatus = async (id, newStatus) => {
    try {
      const task = tasks.find(task => task._id === id);
      
      if (!task) return;
      
      const updatedTask = {
        ...task,
        status: newStatus
      };
      
      const res = await api.put(`/tasks/${id}`, updatedTask);
      
      // Actualizar la tarea en la lista
      setTasks(tasks.map(task => task._id === id ? res.data : task));
      
      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
      setError('Error al cambiar el estado de la tarea. Por favor, intenta nuevamente.');
    }
  };
  
  // Marcar tarea como completada
  const completeTask = (id) => {
    changeTaskStatus(id, 'Completada');
  };
  
  // Marcar tarea como pendiente
  const reopenTask = (id) => {
    changeTaskStatus(id, 'Pendiente');
  };
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };
  
  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    // Filtrar por estado
    if (filter.status !== 'all' && task.status !== filter.status) {
      return false;
    }
    
    // Filtrar por prioridad
    if (filter.priority !== 'all' && task.priority !== filter.priority) {
      return false;
    }
    
    // Filtrar por curso
    if (filter.course !== 'all' && (!task.course || task.course._id !== filter.course)) {
      return false;
    }
    
    return true;
  });
  
  // Ordenar tareas por fecha de vencimiento
  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
  };
  
  // Obtener color de prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'error';
      case 'Media':
        return 'warning';
      case 'Baja':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColorHex = (priority) => {
    switch (priority) {
      case 'Alta':
        return '#f44336'; // Rojo
      case 'Media':
        return '#ff9800'; // Naranja
      case 'Baja':
        return '#4caf50'; // Verde
      default:
        return '#757575'; // Gris
    }
  };
  
  // Obtener color de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'En progreso':
        return 'info';
      case 'Pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Función para determinar el color del texto basado en el color de fondo
  const calculateContrastColor = (backgroundColor) => {
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000' : '#fff';
  };

  // Función para oscurecer un color
  const darkenColor = (color, amount) => {
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount * 255);
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount * 255);
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando tareas...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" className="page-transition">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Tareas
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ mb: 3 }}
        >
          Nueva Tarea
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {/* Filtros */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Estado</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  name="status"
                  value={filter.status}
                  label="Estado"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En progreso">En progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="priority-filter-label">Prioridad</InputLabel>
                <Select
                  labelId="priority-filter-label"
                  id="priority-filter"
                  name="priority"
                  value={filter.priority}
                  label="Prioridad"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Baja">Baja</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="course-filter-label">Curso</InputLabel>
                <Select
                  labelId="course-filter-label"
                  id="course-filter"
                  name="course"
                  value={filter.course}
                  label="Curso"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {courses.map(course => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {sortedTasks.length === 0 ? (
          <Typography>No hay tareas que coincidan con los filtros.</Typography>
        ) : (
          <Grid container spacing={3}>
            {sortedTasks.map(task => (
              <Grid item xs={12} sm={6} md={4} key={task._id} className="staggered-item">
                <Card 
                  className={`task-card ${task.status === 'Completada' ? 'task-completed' : ''}`}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: task.status === 'Completada' ? 0.7 : 1,
                    borderLeft: `4px solid ${task.course ? task.course.color : getPriorityColorHex(task.priority)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h5" component="h2" sx={{ 
                        textDecoration: task.status === 'Completada' ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </Typography>
                      
                      <Chip 
                        label={task.status} 
                        color={getStatusColor(task.status)}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          textShadow: '0 0 1px rgba(0,0,0,0.2)'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={task.priority} 
                        color={getPriorityColor(task.priority)}
                        size="small"
                        sx={{ 
                          mr: 1,
                          fontWeight: 500,
                          textShadow: '0 0 1px rgba(0,0,0,0.2)'
                        }}
                      />
                      
                      {task.course && (
                        <Chip 
                          label={task.course.name} 
                          size="small"
                          sx={{ 
                            backgroundColor: task.course.color,
                            color: calculateContrastColor(task.course.color),
                            fontWeight: 500,
                            border: `1px solid ${darkenColor(task.course.color, 0.2)}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        />
                      )}
                    </Box>
                    
                    {task.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3, // Limita a 3 líneas
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                    
                    <Typography variant="body2">
                      Fecha de entrega: {formatDate(task.dueDate)}
                    </Typography>
                    
                    {task.status !== 'Completada' && (
                      <Box sx={{ mt: 2 }}>
                        <TaskCountdown dueDate={task.dueDate} />
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    {task.status === 'Completada' ? (
                      <IconButton 
                        aria-label="reabrir"
                        onClick={() => reopenTask(task._id)}
                        color="warning"
                        title="Marcar como pendiente"
                      >
                        <UndoIcon />
                      </IconButton>
                    ) : (
                      <IconButton 
                        aria-label="completar"
                        onClick={() => completeTask(task._id)}
                        color="success"
                        title="Marcar como completada"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      aria-label="editar"
                      onClick={() => handleOpenEdit(task)}
                      title="Editar tarea"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="eliminar"
                      onClick={() => deleteTask(task._id)}
                      title="Eliminar tarea"
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
      
      {/* Diálogo para crear/editar tarea */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Título de la tarea"
              name="title"
              value={taskForm.title}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Descripción"
              name="description"
              multiline
              rows={3}
              value={taskForm.description}
              onChange={handleChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="course-label">Curso</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                name="course"
                value={taskForm.course}
                label="Curso"
                onChange={handleChange}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de entrega"
                  value={taskForm.dueDate}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Prioridad</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={taskForm.priority}
                label="Prioridad"
                onChange={handleChange}
              >
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Media">Media</MenuItem>
                <MenuItem value="Baja">Baja</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={taskForm.status}
                label="Estado"
                onChange={handleChange}
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="En progreso">En progreso</MenuItem>
                <MenuItem value="Completada">Completada</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={saveTask} variant="contained">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tasks;