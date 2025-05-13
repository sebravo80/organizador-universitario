// importamos las librerías necesarias
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

// este componente se encarga de proteger las rutas privadas
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

export default PrivateRoute;