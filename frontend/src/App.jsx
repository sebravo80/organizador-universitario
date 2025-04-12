// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Tasks from './pages/Tasks';
import WeeklyView from './pages/WeeklyView';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { Box, CircularProgress } from '@mui/material';

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/weekly" element={<WeeklyView />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;