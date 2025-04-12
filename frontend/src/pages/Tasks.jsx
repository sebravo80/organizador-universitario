import { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, 
  CardActions, Button, TextField, MenuItem, 
  FormControl, InputLabel, Select, Box, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, IconButton, Divider,
  Alert, CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getCourses } from '../services/courseService';

// Función para calcular días restantes
const getDaysRemaining = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Función para obtener color según días restantes
const getCountdownColor = (days) => {
  if (days < 0) return 'error';
  if (days === 0) return 'error';
  if (days <= 2) return 'warning';
  if (days <= 5) return 'info';
  return 'success';
};

// Función para obtener texto según días restantes
const getCountdownText = (days) => {
  if (days < 0) return `¡Vencida hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}!`;
  if (days === 0) return '¡Vence hoy!';
  if (days === 1) return 'Vence mañana';
  return `Faltan ${days} días`;
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: new Date(),
    priority: 'media',
    completed: false
  });
  
  const [filters, setFilters] = useState({
    course: '',
    completed: false,
    priority: '',
    daysRemaining: '' // Filtro por días restantes
  });
  
  const [showCompleted, setShowCompleted] = useState(false);

  // Cargar tareas y cursos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, coursesData] = await Promise.all([
          getTasks(),
          getCourses()
        ]);
        
        setTasks(tasksData);
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar tareas según los filtros aplicados
  const filteredTasks = tasks.filter(task => {
    // Filtro por curso
    if (filters.course && task.course && task.course._id !== filters.course) return false;
    
    // Filtro por estado de completado
    if (!showCompleted && task.completed) return false;
    if (filters.completed && !task.completed) return false;
    
    // Filtro por prioridad
    if (filters.priority && task.priority !== filters.priority) return false;
    
    // Filtro por días restantes
    if (filters.daysRemaining) {
      const days = getDaysRemaining(task.dueDate);
      switch (filters.daysRemaining) {
        case 'overdue':
          if (days >= 0) return false;
          break;
        case 'today':
          if (days !== 0) return false;
          break;
        case 'tomorrow':
          if (days !== 1) return false;
          break;
        case 'thisWeek':
          if (days < 0 || days > 7) return false;
          break;
        case 'nextWeek':
          if (days < 8 || days > 14) return false;
          break;
        default:
          break;
      }
    }
    
    return true;
  });

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: name === 'completed' ? checked : value
    });
  };

  // Manejar cambio de fecha
  const handleDateChange = (newDate) => {
    setTaskForm({
      ...taskForm,
      dueDate: newDate
    });
  };

  // Abrir diálogo para crear tarea
  const handleOpenCreateDialog = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      course: '',
      dueDate: new Date(),
      priority: 'media',
      completed: false
    });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar tarea
  const handleOpenEditDialog = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      course: task.course?._id || '',
      dueDate: new Date(task.dueDate),
      priority: task.priority,
      completed: task.completed
    });
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Guardar tarea (crear o actualizar)
  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        // Actualizar tarea existente
        await updateTask(editingTask._id, taskForm);
        
        // Actualizar estado local
        setTasks(tasks.map(task => 
          task._id === editingTask._id 
            ? { ...task, ...taskForm, course: courses.find(c => c._id === taskForm.course) } 
            : task
        ));
      } else {
        // Crear nueva tarea
        const newTask = await createTask(taskForm);
        
        // Actualizar estado local
        setTasks([...tasks, newTask]);
      }
      
      // Cerrar diálogo
      setOpenDialog(false);
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      setError('Error al guardar la tarea. Por favor, intenta de nuevo.');
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
        
        // Actualizar estado local
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (err) {
        console.error('Error al eliminar tarea:', err);
        setError('Error al eliminar la tarea. Por favor, intenta de nuevo.');
      }
    }
  };

  // Marcar tarea como completada/pendiente
  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task._id, { completed: !task.completed });
      
      // Actualizar estado local
      setTasks(tasks.map(t => 
        t._id === task._id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      console.error('Error al actualizar estado de tarea:', err);
      setError('Error al actualizar el estado de la tarea. Por favor, intenta de nuevo.');
    }
  };

  // Obtener color según prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mis Tareas</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nueva Tarea
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Curso</InputLabel>
            <Select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              label="Curso"
            >
              <MenuItem value="">Todos</MenuItem>
              {courses.map(course => (
                <MenuItem key={course._id} value={course._id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              label="Prioridad"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="baja">Baja</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Plazo</InputLabel>
            <Select
              name="daysRemaining"
              value={filters.daysRemaining}
              onChange={handleFilterChange}
              label="Plazo"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="overdue">Vencidas</MenuItem>
              <MenuItem value="today">Vence hoy</MenuItem>
              <MenuItem value="tomorrow">Vence mañana</MenuItem>
              <MenuItem value="thisWeek">Esta semana</MenuItem>
              <MenuItem value="nextWeek">Próxima semana</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showCompleted} 
                onChange={(e) => setShowCompleted(e.target.checked)} 
              />
            }
            label="Mostrar tareas completadas"
          />
        </Grid>
      </Grid>
      
      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <Alert severity="info">
          No se encontraron tareas con los filtros seleccionados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredTasks.map(task => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: task.completed ? 0.7 : 1,
                  bgcolor: task.completed ? 'action.hover' : 'background.paper'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" sx={{ 
                      textDecoration: task.completed ? 'line-through' : 'none',
                      mb: 1
                    }}>
                      {task.title}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleComplete(task)}
                      color={task.completed ? 'success' : 'default'}
                    >
                      {task.completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    </IconButton>
                  </Box>
                  
                  {task.course && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Curso: {task.course.name}
                    </Typography>
                  )}
                  
                  {task.description && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {task.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip 
                      label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                      size="small" 
                      color={getPriorityColor(task.priority)}
                    />
                    {task.completed && (
                      <Chip label="Completada" size="small" color="success" />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha límite: {new Date(task.dueDate).toLocaleString()}
                    </Typography>
                    {!task.completed && (
                      <Chip 
                        label={getCountdownText(getDaysRemaining(task.dueDate))}
                        color={getCountdownColor(getDaysRemaining(task.dueDate))}
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditDialog(task)}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo para crear/editar tarea */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            name="title"
            value={taskForm.title}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Descripción"
            name="description"
            value={taskForm.description}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Curso</InputLabel>
            <Select
              name="course"
              value={taskForm.course}
              onChange={handleFormChange}
              label="Curso"
            >
              <MenuItem value="">Ninguno</MenuItem>
              {courses.map(course => (
                <MenuItem key={course._id} value={course._id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <DateTimePicker
            label="Fecha límite"
            value={taskForm.dueDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            sx={{ width: '100%', mt: 2, mb: 2 }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="priority"
              value={taskForm.priority}
              onChange={handleFormChange}
              label="Prioridad"
            >
              <MenuItem value="alta">Alta</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="baja">Baja</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={taskForm.completed} 
                onChange={handleFormChange} 
                name="completed" 
              />
            }
            label="Completada"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Tasks;