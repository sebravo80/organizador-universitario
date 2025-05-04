import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Box from '@mui/material/Box';

const Layout = () => {
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