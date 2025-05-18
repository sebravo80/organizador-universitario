import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './styles/theme.css';
import { styled } from '@mui/system';

// Componentes esenciales sin lazy
import Navbar from './components/Navbar';
import TaskAlerts from './components/TaskAlerts';
import Loading from './components/Loading';

// Páginas con lazy loading para optimizar
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const Tasks = lazy(() => import('./pages/Tasks'));
const WeeklyView = lazy(() => import('./pages/WeeklyView'));
const Events = lazy(() => import('./pages/Events'));
const Profile = lazy(() => import('./pages/Profile'));
const GradeCalculator = lazy(() => import('./pages/GradeCalculator'));
const TodoList = lazy(() => import('./pages/TodoList'));
const NewLogin = lazy(() => import('./pages/NewLogin'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));


const DRAWER_WIDTH = 240;
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: `${DRAWER_WIDTH}px`,
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(8), 
    },
  }),
);

// Ruta privada, requiere inicio de sesión
const PrivateRoute = () => {
  const { isAuth, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

// Ruta pública, sólo se accede si no se ha iniciado sesión
const PublicRoute = () => {
  const { isAuth, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return isAuth ? <Navigate to="/dashboard" /> : <Outlet />;
};

function App() {
  const { isAuth } = useContext(AuthContext);
  const theme = useTheme(); // se solicita el tema
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // se usa el tema
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Main 
        component="main" 
        sx={{ flexGrow: 1, pt: 8, pb: 4 }}
        className={isMobile ? "has-fab-button" : ""}
      >
        <Routes>
          {/* Rutas públicas, solo accesibles si el usuario no está autenticado) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={
              <Suspense fallback={<Loading message="Preparando inicio de sesión..." />}>
                <NewLogin />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<Loading message="Cargando..." />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/reset-password/:token" element={
              <Suspense fallback={<Loading message="Preparando restablecimiento de contraseña..." />}>
                <ResetPassword />
              </Suspense>
            } />
          </Route>
          
          {/* Rutas privadas, accesible con inicio de sesión*/}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={
              <Suspense fallback={<Loading message="Cargando dashboard..." />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/courses" element={
              <Suspense fallback={<Loading message="Cargando cursos..." />}>
                <Courses />
              </Suspense>
            } />
            <Route path="/tasks" element={
              <Suspense fallback={<Loading message="Cargando tareas..." />}>
                <Tasks />
              </Suspense>
            } />
            <Route path="/weekly" element={
              <Suspense fallback={<Loading message="Cargando calendario..." />}>
                <WeeklyView />
              </Suspense>
            } />
            <Route path="/events" element={
              <Suspense fallback={<Loading message="Cargando eventos..." />}>
                <Events />
              </Suspense>
            } />
            <Route path="/profile" element={
              <Suspense fallback={<Loading message="Cargando perfil..." />}>
                <Profile />
              </Suspense>
            } />
            <Route path="/grade-calculator" element={
              <Suspense fallback={<Loading message="Cargando calculadora..." />}>
                <GradeCalculator />
              </Suspense>
            } />
            <Route path="/todos" element={
              <Suspense fallback={<Loading message="Cargando pendientes..." />}>
                <TodoList />
              </Suspense>
            } />
          </Route>
          
          {/* Ruta por defecto al acceder, se redirige al login o al dashboard dependiendo del tipo de autenticación */}
          <Route path="*" element={
            isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
        </Routes>
      </Main>
      
      {/* Alertas de tareas */}
      {isAuth && <TaskAlerts />}

      {/* Contenedor para las notificaciones */}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
}

export default App;
