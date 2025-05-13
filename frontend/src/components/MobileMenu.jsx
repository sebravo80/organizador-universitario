// Importamos las librerías necesarias
import React, { useState, useContext } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Aquí se importan los iconos de MUI
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';


// Se crea el componente de menú movil que cambia en los dispositivos móviles
const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Esta función se encarga de navegar a la ruta que se indique
  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  // y esta se encarga de cerrar la sesión del usuario
  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <>
      <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      // Con el drawer y anchor: "left" se indica que el menú se abrirá desde la izquierda
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        className="mobile-menu-drawer"
      >
        <List sx={{ width: 250 }}>
          <ListItem button onClick={() => handleNavigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Dashboard
                </Typography>
              } 
            />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/weekly')}>
            <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Calendario
                </Typography>
              } 
            />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/tasks')}>
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Tareas
                </Typography>
              } 
            />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/courses')}>
            <ListItemIcon><SchoolIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Cursos
                </Typography>
              } 
            />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/grade-calculator')}>
            <ListItemIcon><CalculateIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Calculadora
                </Typography>
              } 
            />
          </ListItem>
          
          <Divider />
          
          <ListItem button onClick={() => handleNavigate('/profile')}>
            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Perfil
                </Typography>
              } 
            />
          </ListItem>
          
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="span">
                  Cerrar sesión
                </Typography>
              } 
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default MobileMenu;