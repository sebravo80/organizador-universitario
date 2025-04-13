// src/pages/Courses.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const Courses = () => {
  const { isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de nuevo curso
  const [open, setOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    professor: '',
    color: '#3498db',
    scheduleStrings: []
  });
  
  // Estado para el horario temporal
  const [tempSchedule, setTempSchedule] = useState({
    day: 'Lunes',
    startTime: null,
    endTime: null
  });
  
  // Mapeo de días para abreviaturas
  const dayAbbreviations = {
    'Lunes': 'Lun',
    'Martes': 'Mar',
    'Miércoles': 'Mié',
    'Jueves': 'Jue',
    'Viernes': 'Vie',
    'Sábado': 'Sáb',
    'Domingo': 'Dom'
  };
  
  // Cargar cursos
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/courses');
        setCourses(res.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        setError('Error al cargar los cursos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuth) {
      fetchCourses();
    }
  }, [isAuth]);
  
  // Abrir diálogo
  const handleOpen = () => {
    setOpen(true);
  };
  
  // Cerrar diálogo
  const handleClose = () => {
    setOpen(false);
    setNewCourse({
      name: '',
      professor: '',
      color: '#3498db',
      scheduleStrings: []
    });
    setTempSchedule({
      day: 'Lunes',
      startTime: null,
      endTime: null
    });
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setNewCourse({
      ...newCourse,
      [e.target.name]: e.target.value
    });
  };
  
  // Manejar cambios en el horario temporal
  const handleScheduleChange = (field, value) => {
    setTempSchedule({
      ...tempSchedule,
      [field]: value
    });
  };
  
  // Agregar horario
  const addSchedule = () => {
    // Validar que se hayan seleccionado horas
    if (!tempSchedule.startTime || !tempSchedule.endTime) {
      return;
    }
    
    // Formatear horas
    const formattedStartTime = format(tempSchedule.startTime, 'HH:mm');
    const formattedEndTime = format(tempSchedule.endTime, 'HH:mm');
    
    // Crear string de horario (ej: "Lun 10:00-12:00")
    const dayAbbr = dayAbbreviations[tempSchedule.day] || tempSchedule.day;
    const scheduleString = `${dayAbbr} ${formattedStartTime}-${formattedEndTime}`;
    
    // Agregar horario al curso
    setNewCourse({
      ...newCourse,
      scheduleStrings: [...newCourse.scheduleStrings, scheduleString]
    });
    
    // Resetear horario temporal
    setTempSchedule({
      day: 'Lunes',
      startTime: null,
      endTime: null
    });
  };
  
  // Eliminar horario
  const removeSchedule = (index) => {
    setNewCourse({
      ...newCourse,
      scheduleStrings: newCourse.scheduleStrings.filter((_, i) => i !== index)
    });
  };
  
  // Crear curso
  const createCourse = async () => {
    try {
      // Validar que se haya ingresado un nombre
      if (!newCourse.name.trim()) {
        setError('Por favor, ingresa un nombre para el curso.');
        return;
      }
      
      console.log('Enviando datos del curso:', newCourse);
      
      const res = await api.post('/courses', newCourse);
      
      // Agregar el nuevo curso a la lista
      setCourses([...courses, res.data]);
      
      // Cerrar diálogo
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al crear curso:', err);
      setError('Error al crear el curso. Por favor, intenta nuevamente.');
    }
  };
  
  // Eliminar curso
  const deleteCourse = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      
      // Eliminar el curso de la lista
      setCourses(courses.filter(course => course._id !== id));
      
      setError(null);
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      setError('Error al eliminar el curso. Por favor, intenta nuevamente.');
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Cursos
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ mb: 3 }}
        >
          Nuevo Curso
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Typography>Cargando cursos...</Typography>
        ) : courses.length === 0 ? (
          <Typography>No tienes cursos registrados.</Typography>
        ) : (
          <Grid container spacing={3}>
            {courses.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card sx={{ 
                  borderTop: `4px solid ${course.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {course.name}
                    </Typography>
                    
                    {course.professor && (
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Profesor: {course.professor}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Horario:
                    </Typography>
                    
                    <List dense>
                      {course.scheduleStrings && course.scheduleStrings.map((schedule, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={schedule} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <CardActions>
                    <IconButton 
                      aria-label="editar"
                      // onClick={() => handleEdit(course._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="eliminar"
                      onClick={() => deleteCourse(course._id)}
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
      
      {/* Diálogo para crear nuevo curso */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Curso</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre del curso"
              name="name"
              value={newCourse.name}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="professor"
              label="Profesor"
              name="professor"
              value={newCourse.professor}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="color"
              label="Color"
              name="color"
              type="color"
              value={newCourse.color}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Horario
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="day-label">Día</InputLabel>
                  <Select
                    labelId="day-label"
                    id="day"
                    value={tempSchedule.day}
                    label="Día"
                    onChange={(e) => handleScheduleChange('day', e.target.value)}
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
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <TimePicker
                    label="Hora fin"
                    value={tempSchedule.endTime}
                    onChange={(newValue) => handleScheduleChange('endTime', newValue)}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="outlined" 
                  onClick={addSchedule}
                  disabled={!tempSchedule.startTime || !tempSchedule.endTime}
                  fullWidth
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
            
            {newCourse.scheduleStrings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Horarios agregados:</Typography>
                <List>
                  {newCourse.scheduleStrings.map((schedule, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => removeSchedule(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={schedule} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={createCourse} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;