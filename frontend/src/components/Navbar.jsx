// src/components/Navbar.jsx
import { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Box, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Avatar, Menu, MenuItem,
  Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CalculateIcon from '@mui/icons-material/Calculate';
import PersonIcon from '@mui/icons-material/Person';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import '../styles/navbar.css';
import { styled } from '@mui/material/styles';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  minWidth: 40,
  minHeight: 40,
  border: '2px solid rgba(255, 255, 255, 0.7)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  fontWeight: 600,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9)'
  },
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    fontSize: '0.9rem'
  }
}));

function Navbar() {
  const { user, isAuth, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Ramos', icon: <BookIcon />, path: '/courses' },
    { text: 'Tareas', icon: <AssignmentIcon />, path: '/tasks' },
    { text: 'Horario', icon: <CalendarMonthIcon />, path: '/weekly' },
    { text: 'Calculadora de Notas', path: '/grade-calculator', icon: <CalculateIcon /> },
    { text: 'Pendientes', icon: <ChecklistIcon />, path: '/todos' },
  ];
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const drawer = (
    <Box className="mobile-drawer-content">
      <Box className="mobile-drawer-header">
        <Typography variant="h6" component="div">
          Organizador Universitario
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={isActive(item.path)}
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(114, 0, 42, 0.15)',
                '&:hover': {
                  bgcolor: 'rgba(114, 0, 42, 0.2)'
                }
              },
              '&:hover': {
                bgcolor: 'rgba(114, 0, 42, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="sticky" 
        className={`app-navbar ${isScrolled ? 'scrolled' : ''}`}
      >
        <Toolbar>
          {isAuth && isTablet && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              className={`mobile-nav-icon ${drawerOpen ? 'open' : ''}`}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            className="navbar-logo"
            sx={{ 
              flexGrow: isMobile ? 1 : 0, 
              mr: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              {!isMobile && <img src="/diatoicon.png" alt="Logo" width="32" height="32" />}
              Organizador Universitario
            </RouterLink>
          </Typography>
          
          {isAuth && !isTablet && (
            <Box className="navbar-links" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {isAuth && (
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '8px' }}>
              <ThemeToggle />
              
              <Tooltip title="Perfil">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  edge="end"
                  aria-label="perfil de usuario"
                  className="user-profile"
                  sx={{ 
                    padding: { xs: '2px', sm: '4px' },
                    ml: 1
                  }}
                >
                  <ProfileAvatar
                    sx={{ 
                      bgcolor: '#a0003b',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                  </ProfileAvatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                className="navbar-menu"
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    minWidth: 200,
                    mt: 1.5,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    '& .MuiMenuItem-root': {
                      py: 1.5
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.dark' }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {user?.email}
                  </Typography>
                </Box>
                
                <MenuItem onClick={handleProfileClick} sx={{ mt: 1 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Mi Perfil" />
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        className="mobile-drawer"
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 16px 16px 0'
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Navbar;