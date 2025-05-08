import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { scheduleTaskNotification } from '../services/notificationService';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Chip, Paper, Pagination, Stack, Fab, Drawer,
  IconButton, Tabs, Tab, CircularProgress, Divider,
  InputAdornment, Alert, useMediaQuery, useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';
import TaskCard from '../components/TaskCard';
import { toast } from 'react-toastify';
import '../styles/animations.css';
import '../styles/tasks.css';

// Función para calcular si debe usarse texto blanco o negro según el color de fondo
const calculateContrastColor = (bgColor) => {
  if (!bgColor) return '#ffffff';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState('date-asc');

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
        toast.error('Error al cargar las tareas');
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
      dueDate: new Date(),
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
        toast.error('Por favor, ingresa un título y una fecha de vencimiento.');
        return;
      }
      
      let savedTask;
      
      if (isEditing) {
        const response = await api.put(`/tasks/${currentTaskId}`, taskForm);
        savedTask = response.data;
        setTasks(tasks.map(task => task._id === currentTaskId ? savedTask : task));
        toast.success('Tarea actualizada correctamente');
      } else {
        const response = await api.post('/tasks', taskForm);
        savedTask = response.data;
        setTasks([...tasks, savedTask]);
        toast.success('Tarea creada correctamente');
      }
      
      // Programar notificación solo si la tarea se guardó correctamente
      if (savedTask && savedTask._id) {
        try {
          await scheduleTaskNotification(savedTask);
        } catch (notifError) {
          console.error('Error al programar la notificación:', notifError);
          // No interrumpimos el flujo si la notificación falla
        }
      }
      
      handleClose();
      setError(null);
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la tarea. Por favor, intenta nuevamente.`);
    }
  };
  
  const showDeleteConfirmation = (id) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTasks(tasks.filter(task => task._id !== taskToDelete));
      toast.success('Tarea eliminada correctamente');
      setError(null);
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      toast.error('Error al eliminar la tarea. Por favor, intenta nuevamente.');
    } finally {
      setDeleteDialogOpen(false);
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
      toast.success(`Tarea marcada como ${newStatus.toLowerCase()}`);
      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
      toast.error('Error al cambiar el estado de la tarea. Por favor, intenta nuevamente.');
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
    setPage(1); // Volver a la primera página cuando cambia el filtro
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    switch(newValue) {
      case 0: // Todas
        setFilter({ status: 'all', priority: 'all', course: 'all' });
        break;
      case 1: // Pendientes
        setFilter({ ...filter, status: 'Pendiente' });
        break;
      case 2: // En progreso
        setFilter({ ...filter, status: 'En progreso' });
        break;
      case 3: // Completadas
        setFilter({ ...filter, status: 'Completada' });
        break;
      default:
        setFilter({ status: 'all', priority: 'all', course: 'all' });
    }
    setPage(1); // Volver a la primera página
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Filtrado por búsqueda
  const searchFilter = (task) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.course && task.course.name.toLowerCase().includes(searchLower))
    );
  };

  // Filtrado por estado de tab y filtros
  const statusFilter = (task) => {
    // Primero comprobamos el estado del tab
    if (tabValue === 1 && task.status !== 'Pendiente') return false;
    if (tabValue === 2 && task.status !== 'En progreso') return false;
    if (tabValue === 3 && task.status !== 'Completada') return false;

    // Luego aplicamos los otros filtros
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
  };
  
  // Aplicar todos los filtros y ordenar
  const filteredTasks = tasks.filter(task => searchFilter(task) && statusFilter(task));
  
  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch(sortOrder) {
      case 'date-asc':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'date-desc':
        return new Date(b.dueDate) - new Date(a.dueDate);
      case 'priority-desc':
        const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      default:
        return new Date(a.dueDate) - new Date(b.dueDate);
    }
  });
  
  // Paginación
  const paginatedTasks = sortedTasks.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = Math.ceil(sortedTasks.length / rowsPerPage);
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Cargando tareas...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" className="page-transition">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <AssignmentIcon color="primary" fontSize="large" />
            Mis Tareas
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Nueva Tarea
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Buscar tareas..."
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setDrawerOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Filtros
              </Button>
              
              <FormControl variant="outlined" size="small">
                <Select
                  value={sortOrder}
                  onChange={handleSortChange}
                  displayEmpty
                  startAdornment={<SortIcon sx={{ mr: 0.5 }} />}
                >
                  <MenuItem value="date-asc">Fecha ↑</MenuItem>
                  <MenuItem value="date-desc">Fecha ↓</MenuItem>
                  <MenuItem value="priority-desc">Prioridad ↓</MenuItem>
                  <MenuItem value="name-asc">Nombre A-Z</MenuItem>
                  <MenuItem value="name-desc">Nombre Z-A</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<AssignmentIcon />} label={`Todas (${tasks.length})`} />
            <Tab icon={<AssignmentLateIcon />} label={`Pendientes (${tasks.filter(t => t.status === 'Pendiente').length})`} />
            <Tab icon={<HourglassBottomIcon />} label={`En progreso (${tasks.filter(t => t.status === 'En progreso').length})`} />
            <Tab icon={<AssignmentTurnedInIcon />} label={`Completadas (${tasks.filter(t => t.status === 'Completada').length})`} />
          </Tabs>
        </Paper>
        
        {filteredTasks.length === 0 ? (
          <Paper 
            elevation={1}
            sx={{ 
              textAlign: 'center', 
              p: 4, 
              my: 3,
              borderRadius: 2,
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Box sx={{ mb: 1, opacity: 0.7 }}>
              <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay tareas que coincidan con los filtros.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 450 }}>
              Prueba cambiando los filtros o agrega una nueva tarea.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Nueva Tarea
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedTasks.map(task => (
                <Grid item xs={12} sm={6} md={4} key={task._id} className="staggered-item">
                  <TaskCard 
                    task={task} 
                    onEdit={handleOpenEdit}
                    onDelete={showDeleteConfirmation}
                    onComplete={completeTask}
                    onReopen={reopenTask}
                  />
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  showFirstButton 
                  showLastButton
                  siblingCount={isMobile ? 0 : 1}
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Botón flotante para móvil */}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { xs: 'flex', sm: 'none' } 
        }}
        onClick={handleOpenCreate}
      >
        <AddIcon />
      </Fab>
      
      {/* Panel de filtros avanzados */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filtros</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
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
          
          <FormControl fullWidth sx={{ mb: 2 }}>
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
          
          <FormControl fullWidth sx={{ mb: 3 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: course.color || '#9e9e9e',
                      }}
                    />
                    {course.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                setFilter({
                  status: 'all',
                  priority: 'all',
                  course: 'all'
                });
              }}
            >
              Limpiar
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Drawer>
      
      {/* Modal para crear/editar tarea */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
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
              autoFocus
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="span"
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: course.color || '#9e9e9e',
                        }}
                      />
                      {course.name}
                    </Box>
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
                  sx={{ width: '100%' }}
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

      {/* Diálogo de confirmación de eliminación */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={deleteTask}
        title="Eliminar Tarea"
        content="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
      />
    </Container>
  );
};

export default Tasks;