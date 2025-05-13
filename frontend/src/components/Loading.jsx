// importamos las librerías necesarias
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// el componente de carga se encarga de mostrar un mensaje de carga y un spinner
// para que sea menos molesto esperar que cargue la pagina
const Loading = ({ message = "Cargando..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        bgcolor: theme => theme.palette.background.default
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;