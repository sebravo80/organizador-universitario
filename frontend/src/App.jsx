import React, { Suspense, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeContext } from './context/ThemeContext';
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
const Profile = React.lazy(() => import('./pages/Profile'));

function App() {
  const { darkMode } = useContext(ThemeContext);
  
  const currentTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
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
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="weekly" element={<WeeklyView />} />
              <Route path="events" element={
                <Suspense fallback={<div>Cargando...</div>}>
                  <Events />
                </Suspense>
              } />
              <Route path="grade-calculator" element={
                <Suspense fallback={<div>Cargando...</div>}>
                  <GradeCalculator />
                </Suspense>
              } />
              <Route path="profile" element={
                <Suspense fallback={<div>Cargando...</div>}>
                  <Profile />
                </Suspense>
              } />
            </Route>
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