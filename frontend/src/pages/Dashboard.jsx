import { useState, useEffect, useContext } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  List, ListItem, ListItemText, Divider, 
  Chip, CircularProgress, Alert
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { getCourses } from '../services/courseService';
import { getTasks } from '../services/taskService';
import { getEvents } from '../services/eventService';
import TaskCountdown from '../components/TaskCountdown';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar cursos, tareas y eventos en paralelo
        const [coursesData, tasksData, eventsData] = await Promise.all([
          getCourses(),
          getTasks(),
          getEvents()
        ]);
        
        setCourses(coursesData);
        
        // Filtrar tareas no completadas
        const pendingTasks = tasksData.filter(task => !task.completed);
        setTasks(pendingTasks);
        
        // Filtrar eventos futuros
        const now = new Date();
        const upcomingEvents = eventsData.filter(event => new Date(event.start) > now);
        // Ordenar por fecha
        upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(upcomingEvents);
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para obtener color según prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.name || 'Usuario'}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Resumen de cursos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mis Cursos ({courses.length})
            </Typography>
            {courses.length === 0 ? (
              <Alert severity="info">
                No tienes cursos registrados. ¡Añade tu primer curso!
              </Alert>
            ) : (
              <List>
                {courses.slice(0, 5).map((course, index) => (
                  <Box key={course._id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={course.name}
                        secondary={`${course.code} - ${course.professor}`}
                      />
                    </ListItem>
                  </Box>
                ))}
                {courses.length > 5 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Y {courses.length - 5} más...
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Tareas pendientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tareas Pendientes ({tasks.length})
            </Typography>
            {tasks.length === 0 ? (
              <Alert severity="success">
                ¡No tienes tareas pendientes!
              </Alert>
            ) : (
              <List>
                {tasks.slice(0, 5).map((task, index) => (
                  <Box key={task._id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            {task.course?.name && `${task.course.name} - `}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </>
                        }
                      />
                      <Chip 
                        label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                        size="small" 
                        color={getPriorityColor(task.priority)}
                      />
                    </ListItem>
                  </Box>
                ))}
                {tasks.length > 5 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Y {tasks.length - 5} más...
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Próximos eventos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Próximos Eventos
            </Typography>
            {events.length === 0 ? (
              <Alert severity="info">
                No tienes eventos próximos programados.
              </Alert>
            ) : (
              <List>
                {events.slice(0, 5).map((event, index) => (
                  <Box key={event._id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            {event.course?.name && `${event.course.name} - `}
                            {formatDate(event.start)}
                            {event.end && ` hasta ${formatDate(event.end)}`}
                          </>
                        }
                      />
                      <Chip 
                        label={event.type || 'Evento'} 
                        size="small" 
                        color={event.type === 'examen' ? 'error' : 'primary'}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Cuenta regresiva de tareas */}
        <Grid item xs={12}>
          <TaskCountdown />
        </Grid>
        
        {/* Resumen del semestre */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Semestre
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {courses.length}
                  </Typography>
                  <Typography variant="body1">Cursos</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="error">
                    {tasks.filter(t => t.priority === 'alta').length}
                  </Typography>
                  <Typography variant="body1">Tareas Prioritarias</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {events.filter(e => e.type === 'examen').length}
                  </Typography>
                  <Typography variant="body1">Exámenes</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {tasks.filter(t => t.completed).length}
                  </Typography>
                  <Typography variant="body1">Tareas Completadas</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;