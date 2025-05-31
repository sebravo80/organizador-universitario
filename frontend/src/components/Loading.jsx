// importamos las librerías necesarias
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import '../styles/common.css';

// el componente de carga se encarga de mostrar un mensaje de carga y un spinner
// para que sea menos molesto esperar que cargue la pagina
const Loading = ({ message = "Cargando...", showLogo = true }) => {
  return (
    <Box
      className="loading-screen"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%', 
        overflow: 'hidden',
        position: 'fixed', 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bgcolor: theme => theme.palette.background.default
      }}
    >
      {showLogo && (
        <Box className="loading-icon-container">
          <img 
            src="/diatoicon.png" 
            alt="Logo Diatomea" 
            width="80" 
            height="80" 
            className="loading-icon-pulse"
          />
        </Box>
      )}
      
      <Typography 
        variant="h6" 
        className="loading-text"
        sx={{ 
          mt: 3, 
          color: 'var(--text-primary)'
        }}
      >
        {message}
      </Typography>
      
      <CircularProgress 
        size={40} 
        thickness={4} 
        sx={{ 
          mt: 3,
          color: 'var(--primary-color)' 
        }}
      />
    </Box>
  );
};

export default Loading;