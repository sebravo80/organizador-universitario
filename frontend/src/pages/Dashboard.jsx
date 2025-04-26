// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Container, Typography, Box, Grid, Paper, 
  List, ListItem, ListItemText, Divider, 
  Card, CardContent, CardHeader, Button,
  Chip, Avatar, ListItemAvatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CodeIcon from '@mui/icons-material/Code';
import RoomIcon from '@mui/icons-material/Room';
import SchoolIcon from '@mui/icons-material/School';

const Dashboard = () => {
  const { user, isAuth } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [grades, setGrades] = useState([]);
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
  
  // Agrupar notas por curso
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
  
  // Estado de aprobación por curso
  const getApprovalStatus = (average) => {
    if (average >= 4.0) return { label: 'Aprobado', color: 'success' };
    if (average >= 3.5) return { label: 'En riesgo', color: 'warning' };
    return { label: 'Reprobado', color: 'error' };
  };
  
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
    <Container maxWidth="lg">
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
          
          {/* Notas y Promedios */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Mis Promedios" 
                action={
                  <Button component={Link} to="/grades" size="small">
                    Ver todos
                  </Button>
                }
              />
              <CardContent>
                {Object.values(groupedGrades).length === 0 ? (
                  <Typography>No tienes notas registradas.</Typography>
                ) : (
                  <List>
                    {Object.values(groupedGrades).map(({ course, grades }) => {
                      const average = calculateAverage(grades);
                      const status = getApprovalStatus(average);
                      
                      return (
                        <div key={course._id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar style={{ backgroundColor: course.color }}>
                                <SchoolIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={course.name}
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                                  <Typography variant="body2">
                                    Promedio: <strong>{average.toFixed(1)}</strong>
                                  </Typography>
                                  <Chip 
                                    label={status.label} 
                                    color={status.color}
                                    size="small"
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </div>
                      );
                    })}
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