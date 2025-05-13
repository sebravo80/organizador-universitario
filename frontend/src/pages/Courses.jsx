import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardActions,
  Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Divider, List, ListItem,
  Paper, Fab, Avatar
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RoomIcon from '@mui/icons-material/Room';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Alert from '@mui/material/Alert';
import { toast } from 'react-toastify';
import '../styles/animations.css';
import '../styles/courses.css';

const Courses = () => {
  const { isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    professor: '',
    courseCode: '',
    room: '',
    color: '#3498db',
    scheduleStrings: []
  });
  
  const [tempSchedule, setTempSchedule] = useState({
    day: 'Lunes',
    startTime: null,
    endTime: null
  });
  
  const dayAbbreviations = {
    'Lunes': 'Lun',
    'Martes': 'Mar',
    'Miércoles': 'Mié',
    'Miercoles': 'Mié',
    'Jueves': 'Jue',
    'Viernes': 'Vie',
    'Sábado': 'Sáb',
    'Domingo': 'Dom'
  };
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/courses');
        setCourses(res.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar ramos:', err);
        setError('Error al cargar los ramos. Por favor, intenta nuevamente.');
        toast.error('Error al cargar los ramos');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuth) {
      fetchCourses();
    }
  }, [isAuth]);
  
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentCourseId(null);
    setCourseForm({
      name: '',
      professor: '',
      courseCode: '',
      room: '',
      color: '#3498db',
      scheduleStrings: []
    });
    setOpen(true);
  };
  
  const handleOpenEdit = (course) => {
    setIsEditing(true);
    setCurrentCourseId(course._id);
    setCourseForm({
      name: course.name,
      professor: course.professor || '',
      courseCode: course.courseCode || '',
      room: course.room || '',
      color: course.color || '#3498db',
      scheduleStrings: course.scheduleStrings || []
    });
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentCourseId(null);
    setCourseForm({
      name: '',
      professor: '',
      courseCode: '',
      room: '',
      color: '#3498db',
      scheduleStrings: []
    });
    setTempSchedule({
      day: 'Lunes',
      startTime: null,
      endTime: null
    });
  };
  
  const handleChange = (e) => {
    setCourseForm({
      ...courseForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleScheduleChange = (field, value) => {
    setTempSchedule({
      ...tempSchedule,
      [field]: value
    });
  };
  
  const addSchedule = () => {
    if (!tempSchedule.startTime || !tempSchedule.endTime) {
      return;
    }
    
    const formattedStartTime = format(tempSchedule.startTime, 'HH:mm');
    const formattedEndTime = format(tempSchedule.endTime, 'HH:mm');
    
    // Asegurarse de que 'Miércoles' siempre se traduzca a 'Mié' con acento
    let dayAbbr = dayAbbreviations[tempSchedule.day] || tempSchedule.day;
    if (tempSchedule.day === 'Miércoles') {
      dayAbbr = 'Mié';  // Forzar el acento
    }
    
    const scheduleString = `${dayAbbr} ${formattedStartTime}-${formattedEndTime}`;
    
    setCourseForm({
      ...courseForm,
      scheduleStrings: [...courseForm.scheduleStrings, scheduleString]
    });
    
    setTempSchedule({
      day: tempSchedule.day,
      startTime: null,
      endTime: null
    });

    // Pequeña animación para dar feedback visual
    const scheduleList = document.querySelector('.schedule-list');
    if (scheduleList) {
      scheduleList.classList.add('pulse-effect');
      setTimeout(() => {
        scheduleList.classList.remove('pulse-effect');
      }, 1000);
    }
  };
  
  const removeSchedule = (index) => {
    setCourseForm({
      ...courseForm,
      scheduleStrings: courseForm.scheduleStrings.filter((_, i) => i !== index)
    });
  };
  
  const saveCourse = async () => {
    try {
      if (!courseForm.name.trim()) {
        toast.error('Por favor, ingresa un nombre para el ramo.');
        return;
      }
      
      setLoading(true);
      console.log('Enviando datos del ramo:', courseForm);
      
      if (isEditing) {
        const res = await api.put(`/courses/${currentCourseId}`, courseForm);
        setCourses(courses.map(course => course._id === currentCourseId ? res.data : course));
        toast.success('¡Ramo actualizado con éxito!');
      } else {
        const res = await api.post('/courses', courseForm);
        setCourses([...courses, res.data]);
        toast.success('¡Nuevo ramo agregado con éxito!');
      }
      
      handleClose();
      setError(null);
    } catch (err) {
      console.error('Error al guardar ramo:', err);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el ramo.`);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteCourse = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este ramo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(course => course._id !== id));
      toast.success('Ramo eliminado con éxito');
      setError(null);
    } catch (err) {
      console.error('Error al eliminar ramo:', err);
      toast.error('Error al eliminar el ramo');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" className="page-transition courses-container">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" 
            className="page-title courses-title"
            sx={{ 
              display: 'flex',
              alignItems: 'center', 
              gap: 1
            }}
          >
            <SchoolIcon className="icon-spin-hover" fontSize="large" />
            <span className="text-gradient">Mis Ramos</span>
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            className="add-button-animate"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Nuevo Ramo
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} className="slide-in-top">
            {error}
          </Alert>
        )}
        
        {loading && courses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }} className="loading-container">
            <CircularProgress className="pulse-effect" />
            <SchoolIcon 
              sx={{ 
                position: 'absolute', 
                fontSize: 40, 
                color: 'primary.main',
                opacity: 0.7
              }} 
              className="rotate-effect"
            />
          </Box>
        ) : courses.length === 0 ? (
          <Paper 
            elevation={1}
            className="courses-empty-state fade-in-up"
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
              gap: 2
            }}
          >
            <SchoolIcon className="course-icon bounce-effect" color="action" />
            <Typography variant="h6" color="text.secondary" gutterBottom className="typing-effect-slow">
              No tienes ramos registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 2 }} className="fade-in">
              Los ramos te permiten organizar tus clases, tareas y eventos académicos. Comienza añadiendo tu primer ramo.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              className="button-pulse"
            >
              Añadir Ramo
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }} className="courses-grid">
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={4} key={course._id} className={`staggered-item delay-${index}`}>
                <Card 
                  className="course-card" 
                  sx={{ 
                    borderTop: `3px solid ${course.color}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    className="course-color-accent"
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%',
                      background: `linear-gradient(to bottom, ${course.color}15, transparent)`,
                      zIndex: 0
                    }}
                  />
                  
                  <Avatar 
                    className="course-avatar" 
                    sx={{ 
                      bgcolor: course.color, 
                      position: 'absolute', 
                      top: 16, 
                      right: 16,
                      boxShadow: `0 4px 8px ${course.color}60`
                    }}
                  >
                    <BookmarkIcon />
                  </Avatar>
                  
                  <CardContent sx={{ pb: 1, position: 'relative', zIndex: 1, flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600, pr: 5 }} className="course-title-animate">
                      {course.name}
                    </Typography>
                    
                    <Box className="course-details">
                      {course.courseCode && (
                        <Box className="course-info slide-in-left">
                          <CodeIcon fontSize="small" sx={{ color: course.color }} className="icon-pulse" />
                          <Typography variant="body2">
                            <strong>Código:</strong> {course.courseCode}
                          </Typography>
                        </Box>
                      )}
                      
                      {course.professor && (
                        <Box className="course-info slide-in-left" sx={{ animationDelay: '0.1s' }}>
                          <PersonIcon fontSize="small" sx={{ color: course.color }} className="icon-pulse" />
                          <Typography variant="body2">
                            <strong>Profesor:</strong> {course.professor}
                          </Typography>
                        </Box>
                      )}
                      
                      {course.room && (
                        <Box className="course-info slide-in-left" sx={{ animationDelay: '0.2s' }}>
                          <RoomIcon fontSize="small" sx={{ color: course.color }} className="icon-bounce" />
                          <Typography variant="body2">
                            <strong>Sala:</strong> {course.room}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} className="divider-animate" />
                    
                    <Box className="course-schedule-title">
                      <ScheduleIcon fontSize="small" sx={{ mr: 1, color: course.color }} className="rotate-on-hover" />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Horarios:
                      </Typography>
                    </Box>
                    
                    <Box className="course-schedule-container">
                      {course.scheduleStrings && course.scheduleStrings.length > 0 ? (
                        <List className="schedule-list" dense>
                          {course.scheduleStrings.map((schedule, index) => (
                            <ListItem className={`schedule-item schedule-animate-${index}`} key={index} disableGutters>
                              <AccessTimeIcon fontSize="small" sx={{ color: course.color }} className="icon-rotate" />
                              <span className="schedule-text">{schedule}</span>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }} className="fade-in">
                          No hay horarios registrados
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions className="course-actions">
                    <IconButton 
                      aria-label="editar"
                      onClick={() => handleOpenEdit(course)}
                      title="Editar ramo"
                      className="action-button edit-button"
                      sx={{ 
                        color: course.color,
                        '&:hover': { 
                          backgroundColor: `${course.color}20` 
                        } 
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="eliminar"
                      onClick={() => deleteCourse(course._id)}
                      title="Eliminar ramo"
                      className="action-button delete-button"
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { 
                          backgroundColor: 'rgba(244, 67, 54, 0.1)' 
                        } 
                      }}
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
      
      {/* Botón flotante para móvil */}
      <Fab 
        color="primary" 
        aria-label="add" 
        className="fab-button"
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
      
      {/* Modal para crear/editar ramo */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        className="dialog-animate"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderLeft: `4px solid ${courseForm.color}`,
          bgcolor: `${courseForm.color}10`,
          display: 'flex',
          alignItems: 'center',
          p: 2
        }}>
          <Box component="span" sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            bgcolor: courseForm.color, 
            mr: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${courseForm.color}80`,
          }}
          className="pulse-effect">
            {isEditing ? <EditIcon sx={{ color: 'white', fontSize: 18 }} /> : <AddIcon sx={{ color: 'white', fontSize: 18 }} />}
          </Box>
          <Typography variant="h6" className="slide-in-right">
            {isEditing ? 'Editar Ramo' : 'Nuevo Ramo'}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Box component="form" noValidate>
            <TextField
              fullWidth
              label="Nombre del ramo"
              name="name"
              value={courseForm.name}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              required
              autoFocus
              className="form-field-animate"
              InputProps={{
                startAdornment: <BookmarkIcon fontSize="small" sx={{ mr: 1, color: courseForm.color }} />,
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <TextField
              fullWidth
              label="Código del ramo"
              name="courseCode"
              value={courseForm.courseCode}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              className="form-field-animate"
              sx={{ animationDelay: '0.1s' }}
              InputProps={{
                startAdornment: <CodeIcon fontSize="small" sx={{ mr: 1, color: courseForm.color }} />,
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <TextField
              fullWidth
              label="Profesor"
              name="professor"
              value={courseForm.professor}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              className="form-field-animate"
              sx={{ animationDelay: '0.2s' }}
              InputProps={{
                startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1, color: courseForm.color }} />,
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <TextField
              fullWidth
              label="Sala"
              name="room"
              value={courseForm.room}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              className="form-field-animate"
              sx={{ animationDelay: '0.3s' }}
              InputProps={{
                startAdornment: <RoomIcon fontSize="small" sx={{ mr: 1, color: courseForm.color }} />,
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500
              }}>
                <ColorLensIcon sx={{ mr: 1, color: courseForm.color }} className="rotate-effect" />
                Color del ramo
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: -2 }}>
                <TextField
                  type="color"
                  fullWidth
                  name="color"
                  value={courseForm.color}
                  onChange={handleChange}
                  variant= "outlined"
                  margin="normal"
                  className="form-field-animate"
                  label="Selecciona un color"
                  sx={{ mb: 1 }}
                />
                
                <Box className="color-preview" sx={{ 
                  height: 40, 
                  width: '100%', 
                  bgcolor: courseForm.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  boxShadow: `0 2px 8px ${courseForm.color}60`,
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    Vista previa del color
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} className="divider-animate" />
            
            <Typography variant="h6" sx={{ 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              color: courseForm.color,
              fontWeight: 600
            }}
            className="slide-in-left">
              <ScheduleIcon sx={{ mr: 1 }} className="rotate-on-hover" />
              Horario
            </Typography>
            
            <Grid container spacing={2} alignItems="center" className="schedule-form-container">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth className="form-field-animate" sx={{ animationDelay: '0.1s' }}>
                  <InputLabel id="day-label">Día</InputLabel>
                  <Select
                    labelId="day-label"
                    id="day"
                    value={tempSchedule.day}
                    onChange={(e) => handleScheduleChange('day', e.target.value)}
                    label="Día"
                    sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }}
                  >
                    <MenuItem value="Lunes">Lunes</MenuItem>
                    <MenuItem value="Martes">Martes</MenuItem>
                    <MenuItem value="Miércoles">Miércoles</MenuItem>
                    <MenuItem value="Jueves">Jueves</MenuItem>
                    <MenuItem value="Viernes">Viernes</MenuItem>
                    <MenuItem value="Sábado">Sábado</MenuItem>
                    <MenuItem value="Domingo">Domingo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <TimePicker
                    label="Hora inicio"
                    value={tempSchedule.startTime}
                    onChange={(newValue) => handleScheduleChange('startTime', newValue)}
                    sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }}
                    className="form-field-animate"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <TimePicker
                    label="Hora fin"
                    value={tempSchedule.endTime}
                    onChange={(newValue) => handleScheduleChange('endTime', newValue)}
                    sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }}
                    className="form-field-animate" 
                    //sx={{ animationDelay: '0.2s' }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Button 
                  variant="outlined" 
                  onClick={addSchedule}
                  disabled={!tempSchedule.startTime || !tempSchedule.endTime}
                  fullWidth
                  sx={{ 
                    borderColor: courseForm.color, 
                    color: courseForm.color,
                    '&:hover': {
                      borderColor: courseForm.color,
                      backgroundColor: `${courseForm.color}20`
                    }
                  }}
                  startIcon={<AddIcon />}
                  className="add-schedule-button"
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
            
            {courseForm.scheduleStrings.length > 0 && (
              <Box sx={{ mt: 3 }} className="schedules-container fade-in">
                <Typography variant="subtitle1" sx={{ mb: 1, color: courseForm.color, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem' }} className="pulse-effect" />
                  Horarios agregados:
                </Typography>
                <List className="schedule-list">
                  {courseForm.scheduleStrings.map((schedule, index) => (
                    <ListItem 
                      className="schedule-item staggered-left-item"
                      key={index}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => removeSchedule(index)} 
                          size="small"
                          className="delete-schedule-button"
                        >
                          <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                        </IconButton>
                      }
                      sx={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <AccessTimeIcon sx={{ color: courseForm.color, fontSize: '1rem' }} className="icon-rotate" />
                      <span className="schedule-text">{schedule}</span>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: `${courseForm.color}08` }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            className="cancel-button-animate"
          >
            Cancelar
          </Button>
          <Button 
            onClick={saveCourse} 
            variant="contained" 
            disabled={!courseForm.name.trim() || loading}
            sx={{ 
              bgcolor: courseForm.color,
              '&:hover': {
                bgcolor: courseForm.color,
                filter: 'brightness(0.9)'
              }
            }}
            className="save-button-animate"
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                {isEditing ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              isEditing ? 'Guardar cambios' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;