import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Box from '@mui/material/Box';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirección a dashboard si estamos en la raíz
  useEffect(() => {
    if (location.pathname === '/') {
      console.log('En la raíz, asegurando que dashboard se muestre');
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, width: '100%', pt: 2 }}>
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;