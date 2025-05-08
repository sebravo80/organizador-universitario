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
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/navbar.css';
import { styled } from '@mui/material/styles';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 42,
  height: 42,
  minWidth: 42,
  minHeight: 42,
  border: '2px solid rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  cursor: 'pointer',
  fontWeight: 600,
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.4)'
  },
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    fontSize: '0.9rem'
  }
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: 'white', 
  opacity: active ? 1 : 0.9,
  fontWeight: active ? 600 : 500,
  position: 'relative',
  transition: 'all 0.3s ease',
  padding: '8px 16px',
  borderRadius: '8px',
  overflow: 'hidden',
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.3px',
  '&:hover': {
    opacity: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: '2px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'width 0.3s ease',
    borderRadius: '2px'
  },
  '&:hover::before': {
    width: '80%',
    left: '10%'
  },
  ...(active && {
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '3px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
      borderRadius: '3px',
      boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
    }
  }),
  [theme.breakpoints.down('sm')]: {
    padding: '6px 10px',
    fontSize: '0.85rem'
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
      if (window.scrollY > 20) {
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
    { text: 'Calculadora', path: '/grade-calculator', icon: <CalculateIcon /> },
    { text: 'Pendientes', icon: <ChecklistIcon />, path: '/todos' },
  ];
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const drawer = (
    <Box className="mobile-drawer-content">
      <Box className="mobile-drawer-header">
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/diatoicon.png" alt="Logo" width="28" height="28" style={{ marginRight: '10px' }} />
            Organizador Universitario
          </Box>
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
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
              mb: 0.8,
              '&.Mui-selected': {
                backgroundColor: 'rgba(114, 0, 42, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(114, 0, 42, 0.2)'
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(114, 0, 42, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit', minWidth: '40px' }}>
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
        <Divider sx={{ my: 2 }} />
        <ListItem 
          button 
          onClick={() => {
            toggleTheme();
            handleDrawerToggle();
          }}
          sx={{ borderRadius: '8px', mx: 1, mb: 0.5 }}
        >
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Modo Claro" : "Modo Oscuro"} />
        </ListItem>
        <ListItem 
          button
          component={RouterLink}
          to="/profile"
          onClick={handleDrawerToggle}
          sx={{ borderRadius: '8px', mx: 1, mb: 0.5 }}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Mi Perfil" />
        </ListItem>
        <ListItem 
          button 
          onClick={handleLogout} 
          sx={{ borderRadius: '8px', mx: 1, color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="sticky" 
        className={`app-navbar ${isScrolled ? 'scrolled' : ''}`}
        elevation={isScrolled ? 4 : 0}
      >
        <Toolbar sx={{ 
          transition: 'padding 0.3s ease',
          py: isScrolled ? 0.5 : 1
        }}>
          {isAuth && isTablet && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              className={`mobile-nav-icon ${drawerOpen ? 'open' : ''}`}
              sx={{ 
                mr: 1,
                transition: 'transform 0.3s ease'
              }}
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
            <RouterLink to={isAuth ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <img src="/diatoicon.png" alt="Logo" width="32" height="32" />
              {!isMobile && "Organizador Universitario"}
              {isMobile && "Organizador"}
            </RouterLink>
          </Typography>
          
          {isAuth && !isTablet && (
            <Box className="navbar-links" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {menuItems.map((item) => (
                <NavButton
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  active={isActive(item.path) ? 1 : 0}
                  startIcon={item.icon}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.text}
                </NavButton>
              ))}
            </Box>
          )}

          {isAuth && (
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: isMobile ? '8px' : '16px' }}>
              <IconButton
                color="inherit"
                onClick={() => toggleTheme()}
                size={isMobile ? "medium" : "large"}
                sx={{
                  transition: 'transform 0.3s ease, background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(12deg)'
                  }
                }}
              >
                {darkMode ? (
                  <LightModeIcon fontSize={isMobile ? "small" : "medium"} />
                ) : (
                  <DarkModeIcon fontSize={isMobile ? "small" : "medium"} />
                )}
              </IconButton>
              
              <Tooltip title="Perfil">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  edge="end"
                  aria-label="perfil de usuario"
                  className="user-profile"
                  sx={{ 
                    padding: { xs: '2px', sm: '4px' },
                    ml: isMobile ? 0.5 : 1
                  }}
                >
                  <ProfileAvatar
                    alt={user?.name}
                    src={user?.avatar}
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
                    minWidth: 220,
                    mt: 1.5,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    '& .MuiMenuItem-root': {
                      py: 1.5
                    },
                    backdropFilter: 'blur(10px)',
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(30, 30, 30, 0.85)'
                      : 'rgba(255, 255, 255, 0.85)',
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ 
                  px: 2, 
                  py: 1.5, 
                  bgcolor: 'primary.dark',
                  backgroundImage: 'linear-gradient(45deg, #72002a, #a30044)'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    color: 'white', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.6)'
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    mt: 0.5,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    pl: 1.5
                  }}>
                    {user?.email}
                  </Typography>
                </Box>
                
                <MenuItem onClick={handleProfileClick} sx={{ 
                  mt: 1,
                  borderRadius: '0',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Mi Perfil" />
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={handleLogout} sx={{
                  borderRadius: '0',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  color: 'error.main'
                }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
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
            borderRadius: '0 16px 16px 0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Navbar;