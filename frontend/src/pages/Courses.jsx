// src/pages/Courses.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, Divider, Avatar
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
    
    const dayAbbr = dayAbbreviations[tempSchedule.day] || tempSchedule.day;
    const scheduleString = `${dayAbbr} ${formattedStartTime}-${formattedEndTime}`;
    
    setCourseForm({
      ...courseForm,
      scheduleStrings: [...courseForm.scheduleStrings, scheduleString]
    });
    
    setTempSchedule({
      day: 'Lunes',
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
        setError('Por favor, ingresa un nombre para el ramo.');
        return;
      }
      
      console.log('Enviando datos del ramo:', courseForm);
      
      if (isEditing) {
        const res = await api.put(`/courses/${currentCourseId}`, courseForm);
        setCourses(courses.map(course => course._id === currentCourseId ? res.data : course));
      } else {
        const res = await api.post('/courses', courseForm);
        setCourses([...courses, res.data]);
      }
      
      handleClose();
      setError(null);
    } catch (err) {
      console.error('Error al guardar ramo:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el ramo. Por favor, intenta nuevamente.`);
    }
  };
  
  const deleteCourse = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(course => course._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar ramo:', err);
      setError('Error al eliminar el ramo. Por favor, intenta nuevamente.');
    }
  };
  
  return (
    <Container maxWidth="lg" className="page-transition">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Ramos
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ mb: 3 }}
        >
          Nuevo Ramo
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Typography>Cargando ramos...</Typography>
        ) : courses.length === 0 ? (
          <Typography>No tienes ramos registrados.</Typography>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={4} key={course._id} className="staggered-item">
                <Card sx={{ 
                  borderTop: `4px solid ${course.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 0 }}>
                        {course.name}
                      </Typography>
                      <Avatar sx={{ bgcolor: course.color, width: 34, height: 34, fontSize: '1rem' }}>
                        {course.name.charAt(0)}
                      </Avatar>
                    </Box>
                    
                    {course.courseCode && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CodeIcon fontSize="small" sx={{ mr: 0.5, color: course.color }} />
                        Código: {course.courseCode}
                      </Typography>
                    )}
                    
                    {course.professor && (
                      <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }} gutterBottom>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, color: course.color }} />
                        {course.professor}
                      </Typography>
                    )}
                    
                    {course.room && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <RoomIcon fontSize="small" sx={{ mr: 0.5, color: course.color }} />
                        Sala: {course.room}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon fontSize="small" sx={{ mr: 0.5, color: course.color }} />
                      Horario:
                    </Typography>
                    
                    <List className="schedule-list" dense sx={{ mt: 1, maxHeight: '120px', overflow: 'auto' }}>
                      {course.scheduleStrings && course.scheduleStrings.map((schedule, index) => (
                        <ListItem className="schedule-item" key={index} disableGutters>
                          <AccessTimeIcon fontSize="small" sx={{ color: course.color }} />
                          <span className="schedule-text">
                            {schedule}
                          </span>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <CardActions sx={{ 
                    justifyContent: 'flex-end',
                    bgcolor: 'rgba(0, 0, 0, 0.03)',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
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
      
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          borderLeft: `4px solid ${courseForm.color}`,
          bgcolor: `${courseForm.color}10`,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box component="span" sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            bgcolor: courseForm.color, 
            mr: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isEditing ? <EditIcon sx={{ color: 'white', fontSize: 16 }} /> : <AddIcon sx={{ color: 'white', fontSize: 16 }} />}
          </Box>
          {isEditing ? 'Editar Ramo' : 'Nuevo Ramo'}
        </DialogTitle>
        <DialogContent>
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
              <TextField
                margin="normal"
                fullWidth
                id="color"
                label="Color"
                name="color"
                type="color"
                value={courseForm.color}
                onChange={handleChange}
                sx={{ maxWidth: 100, mr: 2 }}
              />
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                py: 1, 
                px: 2, 
                borderRadius: 1, 
                bgcolor: `${courseForm.color}20`,
                border: `1px solid ${courseForm.color}40` 
              }}>
                <Typography variant="body2" sx={{ color: courseForm.color, fontWeight: 500 }}>
                  Vista previa del color
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" sx={{ 
              mt: 3, 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              color: courseForm.color
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
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: courseForm.color, fontWeight: 500 }}>
                  Horarios agregados:
                </Typography>
                <List className="schedule-list">
                  {courseForm.scheduleStrings.map((schedule, index) => (
                    <ListItem 
                      className="schedule-item"
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => removeSchedule(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <AccessTimeIcon sx={{ color: courseForm.color }} />
                      <span className="schedule-text">{schedule}</span>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} variant="outlined">Cancelar</Button>
          <Button 
            onClick={saveCourse} 
            variant="contained" 
            sx={{ 
              bgcolor: courseForm.color,
              '&:hover': {
                bgcolor: courseForm.color,
                filter: 'brightness(0.9)'
              }
            }}
          >
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;