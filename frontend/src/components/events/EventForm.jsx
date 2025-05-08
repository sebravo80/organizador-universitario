import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaletteIcon from '@mui/icons-material/Palette';

// Colores predefinidos para eventos
const eventColors = [
  { value: "#4CAF50", label: "Verde" },
  { value: "#2196F3", label: "Azul" },
  { value: "#F44336", label: "Rojo" },
  { value: "#FF9800", label: "Naranja" },
  { value: "#9C27B0", label: "Púrpura" },
  { value: "#607D8B", label: "Gris azulado" },
  { value: "#795548", label: "Marrón" },
  { value: "#FFEB3B", label: "Amarillo" },
  { value: "#E91E63", label: "Rosa" },
];

const EventForm = ({ open, onClose, onSave, event }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estado para el formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  
  // Cargar cursos al iniciar
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        alert('Error al cargar los cursos');
      }
    };
    
    fetchCourses();
  }, []);
  
  // Cargar datos del evento al editar
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      setLocation(event.location || '');
      setColor(event.color || '#4CAF50');
      setCourseId(event.course ? event.course._id : '');
    } else {
      // Valores predeterminados para nuevo evento
      setTitle('');
      setDescription('');
      setStartDate(new Date());
      setEndDate(new Date());
      setLocation('');
      setColor('#4CAF50');
      setCourseId('');
    }
  }, [event]);
  
  // Validar formulario
  const isFormValid = () => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return false;
    }
    
    if (endDate < startDate) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
      return false;
    }
    
    return true;
  };
  
  // Manejar guardado
  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setLoading(true);
    try {
      const eventData = {
        title,
        description: description.trim() || null,
        startDate,
        endDate,
        location: location.trim() || null,
        color,
        course: courseId || null,
      };
      
      await onSave(eventData);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen} // Usar pantalla completa en móviles
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 }, // Sin bordes redondeados en móviles para mejor uso del espacio
          maxHeight: { xs: '100%', sm: '90vh' }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">
          {event ? 'Editar Evento' : 'Nuevo Evento'}
        </Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <TextField
              autoFocus
              label="Título"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              required
            />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <DateTimePicker
                label="Fecha y hora de inicio"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                sx={{ flex: 1 }}
              />
              
              <DateTimePicker
                label="Fecha y hora de fin"
                value={endDate}
                onChange={(newDate) => setEndDate(newDate)}
                minDateTime={startDate}
                sx={{ flex: 1 }}
              />
            </Box>
            
            <TextField
              label="Descripción"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Ubicación"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Box>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Opciones avanzadas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel id="course-label">Curso relacionado</InputLabel>
                    <Select
                      labelId="course-label"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      label="Curso relacionado"
                    >
                      <MenuItem value="">
                        <em>Ninguno</em>
                      </MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course._id} value={course._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: course.color,
                              }}
                            />
                            {course.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel id="color-label">Color</InputLabel>
                    <Select
                      labelId="color-label"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      label="Color"
                      startAdornment={<PaletteIcon color="action" sx={{ ml: 1 }} />}
                    >
                      {eventColors.map((colorOption) => (
                        <MenuItem key={colorOption.value} value={colorOption.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: colorOption.value,
                              }}
                            />
                            {colorOption.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {event ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm;