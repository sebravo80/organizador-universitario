import React, { useState, useContext } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Importa tus iconos aquí
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

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
      
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        className="mobile-menu-drawer"
      >
        <List sx={{ width: 250 }}>
          <ListItem button onClick={() => handleNavigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/weekly')}>
            <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
            <ListItemText primary="Calendario" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/tasks')}>
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="Tareas" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/courses')}>
            <ListItemIcon><SchoolIcon /></ListItemIcon>
            <ListItemText primary="Cursos" />
          </ListItem>

          <ListItem button onClick={() => handleNavigate('/pendings')}>
            <ListItemIcon><NoteAltIcon /></ListItemIcon>
            <ListItemText primary="Pendientes" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigate('/grade-calculator')}>
            <ListItemIcon><CalculateIcon /></ListItemIcon>
            <ListItemText primary="Calculadora" />
          </ListItem>
          
          <Divider />
          
          <ListItem button onClick={() => handleNavigate('/profile')}>
            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItem>
          
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default MobileMenu;