// importamos las librerías necesarias
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { IconButton, Tooltip } from '@mui/material';
// Aquí se importan los iconos de MUI
import Brightness4Icon from '@mui/icons-material/Brightness4';  // Modo oscuro
import Brightness7Icon from '@mui/icons-material/Brightness7';  // Modo claro


//este componente se encarga de cambiar el tema de la aplicación
// es un botoncito
const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <Tooltip title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
      <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;