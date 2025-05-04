// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { getTodos, updateTodo } from '../services/todoService';
import { 
  Container, Typography, Box, Grid, Paper, 
  List, ListItem, ListItemText, Divider, 
  Card, CardContent, CardHeader, Button,
  Chip, Checkbox, ListItemIcon
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CodeIcon from '@mui/icons-material/Code';
import RoomIcon from '@mui/icons-material/Room';
import '../styles/animations.css';

const Dashboard = () => {
  const { user, isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        
        // Obtener tareas
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
        
        // Obtener eventos
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data);

        // Obtener pendientes
        const todosRes = await getTodos();
        setTodos(todosRes);
        
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
  
  // Obtener tareas próximas (ordenadas por fecha de vencimiento)
  const upcomingTasks = tasks
    .filter(task => task.status !== 'Completada')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);
  
  // Obtener eventos próximos (ordenados por fecha de inicio)
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
  };
  
  // Formatear hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'p', { locale: es });
  };
  
  // Obtener color de prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'error';
      case 'Media':
        return 'warning';
      case 'Baja':
        return 'success';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando datos...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" className="page-transition dashboard-container">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido, {user?.name}
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Grid container spacing={3}>
          {/* Cursos */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Mis Cursos" 
                action={
                  <Button component={Link} to="/courses" size="small">
                    Ver todos
                  </Button>
                }
              />
              <CardContent>
                {courses.length === 0 ? (
                  <Typography>No tienes cursos registrados.</Typography>
                ) : (
                  <List>
                    {courses.slice(0, 5).map(course => (
                      <div key={course._id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    backgroundColor: course.color,
                                    display: 'inline-block',
                                    mr: 1
                                  }} 
                                />
                                {course.name}
                                {course.courseCode && (
                                  <Chip 
                                    size="small" 
                                    label={course.courseCode} 
                                    sx={{ ml: 1 }}
                                    icon={<CodeIcon />}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <>
                                {course.professor && (
                                  <Box component="span" display="block">
                                    Profesor: {course.professor}
                                  </Box>
                                )}
                                {course.room && (
                                  <Box component="span" display="block" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {course.room}
                                  </Box>
                                )}
                                {course.scheduleStrings && course.scheduleStrings.length > 0 && (
                                  <Box component="span" display="block">
                                    Horario: {course.scheduleStrings.join(', ')}
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </div>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Tareas próximas */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Tareas Próximas" 
                action={
                  <Button component={Link} to="/tasks" size="small">
                    Ver todas
                  </Button>
                }
              />
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <Typography>No tienes tareas pendientes.</Typography>
                ) : (
                  <List>
                    {upcomingTasks.map(task => (
                      <div key={task._id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {task.title}
                                <Chip 
                                  size="small" 
                                  label={task.priority} 
                                  color={getPriorityColor(task.priority)}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Box component="span" display="block">
                                  Vence: {formatDate(task.dueDate)}
                                </Box>
                                {task.course && (
                                  <Box component="span" display="block">
                                    Curso: {task.course.name}
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </div>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Eventos próximos */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Eventos Próximos" 
                action={
                  <Button component={Link} to="/weekly" size="small">
                    Ver calendario
                  </Button>
                }
              />
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <Typography>No tienes eventos próximos.</Typography>
                ) : (
                  <List>
                    {upcomingEvents.map(event => (
                      <div key={event._id}>
                        <ListItem>
                          <ListItemText
                            primary={event.title}
                            secondary={
                              <>
                                <Box component="span" display="block">
                                  Fecha: {formatDate(event.startDate)}
                                </Box>
                                <Box component="span" display="block">
                                  Hora: {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                </Box>
                                {event.location && (
                                  <Box component="span" display="block" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {event.location}
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </div>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Pendientes rápidos */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Pendientes Rápidos" 
                action={
                  <Button component={Link} to="/todos" size="small">
                    Ver todos
                  </Button>
                }
              />
              <CardContent>
                {todos.length === 0 ? (
                  <Typography>No tienes pendientes añadidos.</Typography>
                ) : (
                  <List>
                    {todos.slice(0, 5).map(todo => (
                      <div key={todo._id}>
                        <ListItem>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={todo.completed}
                              onChange={async () => {
                                try {
                                  const updatedTodo = await updateTodo(todo._id, { completed: !todo.completed });
                                  setTodos(todos.map(t => t._id === todo._id ? updatedTodo : t));
                                } catch (error) {
                                  console.error('Error al actualizar pendiente:', error);
                                }
                              }}
                              sx={{ color: todo.completed ? 'success.main' : 'inherit' }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{ 
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  color: todo.completed ? 'text.secondary' : 'text.primary' 
                                }}
                              >
                                {todo.text}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </div>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;