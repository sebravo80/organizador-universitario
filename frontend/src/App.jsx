import { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import './App.css';
import './styles/theme.css';

// Componentes
import Navbar from './components/Navbar';
import TaskAlerts from './components/TaskAlerts';

// Páginas
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Tasks from './pages/Tasks';
import WeeklyView from './pages/WeeklyView';
import NewLogin from './pages/NewLogin'; 
import Profile from './pages/Profile';
import Events from './pages/Events';
import GradeCalculator from './pages/GradeCalculator';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Ruta privada (requiere autenticación)
const PrivateRoute = () => {
  const { isAuth, loading } = useContext(AuthContext);
  
  if (loading) {
    return null;
  }
  
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

// Ruta pública (solo accesible si NO está autenticado)
const PublicRoute = () => {
  const { isAuth, loading } = useContext(AuthContext);
  
  if (loading) {
    return null;
  }
  
  return isAuth ? <Navigate to="/dashboard" /> : <Outlet />;
};

function App() {
  const { isAuth } = useContext(AuthContext);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 4 }}>
        <Routes>
          {/* Rutas públicas (solo accesibles si NO está autenticado) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<NewLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
          
          {/* Rutas privadas (requieren autenticación) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/weekly" element={<WeeklyView />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/grade-calculator" element={<GradeCalculator />} />
          </Route>
          
          {/* Ruta por defecto: redirigir a login o dashboard dependiendo de autenticación */}
          <Route path="*" element={
            isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
        </Routes>
      </Box>
      
      {/* Alertas de tareas (solo mostrar si está autenticado) */}
      {isAuth && <TaskAlerts />}
    </Box>
  );
}

export default App;