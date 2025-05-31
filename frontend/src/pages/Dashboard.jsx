// se importan las dependencias necesarias
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { getTodos, updateTodo } from '../services/todoService';
import { 
  Container, Typography, Box, Grid, Paper, 
  List, ListItem, ListItemText, Divider, 
  Card, CardContent, CardHeader, Button,
  Chip, Checkbox, ListItemIcon, Avatar,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// Importamos los iconos de MUI
import CodeIcon from '@mui/icons-material/Code';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// se importan los archivos de estilos
import '../styles/animations.css';
import '../styles/dashboard.css';
import Loading from '../components/Loading';
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
        
        // Obtener ramos usando API directamente
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
  
  // Obtener tareas ordenadas por fecha de vencimiento
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(task => task.status !== 'Completada')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);
  
  // Obtener eventos próximos ordenados por fecha de inicio
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
    return <Loading message="Cargando dashboard" showLogo={true}/>;
  }
  
  return (
    <Container maxWidth="lg" className="page-transition dashboard-container">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3} 
          className="greeting-card float-effect"
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: { xs: 3, sm: 4 }, 
            borderRadius: 3,
            overflow: 'visible'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative' }}>
            <Avatar 
              alt={user?.name} 
              src={user?.profilePicture}
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
              <Typography 
                variant="h4" 
                component="h1" 
                className="greeting-title"
                sx={{ 
                  mb: 0.5, 
                  fontWeight: 700,
                }}
              >
                ¡Hola, {user?.name}!
                <span className="greeting-emoji">:D</span>
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }} className="slide-in-left">
                <Box component="span" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500,
                  color: '#72002a'
                }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} className="rotate-effect" />
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
            {/* Ramos */}
            <Grid sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
              <Card className="dashboard-card course-section staggered-item">
                <CardHeader 
                  avatar={
                    <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }} className="pulse-effect">
                      <SchoolOutlinedIcon sx={{ color: '#1976d2' }}/>
                    </Avatar>
                  }
                  title="Mis Ramos" 
                  action={
                    <Button 
                      component={Link} 
                      to="/courses" 
                      size="small" 
                      variant="outlined" 
                      className="hover-lift"
                    >
                      Ver todos
                    </Button>
                  }
                />
                <CardContent>
                  {coursesList.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        opacity: 0.7
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} className="bounce-effect" />
                      <Typography color="text.secondary">No tienes ramos registrados</Typography>
                      <Button 
                        component={Link} 
                        to="/courses" 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        startIcon={<AddIcon />}
                        className="button-pulse"
                      >
                        Añadir ramo
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {coursesList.map((course, index) => (
                        <div key={course._id} className={`staggered-left-item`}>
                          <ListItem 
                            component={Link} 
                            to={`/courses?id=${course._id}`} 
                            sx={{ 
                              textDecoration: 'none',
                              color: 'inherit',
                              borderLeft: `4px solid ${course.color || '#1976d2'}`,
                              pl: 1.5,
                              '&:hover': {
                                backgroundColor: `${course.color || '#1976d2'}10`,
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      borderRadius: '50%', 
                                      bgcolor: course.color || '#1976d2',
                                      mr: 1
                                    }}
                                    className="pulse-effect"
                                  />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {course.name}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  {course.courseCode && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CodeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: `${course.color || '#1976d2'}99` }} />
                                      <Typography variant="body2" component="span">
                                        {course.courseCode}
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {course.professor && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: `${course.color || '#1976d2'}99` }} />
                                      <Typography variant="body2" component="span">
                                        {course.professor}
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {course.room && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <RoomIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: `${course.color || '#1976d2'}99` }} />
                                      <Typography variant="body2" component="span">
                                        {course.room}
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {course.scheduleStrings && course.scheduleStrings.length > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, mt: 0.2, fontSize: '0.9rem', color: `${course.color || '#1976d2'}99` }} />
                                      <Typography variant="body2" component="span">
                                        {course.scheduleStrings.map((schedule, idx) => (
                                          <Box key={idx} component="span" sx={{ display: 'block' }}>
                                            {schedule}
                                          </Box>
                                        ))}
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
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
            <Grid sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
              <Card className="dashboard-card task-section staggered-item">
                <CardHeader 
                  avatar={
                    <Avatar sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)' }} className="pulse-effect">
                      <AssignmentOutlinedIcon sx={{ color: '#ffc107' }}/>
                    </Avatar>
                  }
                  title="Próximas Tareas" 
                  action={
                    <Button 
                      component={Link} 
                      to="/tasks" 
                      size="small" 
                      variant="outlined"
                      className="hover-lift"
                    >
                      Ver todas
                    </Button>
                  }
                />
                <CardContent>
                  {upcomingTasks.length === 0 ? (
                    <Typography className="fade-in">No tienes tareas pendientes.</Typography>
                  ) : (
                    <List>
                      {upcomingTasks.map((task, index) => (
                        <div key={task._id} className={`staggered-left-item`}>
                          <ListItem
                            component={Link}
                            to={`/tasks?id=${task._id}`}
                            sx={{ 
                              textDecoration: 'none',
                              color: 'inherit',
                              borderLeft: `4px solid ${
                                task.priority === 'Alta' ? '#f44336' :
                                task.priority === 'Media' ? '#ff9800' : '#4caf50'
                              }`,
                              pl: 1.5,
                              '&:hover': {
                                backgroundColor: `${
                                  task.priority === 'Alta' ? '#f4433610' :
                                  task.priority === 'Media' ? '#ff980010' : '#4caf5010'
                                }`,
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    className="status-indicator" 
                                    sx={{ 
                                      bgcolor: 
                                        task.priority === 'Alta' ? '#f44336' :
                                        task.priority === 'Media' ? '#ff9800' :
                                        '#4caf50'
                                    }}
                                  />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {task.title}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                    <Typography variant="body2" component="span">
                                      {formatDate(task.dueDate)}
                                    </Typography>
                                  </Box>
                                  {task.description && task.description.length > 0 && (
                                    <Typography 
                                      variant="body2" 
                                      component="div"
                                      sx={{
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 1,
                                        textOverflow: 'ellipsis',
                                        color: 'text.secondary',
                                        mt: 0.5
                                      }}
                                    >
                                      {task.description}
                                    </Typography>
                                  )}
                                  {task.course && (
                                    <Chip
                                      label={task.course.name}
                                      size="small"
                                      sx={{ 
                                        bgcolor: task.course.color || '#1976d2',
                                        color: 'white',
                                        maxWidth: '100%',
                                        ml: 0,
                                        mt: 0.5,
                                        height: 22,
                                        overflow: 'hidden' // Añadimos overflow hidden para controlar la animación
                                      }}
                                      className="contained-shimmer"
                                    />
                                  )}
                                </Stack>
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
            <Grid sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
              <Card className="dashboard-card event-section staggered-item">
                <CardHeader 
                  avatar={
                    <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }} className="pulse-effect">
                      <EventNoteOutlinedIcon sx={{ color: '#4caf50' }}/>
                    </Avatar>
                  }
                  title="Próximos Eventos" 
                  action={
                    <Button 
                      component={Link} 
                      to="/weekly" 
                      size="small" 
                      variant="outlined"
                      className="hover-lift"
                    >
                      Ver calendario
                    </Button>
                  }
                />
                <CardContent>
                  {upcomingEvents.length === 0 ? (
                    <Typography className="fade-in">No tienes eventos próximos.</Typography>
                  ) : (
                    <List>
                      {upcomingEvents.map((event, index) => (
                        <div key={event._id} className={`staggered-left-item`}>
                          <ListItem
                            component={Link}
                            to={`/events?id=${event._id}`}
                            sx={{ 
                              textDecoration: 'none',
                              color: 'inherit',
                              borderLeft: `4px solid ${event.color || '#4caf50'}`,
                              pl: 1.5,
                              '&:hover': {
                                backgroundColor: `${event.color || '#4caf50'}10`,
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'medium' }}>
                                  <Box className="gradient-flow" sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    mr: 1
                                  }}/>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {event.title}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                    <Typography variant="body2" component="span">
                                      {formatDate(event.startDate)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                    <Typography variant="body2" component="span">
                                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                    </Typography>
                                  </Box>
                                  {event.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <RoomIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} className="bounce-effect" />
                                      <Typography variant="body2" component="span">
                                        {event.location}
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
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

            {/* Lista de ToDos */}
            <Grid sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
              <Card className="dashboard-card todo-section staggered-item">
                <CardHeader 
                  avatar={
                    <Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }} className="pulse-effect">
                      <CheckCircleOutlineIcon sx={{ color: '#2196f3' }}/>
                    </Avatar>
                  }
                  title="Lista de Pendientes" 
                  action={
                    <Button 
                      component={Link} 
                      to="/todos" 
                      size="small" 
                      variant="outlined"
                      className="hover-lift"
                    >
                      Ver todos
                    </Button>
                  }
                />
                <CardContent>
                  {todos.length === 0 ? (
                    <Typography className="fade-in">No tienes pendientes añadidos.</Typography>
                  ) : (
                    <List>
                      {todos.slice(0, 5).map((todo, index) => (
                        <div key={todo._id} className={`staggered-left-item`}>
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
                                className={todo.completed ? "highlight-effect" : ""}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                    opacity: todo.completed ? 0.7 : 1,
                                    transition: 'all 0.3s ease'
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
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
