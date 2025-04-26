import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Container, Typography, Box, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, Grid, Card, CardContent, CardHeader, Chip,
  Divider, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Grades = () => {
  const { isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de nota
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGradeId, setCurrentGradeId] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    course: '',
    name: '',
    score: '',
    weight: '',
    notes: ''
  });
  
  // Estado para filtro
  const [selectedCourse, setSelectedCourse] = useState('all');
  
  // Cargar cursos y notas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        
        // Obtener notas
        const gradesRes = await api.get('/grades');
        setGrades(gradesRes.data);
        
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
  
  // Abrir diálogo para crear nota
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentGradeId(null);
    setGradeForm({
      course: selectedCourse !== 'all' ? selectedCourse : '',
      name: '',
      score: '',
      weight: '',
      notes: ''
    });
    setOpen(true);
  };
  
  // Abrir diálogo para editar nota
  const handleOpenEdit = (grade) => {
    setIsEditing(true);
    setCurrentGradeId(grade._id);
    setGradeForm({
      course: grade.course._id,
      name: grade.name,
      score: grade.score,
      weight: grade.weight,
      notes: grade.notes || ''
    });
    setOpen(true);
  };
  
  // Cerrar diálogo
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentGradeId(null);
    setGradeForm({
      course: '',
      name: '',
      score: '',
      weight: '',
      notes: ''
    });
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const value = e.target.name === 'score' || e.target.name === 'weight' 
      ? parseFloat(e.target.value) 
      : e.target.value;
      
    setGradeForm({
      ...gradeForm,
      [e.target.name]: value
    });
  };
  
  // Crear o actualizar nota
  const saveGrade = async () => {
    try {
      // Validar que se haya ingresado un nombre, curso, nota y porcentaje
      if (!gradeForm.name.trim() || !gradeForm.course || gradeForm.score === '' || gradeForm.weight === '') {
        setError('Por favor, completa todos los campos obligatorios.');
        return;
      }
      
      // Validar que la nota esté en el rango correcto
      if (gradeForm.score < 0 || gradeForm.score > 7) {
        setError('La nota debe estar entre 0 y 7.');
        return;
      }
      
      // Validar que el porcentaje esté en el rango correcto
      if (gradeForm.weight <= 0 || gradeForm.weight > 100) {
        setError('El porcentaje debe estar entre 1 y 100.');
        return;
      }
      
      if (isEditing) {
        // Actualizar nota existente
        const res = await api.put(`/grades/${currentGradeId}`, gradeForm);
        
        // Actualizar la nota en la lista
        setGrades(grades.map(grade => grade._id === currentGradeId ? res.data : grade));
      } else {
        // Crear nueva nota
        const res = await api.post('/grades', gradeForm);
        
        // Agregar la nueva nota a la lista
        setGrades([...grades, res.data]);
      }
      
      // Cerrar diálogo
      handleClose();
      
      setError(null);
    } catch (err) {
      console.error('Error al guardar nota:', err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la nota. Por favor, intenta nuevamente.`);
    }
  };
  
  // Eliminar nota
  const deleteGrade = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      try {
        await api.delete(`/grades/${id}`);
        
        // Eliminar la nota de la lista
        setGrades(grades.filter(grade => grade._id !== id));
        
        setError(null);
      } catch (err) {
        console.error('Error al eliminar nota:', err);
        setError('Error al eliminar la nota. Por favor, intenta nuevamente.');
      }
    }
  };
  
  // Filtrar notas por curso
  const filteredGrades = selectedCourse === 'all' 
    ? grades 
    : grades.filter(grade => grade.course._id === selectedCourse);
  
  // Agrupar notas por curso para mostrar promedios
  const groupedGrades = grades.reduce((acc, grade) => {
    const courseId = grade.course._id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: grade.course,
        grades: []
      };
    }
    acc[courseId].grades.push(grade);
    return acc;
  }, {});
  
  // Calcular promedio de notas para un curso
  const calculateAverage = (grades) => {
    if (grades.length === 0) return 0;
    
    // Calcular la suma de (nota * porcentaje)
    let weightedSum = 0;
    let totalWeight = 0;
    
    grades.forEach(grade => {
      weightedSum += (grade.score * (grade.weight / 100));
      totalWeight += (grade.weight / 100);
    });
    
    // Si los pesos no suman 100%, normalizar
    return totalWeight > 0 ? (weightedSum / totalWeight) : 0;
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PP', { locale: es });
  };
  
  // Estado de aprobación por curso
  const getApprovalStatus = (average) => {
    if (average >= 4.0) return { label: 'Aprobado', color: 'success' };
    if (average >= 3.5) return { label: 'En riesgo', color: 'warning' };
    return { label: 'Reprobado', color: 'error' };
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando notas...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Mis Notas
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nueva Nota
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Resumen de promedios por curso */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Resumen de Promedios
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.values(groupedGrades).map(({ course, grades }) => {
            const average = calculateAverage(grades);
            const status = getApprovalStatus(average);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card sx={{ borderTop: `4px solid ${course.color}` }}>
                  <CardHeader 
                    title={course.name} 
                    subheader={`${grades.length} evaluaciones`}
                  />
                  <CardContent>
                    <Typography variant="h3" component="div" align="center" gutterBottom>
                      {average.toFixed(1)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Chip 
                        label={status.label} 
                        color={status.color}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Filtro de curso y tabla de notas */}
        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="course-filter-label">Filtrar por curso</InputLabel>
            <Select
              labelId="course-filter-label"
              id="course-filter"
              value={selectedCourse}
              label="Filtrar por curso"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <MenuItem value="all">Todos los cursos</MenuItem>
              {courses.map(course => (
                <MenuItem key={course._id} value={course._id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {filteredGrades.length === 0 ? (
          <Typography>No hay notas registradas para este curso.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Curso</TableCell>
                  <TableCell>Evaluación</TableCell>
                  <TableCell align="center">Nota</TableCell>
                  <TableCell align="center">Porcentaje</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow key={grade._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: grade.course.color,
                          marginRight: 8
                        }} />
                        {grade.course.name}
                      </Box>
                    </TableCell>
                    <TableCell>{grade.name}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={grade.score.toFixed(1)} 
                        color={grade.score >= 4 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="center">{grade.weight}%</TableCell>
                    <TableCell>{formatDate(grade.date)}</TableCell>
                    <TableCell>{grade.notes}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        aria-label="editar"
                        onClick={() => handleOpenEdit(grade)}
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        aria-label="eliminar"
                        onClick={() => deleteGrade(grade._id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Diálogo para crear/editar nota */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Nota' : 'Nueva Nota'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="course-label">Curso</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                name="course"
                value={gradeForm.course}
                label="Curso"
                onChange={handleChange}
                required
              >
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre de la evaluación"
              name="name"
              value={gradeForm.name}
              onChange={handleChange}
              placeholder="Ej: Examen parcial, Control 1, Tarea 2"
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="score"
                  label="Nota (0-7)"
                  name="score"
                  type="number"
                  value={gradeForm.score}
                  onChange={handleChange}
                  inputProps={{ 
                    min: 0, 
                    max: 7, 
                    step: 0.1 
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="weight"
                  label="Porcentaje (%)"
                  name="weight"
                  type="number"
                  value={gradeForm.weight}
                  onChange={handleChange}
                  inputProps={{ 
                    min: 1, 
                    max: 100, 
                    step: 1 
                  }}
                />
              </Grid>
            </Grid>
            
            <TextField
              margin="normal"
              fullWidth
              id="notes"
              label="Observaciones (opcional)"
              name="notes"
              multiline
              rows={2}
              value={gradeForm.notes}
              onChange={handleChange}
              placeholder="Ej: Comentarios del profesor, temas evaluados"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={saveGrade} variant="contained">
            {isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Grades;