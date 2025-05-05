// src/pages/Tasks.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Chip, Pagination, Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from '../components/TaskCard';
import '../styles/animations.css';
import '../styles/tasks.css';

// Función para calcular si debe usarse texto blanco o negro según el color de fondo
const calculateContrastColor = (bgColor) => {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  if (color.length !== 6) return '#ffffff';
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
};

// Función para oscurecer un color (para bordes)
const darkenColor = (color, factor) => {
  let hex = color.charAt(0) === '#' ? color.substring(1, 7) : color;
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.max(0, Math.floor(r * (1 - factor)));
  g = Math.max(0, Math.floor(g * (1 - factor)));
  b = Math.max(0, Math.floor(b * (1 - factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const Tasks = () => {
  const { isAuth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    course: 'all'
  });

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
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
  
  const handleChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleDateChange = (date) => {
    setTaskForm({
      ...taskForm,
      dueDate: date
    });
  };
  
  const saveTask = async () => {
    try {
      if (!taskForm.title.trim() || !taskForm.dueDate) {
        setError('Por favor, ingresa un título y una fecha de vencimiento.');
        return;
      }
      if (isEditing) {
        const res = await api.put(`/tasks/${currentTaskId}`, taskForm);
        setTasks(tasks.map(task => task._id === currentTaskId ? res.data : task));
      } else {
        const res = await api.post('/tasks', taskForm);
        setTasks([...tasks, res.data]);
      }
      handleClose();
      setError(null);
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la tarea. Por favor, intenta nuevamente.`);
    }
  };
  
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      setError('Error al eliminar la tarea. Por favor, intenta nuevamente.');
    }
  };
  
  const changeTaskStatus = async (id, newStatus) => {
    try {
      const task = tasks.find(task => task._id === id);
      if (!task) return;
      const updatedTask = {
        ...task,
        status: newStatus
      };
      const res = await api.put(`/tasks/${id}`, updatedTask);
      setTasks(tasks.map(task => task._id === id ? res.data : task));
      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
      setError('Error al cambiar el estado de la tarea. Por favor, intenta nuevamente.');
    }
  };
  
  const completeTask = (id) => {
    changeTaskStatus(id, 'Completada');
  };
  
  const reopenTask = (id) => {
    changeTaskStatus(id, 'Pendiente');
  };
  
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter.status !== 'all' && task.status !== filter.status) {
      return false;
    }
    if (filter.priority !== 'all' && task.priority !== filter.priority) {
      return false;
    }
    if (filter.course !== 'all' && (!task.course || task.course._id !== filter.course)) {
      return false;
    }
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const paginatedTasks = sortedTasks.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = Math.ceil(sortedTasks.length / rowsPerPage);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
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
                <InputLabel id="course-filter-label">Ramo</InputLabel>
                <Select
                  labelId="course-filter-label"
                  id="course-filter"
                  name="course"
                  value={filter.course}
                  label="Ramo"
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
          <>
            <Grid container spacing={3}>
              {paginatedTasks.map(task => (
                <Grid item xs={12} sm={6} md={4} key={task._id} className="staggered-item">
                  <TaskCard 
                    task={task} 
                    onEdit={handleOpenEdit}
                    onDelete={deleteTask}
                    onComplete={completeTask}
                    onReopen={reopenTask}
                  />
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  showFirstButton 
                  showLastButton
                  siblingCount={1}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                />
              </Stack>
            )}
          </>
        )}
      </Box>
      
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
              <InputLabel id="course-label">Ramo</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                name="course"
                value={taskForm.course}
                label="Ramo"
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