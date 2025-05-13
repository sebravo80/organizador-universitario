// Importamos las librerias necesarias
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { getTodos, updateTodo } from '../services/todoService';
import { 
  Container, Typography, Box, Grid, Paper, 
  List, ListItem, ListItemText, Divider, 
  Card, CardContent, CardHeader, Button,
  Chip, Checkbox, ListItemIcon, Avatar
} from '@mui/material';

// Importamos los iconos de MUI
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CodeIcon from '@mui/icons-material/Code';
import RoomIcon from '@mui/icons-material/Room';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import '../styles/animations.css';
import '../styles/dashboard.css';

// este es el componente principal del dashboard
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
        
        // Obtener cursos usando API directamente
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);
        
        // Obtener tareas usando API directamente
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
        
        // Obtener eventos usando API directamente
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data);
        
        // Obtener pendientes usando el servicio todoService
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
  
  // Obtener tareas próximas (ordenadas por fecha de vencimiento) usando useMemo
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(task => task.status !== 'Completada')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);
  
  // Obtener eventos próximos (ordenados por fecha de inicio) usando useMemo
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  }, [events]);
  
  // Memoizar la lista de cursos para mostrar
  const coursesList = useMemo(() => {
    return courses.slice(0, 5);
  }, [courses]);

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
        <Paper 
          elevation={3} 
          className="greeting-card"
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: { xs: 3, sm: 4 }, 
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative' }}>
            <Avatar 
              className="greeting-avatar"
              sx={{ 
                width: { xs: 50, sm: 60 }, 
                height: { xs: 50, sm: 60 }, 
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ 
                mb: 0.5, 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #72002a, #a30044)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 2px 5px rgba(0,0,0,0.1)'
              }}>
                ¡Hola, {user?.name}! :D
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box component="span" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500,
                  color: '#72002a'
                  
                  
              //EDITAR ESTAS COSAS EN OTRO MOMENTO
                  // textShadow: '0px 1px 3px rgba(0,0,0,0.1)',
                  //background: 'linear-gradient(45deg,rgb(158, 0, 53),rgb(230, 0, 0))',
                  // backgroundClip: 'text',
                  //WebkitBackgroundClip: 'text',
                  //WebkitTextFillColor: 'transparent',
                  //borderRadius: 1,

                  }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long'
                  })}
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Ramos */}
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card course-section">
              <CardHeader 
                avatar={
                  <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
                    <SchoolOutlinedIcon sx={{ color: '#1976d2' }}/>
                  </Avatar>
                }
                title="Mis Ramos" 
                action={
                  <Button component={Link} to="/courses" size="small" variant="outlined">
                    Ver todos
                  </Button>
                }
              />
              <CardContent>
                {courses.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">No tienes ramos registrados</Typography>
                    <Button 
                      component={Link} 
                      to="/courses" 
                      size="small" 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                    >
                      Añadir ramo
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {coursesList.map(course => (
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
                                    sx={{ ml: 1, "& .MuiChip-label": { color: "#1976d2", fontWeight: "bold" } }}
                                    icon={<CodeIcon />}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <span>
                                {course.professor && (
                                  <Typography variant="body2" component="span" display="block">
                                    Profesor: {course.professor}
                                  </Typography>
                                )}
                                {course.room && (
                                  <Typography variant="body2" component="span" display="block" sx={{ display: 'flex', alignItems: 'center'}}>
                                    <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {course.room}
                                  </Typography>
                                )}
                                {course.scheduleStrings && course.scheduleStrings.length > 0 && (
                                  <Typography variant="body2" component="span" display="block">
                                    Horario: {course.scheduleStrings.join(', ')}
                                  </Typography>
                                )}
                              </span>
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
          
          {/* Próximas Tareas */}
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card task-section">
              <CardHeader 
                avatar={
                  <Avatar sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)' }}>
                    <AssignmentOutlinedIcon sx={{ color: '#ffc107' }}/>
                  </Avatar>
                }
                title="Próximas Tareas" 
                action={
                  <Button component={Link} to="/tasks" size="small" variant="outlined">
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
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box className={`status-indicator priority-${task.priority === 'Alta' ? 'high' : (task.priority === 'Media' ? 'medium' : 'low')}`}></Box>
                                <Typography 
                                  component="span" 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: 600,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {task.title}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={task.priority} 
                                  color={getPriorityColor(task.priority)}
                                />
                              </Box>
                            }
                            secondary={
                              <span>
                                <Typography variant="body2" component="span" display="block" sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: 'text.secondary'
                                }}>
                                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                  Vence: {formatDate(task.dueDate)}
                                </Typography>
                                {task.course && (
                                  <Typography variant="body2" component="span" display="block" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: 'text.secondary',
                                    mt: 0.5
                                  }}>
                                    <SchoolIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                    {task.course.name}
                                  </Typography>
                                )}
                              </span>
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
          
          {/* Próximos Eventos */}
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card event-section">
              <CardHeader 
                avatar={
                  <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                    <EventNoteOutlinedIcon sx={{ color: '#4caf50' }}/>
                  </Avatar>
                }
                title="Próximos Eventos" 
                action={
                  <Button component={Link} to="/weekly" size="small" variant="outlined">
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
                              <span style={{ marginTop: '4px', display: 'block' }}>
                                <Typography variant="body2" component="span" display="block">
                                  Fecha: {formatDate(event.startDate)}
                                </Typography>
                                <Typography variant="body2" component="span" display="block">
                                  Hora: {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                </Typography>
                                {event.location && (
                                  <Typography variant="body2" component="span" display="block" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {event.location}
                                  </Typography>
                                )}
                              </span>
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

          {/* Lista de */}
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card todo-section">
              <CardHeader 
                avatar={
                  <Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                    <CheckCircleOutlineIcon sx={{ color: '#2196f3' }}/>
                  </Avatar>
                }
                title="Lista de Pendientes" 
                action={
                  <Button component={Link} to="/todos" size="small" variant="outlined">
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