import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';  // Modo oscuro
import Brightness7Icon from '@mui/icons-material/Brightness7';  // Modo claro

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