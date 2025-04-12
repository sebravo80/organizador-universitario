// src/pages/Courses.jsx
import { useState, useEffect } from 'react';
import { getCourses, createCourse, deleteCourse } from '../services/courseService';
import { 
  Container, Typography, Button, Grid, Card, CardContent, 
  CardActions, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, Alert 
} from '@mui/material';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    professor: '',
    schedule: '',
    room: ''
  });

  // Cargar cursos al montar el componente
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los cursos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setNewCourse({
      ...newCourse,
      [e.target.name]: e.target.value
    });
  };

  // Crear un nuevo curso
  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      const course = await createCourse(newCourse);
      setCourses([...courses, course]);
      setNewCourse({
        name: '',
        code: '',
        professor: '',
        schedule: '',
        room: ''
      });
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Error al crear el curso');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un curso
  const handleDeleteCourse = async (id) => {
    try {
      setLoading(true);
      await deleteCourse(id);
      setCourses(courses.filter(course => course._id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar el curso');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mis Cursos
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Añadir Curso
      </Button>
      
      {loading && courses.length === 0 ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {course.name}
                  </Typography>
                  <Typography color="text.secondary">
                    Código: {course.code}
                  </Typography>
                  <Typography variant="body2">
                    Profesor: {course.professor}
                  </Typography>
                  <Typography variant="body2">
                    Horario: {course.schedule}
                  </Typography>
                  <Typography variant="body2">
                    Sala: {course.room}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">Editar</Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo para añadir curso */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Añadir Nuevo Curso</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre del Curso"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="code"
            label="Código"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.code}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="professor"
            label="Profesor"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.professor}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="schedule"
            label="Horario"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.schedule}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="room"
            label="Sala"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.room}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateCourse} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Courses;