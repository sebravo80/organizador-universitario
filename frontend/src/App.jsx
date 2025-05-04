import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from './context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import NewLogin from './pages/NewLogin';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Tasks from './pages/Tasks';
import WeeklyView from './pages/WeeklyView';
import TaskAlerts from './components/TaskAlerts';
import './App.css';

// Cargar componentes pesados con lazy loading
const Events = React.lazy(() => import('./pages/Events'));
const GradeCalculator = React.lazy(() => import('./pages/GradeCalculator'));

function App() {
  const { theme } = useTheme();
  
  const currentTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#72002a',
      },
      secondary: {
        main: '#11cb5f',
      },
    },
    typography: {
      fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
    },
  });
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <div className="App">
        <Routes>
          <Route path="/login" element={<NewLogin />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="weekly" element={<WeeklyView />} />
            <Route path="events" element={
              <Suspense fallback={<div>Cargando...</div>}>
                <Events />
              </Suspense>
            } />
            <Route path="calculator" element={
              <Suspense fallback={<div>Cargando...</div>}>
                <GradeCalculator />
              </Suspense>
            } />
          </Route>
        </Routes>
        <PrivateRoute>
          <TaskAlerts />
        </PrivateRoute>
      </div>
    </ThemeProvider>
  );
}

export default App;