import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, Divider, Avatar,
  CircularProgress, Paper, Fab, Alert
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RoomIcon from '@mui/icons-material/Room';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import ColorLensIcon from '@mui/icons-material/ColorLens';
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
    setTempSchedule({
      day: 'Lunes',
      startTime: null,
      endTime: null
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
    setTempSchedule({
      day: 'Lunes',
      startTime: null,
      endTime: null
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
    <Container maxWidth="lg" className="page-transition">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ 
            display: 'flex',
            alignItems: 'center', 
            gap: 1,
            fontWeight: 'bold'
          }}>
            <SchoolIcon color="primary" fontSize="large" />
            Mis Ramos
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Nuevo Ramo
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading && courses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : courses.length === 0 ? (
          <Paper 
            elevation={1}
            className="courses-empty-state"
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
            <SchoolIcon className="course-icon" color="action" />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes ramos registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 2 }}>
              Los ramos te permiten organizar tus clases, tareas y eventos académicos. Comienza añadiendo tu primer ramo.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Añadir Ramo
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={4} key={course._id} className="staggered-item">
                <Card className="course-card" sx={{ borderTop: `4px solid ${course.color}` }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box className="course-card-header">
                      <Typography variant="h6" component="h2" sx={{ 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {course.name}
                      </Typography>
                      <Avatar 
                        className="course-avatar"
                        sx={{ 
                          bgcolor: course.color, 
                          boxShadow: `0 2px 8px ${course.color}80`,
                          width: 36, 
                          height: 36, 
                          fontSize: '1rem' 
                        }}
                      >
                        {course.name.charAt(0)}
                      </Avatar>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      {course.courseCode && (
                        <Box className="course-info">
                          <CodeIcon fontSize="small" sx={{ color: course.color }} />
                          <Typography variant="body2">
                            <strong>Código:</strong> {course.courseCode}
                          </Typography>
                        </Box>
                      )}
                      
                      {course.professor && (
                        <Box className="course-info">
                          <PersonIcon fontSize="small" sx={{ color: course.color }} />
                          <Typography variant="body2">
                            <strong>Profesor:</strong> {course.professor}
                          </Typography>
                        </Box>
                      )}
                      
                      {course.room && (
                        <Box className="course-info">
                          <RoomIcon fontSize="small" sx={{ color: course.color }} />
                          <Typography variant="body2">
                            <strong>Sala:</strong> {course.room}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box className="course-schedule-title">
                      <ScheduleIcon fontSize="small" sx={{ mr: 1, color: course.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Horarios:
                      </Typography>
                    </Box>
                    
                    <Box className="course-schedule-container">
                      {course.scheduleStrings && course.scheduleStrings.length > 0 ? (
                        <List className="schedule-list" dense>
                          {course.scheduleStrings.map((schedule, index) => (
                            <ListItem className="schedule-item" key={index} disableGutters>
                              <AccessTimeIcon fontSize="small" sx={{ color: course.color }} />
                              <span className="schedule-text">{schedule}</span>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
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
          }}>
            {isEditing ? <EditIcon sx={{ color: 'white', fontSize: 18 }} /> : <AddIcon sx={{ color: 'white', fontSize: 18 }} />}
          </Box>
          <Typography variant="h6">
            {isEditing ? 'Editar Ramo' : 'Nuevo Ramo'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre del Ramo"
              name="name"
              value={courseForm.name}
              onChange={handleChange}
              autoFocus
              InputProps={{
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="courseCode"
              label="Código del ramo"
              name="courseCode"
              value={courseForm.courseCode}
              onChange={handleChange}
              placeholder="Ej: MAT1001"
              InputProps={{
                startAdornment: <CodeIcon fontSize="small" sx={{ mr: 1, color: courseForm.color }} />,
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="professor"
              label="Profesor"
              name="professor"
              value={courseForm.professor}
              onChange={handleChange}
              InputProps={{
                startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1, color: courseForm.color }} />,
                sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color } }
              }}
              InputLabelProps={{
                sx: { '&.Mui-focused': { color: courseForm.color } }
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="room"
              label="Sala"
              name="room"
              value={courseForm.room}
              onChange={handleChange}
              placeholder="Ej: A-101"
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
                <ColorLensIcon sx={{ mr: 1, color: courseForm.color }} />
                Color del ramo
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  type="color"
                  fullWidth
                  name="color"
                  value={courseForm.color}
                  onChange={handleChange}
                  variant="outlined"
                  label="Selecciona un color"
                  InputProps={{
                    startAdornment: (
                      <Box
                        component="span"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: courseForm.color,
                          mr: 1,
                          border: '2px solid white',
                          boxShadow: `0 0 5px rgba(0,0,0,0.2)`,
                        }}
                      />
                    ),
                    sx: { 
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: courseForm.color },
                      '& input[type=color]': { 
                        width: '50px',
                        cursor: 'pointer',
                        padding: '0',
                        marginLeft: 'auto',
                        backgroundColor: 'transparent'
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { '&.Mui-focused': { color: courseForm.color } }
                  }}
                />
              </Box>
              
              <Box className="color-preview" sx={{ 
                bgcolor: `${courseForm.color}20`, 
                border: `1px solid ${courseForm.color}40`,
                mt: 2
              }}>
                <Typography variant="body2" sx={{ color: courseForm.color, fontWeight: 500 }}>
                  Vista previa del color
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" sx={{ 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              color: courseForm.color,
              fontWeight: 600
            }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              Horario
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
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
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
            
            {courseForm.scheduleStrings.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: courseForm.color, fontWeight: 500 }}>
                  Horarios agregados:
                </Typography>
                <List className="schedule-list">
                  {courseForm.scheduleStrings.map((schedule, index) => (
                    <ListItem 
                      className="schedule-item"
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => removeSchedule(index)} size="small">
                          <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                        </IconButton>
                      }
                    >
                      <AccessTimeIcon sx={{ color: courseForm.color, fontSize: '1rem' }} />
                      <span className="schedule-text">{schedule}</span>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: `${courseForm.color}08` }}>
          <Button onClick={handleClose} variant="outlined">Cancelar</Button>
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