// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Grid, Paper, Typography, Box, CircularProgress, 
  Alert, List, ListItem, ListItemText, Divider, Chip,
  Card, CardContent, Button
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { getCourses } from '../services/courseService';
import { getTasks } from '../services/taskService';
import { getEvents } from '../services/scheduleService';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [coursesData, tasksData, eventsData] = await Promise.all([
          getCourses(),
          getTasks(),
          getEvents()
        ]);
        
        setCourses(coursesData);
        setTasks(tasksData);
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar tareas pendientes y ordenarlas por fecha
  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Obtener eventos próximos (próximos 7 días)
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= now && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  // Obtener estadísticas
  const totalCourses = courses.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Obtener color según prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.name || 'Usuario'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Cursos
            </Typography>
            <Typography component="p" variant="h4">
              {totalCourses}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              cursos registrados
            </Typography>
            <div>
              <Link to="/courses" style={{ textDecoration: 'none' }}>
                <Button size="small" color="primary">
                  Ver cursos
                </Button>
              </Link>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Tareas
            </Typography>
            <Typography component="p" variant="h4">
              {pendingTasks.length}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              tareas pendientes
            </Typography>
            <div>
              <Link to="/tasks" style={{ textDecoration: 'none' }}>
                <Button size="small" color="primary">
                  Ver tareas
                </Button>
              </Link>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Progreso
            </Typography>
            <Typography component="p" variant="h4">
              {completionRate}%
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              tareas completadas
            </Typography>
            <div>
              <Link to="/weekly" style={{ textDecoration: 'none' }}>
                <Button size="small" color="primary">
                  Ver horario
                </Button>
              </Link>
            </div>
          </Paper>
        </Grid>
        
        {/* Tareas pendientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Tareas Pendientes
            </Typography>
            {pendingTasks.length === 0 ? (
              <Alert severity="info">No tienes tareas pendientes</Alert>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {pendingTasks.slice(0, 5).map((task, index) => (
                  <Box key={task._id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Chip 
                          label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                          size="small" 
                          color={getPriorityColor(task.priority)}
                        />
                      }
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {task.course ? task.course.name : 'Sin curso'} - 
                            </Typography>
                            {` Vence: ${formatDate(task.dueDate)}`}
                          </>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
                {pendingTasks.length > 5 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link to="/tasks" style={{ textDecoration: 'none' }}>
                      <Button size="small">
                        Ver todas ({pendingTasks.length})
                      </Button>
                    </Link>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Eventos próximos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Eventos Próximos
            </Typography>
            {upcomingEvents.length === 0 ? (
              <Alert severity="info">No tienes eventos próximos</Alert>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {upcomingEvents.slice(0, 5).map((event, index) => (
                  <Box key={event._id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: event.color || '#4285F4' 
                          }} 
                        />
                      }
                    >
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {event.course ? event.course.name : 'Sin curso'} - 
                            </Typography>
                            {` ${formatDate(event.start)}`}
                          </>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
                {upcomingEvents.length > 5 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link to="/weekly" style={{ textDecoration: 'none' }}>
                      <Button size="small">
                        Ver todos ({upcomingEvents.length})
                      </Button>
                    </Link>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Cursos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Mis Cursos
            </Typography>
            {courses.length === 0 ? (
              <Alert severity="info">No tienes cursos registrados</Alert>
            ) : (
              <Grid container spacing={2}>
                {courses.map(course => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {course.name}
                        </Typography>
                        <Typography color="text.secondary">
                          {course.code}
                        </Typography>
                        <Typography variant="body2">
                          {course.professor}
                        </Typography>
                        <Typography variant="body2">
                          {course.schedule}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;