// src/pages/Tasks.jsx
import { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Grid, Card, CardContent, 
  CardActions, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, Alert, FormControl,
  InputLabel, Select, MenuItem, Chip, Box, IconButton,
  FormControlLabel, Checkbox
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getCourses } from '../services/courseService';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    course: '',
    completed: false,
    priority: ''
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: new Date(),
    priority: 'media',
    completed: false
  });

  // Cargar tareas y cursos al montar el componente
  useEffect(() => {
    const loadData = async () => {
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
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar tareas según los filtros aplicados
  const filteredTasks = tasks.filter(task => {
    if (filters.course && task.course && task.course._id !== filters.course) return false;
    if (filters.completed && !task.completed) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });

  // Manejar cambios en el formulario
  const handleChange = (e) => {
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

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
    setFilters({
      ...filters,
      [name]: name === 'completed' ? checked : value
    });
  };

  // Abrir diálogo para editar
  const handleEdit = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      course: task.course ? task.course._id : '',
      dueDate: new Date(task.dueDate),
      priority: task.priority || 'media',
      completed: task.completed || false
    });
    setCurrentTaskId(task._id);
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Abrir diálogo para crear
  const handleOpenCreate = () => {
    setTaskForm({
      title: '',
      description: '',
      course: '',
      dueDate: new Date(),
      priority: 'media',
      completed: false
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setCurrentTaskId(null);
  };

  // Guardar tarea (crear o actualizar)
  const handleSaveTask = async () => {
    try {
      setLoading(true);
      
      if (isEditing) {
        // Actualizar tarea existente
        const updatedTask = await updateTask(currentTaskId, taskForm);
        setTasks(tasks.map(task => 
          task._id === currentTaskId ? updatedTask : task
        ));
      } else {
        // Crear nueva tarea
        const newTask = await createTask(taskForm);
        setTasks([...tasks, newTask]);
      }
      
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la tarea`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (id) => {
    try {
      setLoading(true);
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar la tarea');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Marcar tarea como completada/pendiente
  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await updateTask(task._id, {
        ...task,
        completed: !task.completed
      });
      
      setTasks(tasks.map(t => 
        t._id === task._id ? updatedTask : t
      ));
    } catch (err) {
      setError('Error al actualizar el estado de la tarea');
      console.error(err);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Mis Tareas
        </Typography>
        <Box>
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? 'primary' : 'default'}
          >
            <FilterListIcon />
          </IconButton>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenCreate}
            sx={{ ml: 1 }}
          >
            Nueva Tarea
          </Button>
        </Box>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Filtros */}
      {showFilters && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2}>
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
              <FormControlLabel
                control={
                  <Checkbox
                    name="completed"
                    checked={filters.completed}
                    onChange={handleFilterChange}
                  />
                }
                label="Solo completadas"
              />
            </Grid>
          </Grid>
        </Card>
      )}
      
      {loading && tasks.length === 0 ? (
        <CircularProgress />
      ) : filteredTasks.length === 0 ? (
        <Alert severity="info">No hay tareas que coincidan con los filtros</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <Card 
                sx={{ 
                  opacity: task.completed ? 0.7 : 1,
                  borderLeft: `5px solid ${task.priority === 'alta' ? '#f44336' : 
                                         task.priority === 'media' ? '#ff9800' : 
                                         '#4caf50'}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography 
                      variant="h6" 
                      component="div"
                      sx={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        wordBreak: 'break-word'
                      }}
                    >
                      {task.title}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={task.completed || false}
                          onChange={() => handleToggleComplete(task)}
                          size="small"
                        />
                      }
                      label=""
                    />
                  </Box>
                  
                  {task.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mt: 1, 
                        mb: 2,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        wordBreak: 'break-word'
                      }}
                    >
                      {task.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {task.course && (
                      <Chip 
                        label={task.course.name} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    <Chip 
                      label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                      size="small" 
                      color={getPriorityColor(task.priority)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Fecha límite: {new Date(task.dueDate).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEdit(task)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo para añadir/editar tarea */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Título"
            type="text"
            fullWidth
            variant="outlined"
            value={taskForm.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            variant="outlined"
            value={taskForm.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Curso</InputLabel>
            <Select
              name="course"
              value={taskForm.course}
              onChange={handleChange}
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="priority"
              value={taskForm.priority}
              onChange={handleChange}
              label="Prioridad"
            >
              <MenuItem value="alta">Alta</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="baja">Baja</MenuItem>
            </Select>
          </FormControl>
          <DateTimePicker
            label="Fecha límite"
            value={taskForm.dueDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="completed"
                checked={taskForm.completed}
                onChange={handleChange}
              />
            }
            label="Completada"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveTask} 
            variant="contained"
            disabled={!taskForm.title}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Tasks;