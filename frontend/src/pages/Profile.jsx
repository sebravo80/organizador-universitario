import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  Container, Card, CardContent, Typography, TextField, Button, Box, Avatar, Paper, InputAdornment, IconButton, Switch, FormControlLabel, Grid, Slider, Alert, CircularProgress, Tab, Tabs, Divider, Dialog, Fade, Backdrop 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key';
import PasswordIcon from '@mui/icons-material/Password';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import TaskIcon from '@mui/icons-material/Task';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BadgeIcon from '@mui/icons-material/Badge';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import '../styles/animations.css';
import '../styles/profile.css';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { changePassword, getUserInfo } from '../services/authService';
import { checkNotificationsPermission, getNotificationPreferences, saveNotificationPreferences } from '../services/notificationService.js';

function Profile() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  // Datos del usuario para mostrar
  const [stats, setStats] = useState({
    coursesCount: 0,
    tasksCount: 0,
    todosCount: 0
  });
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para controlar el diálogo de la imagen
  const [openImageDialog, setOpenImageDialog] = useState(false);
  
  // Referencia para el input de archivo
  const fileInputRef = useRef(null);
  
  // Estado para la previsualización de la imagen
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
      
      // Intentar cargar estadísticas del usuario
      const fetchUserStats = async () => {
        try {
          // Obtener datos de contadores
          const [coursesRes, tasksRes, todosRes] = await Promise.all([
            api.get('/courses'),
            api.get('/tasks'),
            api.get('/todos')
          ]);
          
          // Contamos manualmente los elementos en las respuestas
          const coursesCount = coursesRes.data?.length || 0;
          const tasksCount = tasksRes.data?.length || 0;
          const todosCount = todosRes.data?.length || 0;
          
          console.log('Conteo manual - Cursos:', coursesCount, 'Tareas:', tasksCount, 'Pendientes:', todosCount);
          
          setStats({
            coursesCount: coursesCount,
            tasksCount: tasksCount,
            todosCount: todosCount
          });
        } catch (error) {
          console.error("Error cargando estadísticas:", error);
          setStats({
            coursesCount: 0,
            tasksCount: 0,
            todosCount: 0
          });
        }
      };
      
      fetchUserStats();
    }
  }, [user]);
  
  // Manejar cambio de tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Toggle mostrar/ocultar contraseña
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Manejar cambios en el formulario de perfil
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Actualizar perfil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await api.put('/auth/user', {
        name: profileForm.name,
        email: profileForm.email
      });
      
      console.log('Respuesta de actualización:', response);
      
      // Operación exitosa si llegamos hasta aquí
      setProfileForm({
        name: profileForm.name,
        email: profileForm.email
      });
      
      setSuccess('¡Perfil actualizado correctamente! Los cambios se verán al volver a iniciar sesión.');
      localStorage.setItem('userName', profileForm.name);
      
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError('Error al actualizar el perfil. Verifica tus datos e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    // Validar longitud mínima
    if (passwordForm.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setSuccess('¡Contraseña actualizada correctamente!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Error al cambiar la contraseña. Verifica tus datos e inténtalo nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejador para activar el input de archivo
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Manejador para el cambio de archivo
  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validar que sea una imagen
    if (!file.type.match('image.*')) {
      setError('Solo puedes subir imágenes');
      return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }
    
    // Crear URL temporal para previsualización
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
    
    // Subir imagen
    await uploadProfilePicture(file);
  };
  
  // Función para subir la imagen al servidor
  const uploadProfilePicture = async (file) => {
    setUploadLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Actualizar la imagen del usuario en el contexto
      if (response.data && response.data.profilePicture) {
        setSuccess('Foto de perfil actualizada correctamente');
      }
    } catch (err) {
      console.error('Error al subir foto:', err);
      setError('Error al subir la foto. Inténtalo nuevamente.');
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Función para eliminar la foto de perfil
  const handleDeletePhoto = async () => {
    if (!user.profilePicture || !user.profilePicture.url) return;
    
    setUploadLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.delete('/auth/profile-picture');
      setImagePreview(null);
      setSuccess('Foto de perfil eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar foto:', err);
      setError('Error al eliminar la foto. Inténtalo nuevamente.');
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Función para abrir el diálogo de la imagen
  const handleOpenImageDialog = () => {
    // Solo abrir si hay una imagen
    if ((user.profilePicture && user.profilePicture.url) || imagePreview) {
      setOpenImageDialog(true);
    }
  };
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Debes iniciar sesión para ver tu perfil</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }} className="page-transition">
      {/* Notificaciones */}
      {error && (
        <Alert 
          severity="error" 
          className="profile-alert"
          sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          className="profile-alert"
          sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}
        >
          {success}
        </Alert>
      )}
      
      {/* Cabecera del perfil con información básica */}
      <Paper 
        elevation={3} 
        className="profile-header-card" 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          position: 'relative',
          mb: 4,
          backgroundImage: 'linear-gradient(135deg, rgba(114, 0, 42, 0.05) 0%, rgba(169, 0, 62, 0.1) 100%)'
        }}
      >
        <Box 
          className="profile-header-bg" 
          sx={{ 
            height: '140px',
            width: '100%', 
            background: 'linear-gradient(45deg, var(--primary-color), var(--primary-light))',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }
          }}
        />
        
        <Box 
          className="profile-header-content" 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            pt: '60px',
            px: 3,
            pb: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {/* Avatar del usuario con foto o iniciales */}
            <Avatar
              className="profile-avatar image-preview-enabled"
              src={imagePreview || (user.profilePicture && user.profilePicture.url) || ''}
              alt={user.name}
              onClick={handleOpenImageDialog}
              sx={{ 
                width: 130,
                height: 130,
                fontSize: '3rem',
                border: '3px solid white',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                background: 'linear-gradient(45deg, var(--primary-color), var(--primary-light))',
                mb: 3,
                zIndex: 2,
                cursor: (user.profilePicture && user.profilePicture.url) || imagePreview ? 'pointer' : 'default'
              }}
            >
              {!imagePreview && (!user.profilePicture || !user.profilePicture.url) && (user.name?.charAt(0) || 'U')}
              
              {/* Indicador de zoom para imagen */}
              {((user.profilePicture && user.profilePicture.url) || imagePreview) && (
                <Box 
                  className="zoom-indicator"
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <ZoomOutMapIcon />
                </Box>
              )}
            </Avatar>
            
            {/* Botón para cambiar foto */}
            <Box 
              className="avatar-upload-button"
              onClick={handleUploadClick}
              sx={{
                position: 'absolute',
                right: -5,
                bottom: 30,
                backgroundColor: 'var(--primary-color)',
                color: '#fff',
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                border: '2px solid white',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'var(--primary-dark)'
                }
              }}
            >
              {uploadLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <CameraAltIcon fontSize="small" />
              )}
            </Box>
            
            {/* Input de archivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {/* Botón para eliminar foto (solo visible si hay foto) */}
            {(user.profilePicture && user.profilePicture.url || imagePreview) && (
              <Box 
                className="avatar-delete-button"
                onClick={handleDeletePhoto}
                sx={{
                  position: 'absolute',
                  left: -5,
                  bottom: 30,
                  backgroundColor: 'rgba(211, 47, 47, 0.8)',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  border: '2px solid white',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: '#d32f2f'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </Box>
            )}
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1.5,
              justifyContent: 'center'
            }}>
              <BadgeIcon sx={{ mr: 1, color: 'var(--primary-color)', fontSize: 22 }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2, 
              mt: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderRadius: 2,
              py: 1,
              px: 2
            }}>
              <EmailIcon sx={{ mr: 1, color: 'var(--primary-color)', fontSize: 20 }} />
              <Typography variant="body1" color="text.primary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={() => setActiveTab(0)}
              sx={{ 
                borderRadius: 2,
                boxShadow: 1,
                borderColor: 'var(--primary-color)',
                color: 'var(--primary-color)',
                '&:hover': {
                  borderColor: 'var(--primary-dark)',
                  backgroundColor: 'rgba(114, 0, 42, 0.08)'
                }
              }}
            >
              Editar perfil
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<LockIcon />} 
              onClick={() => setActiveTab(1)}
              sx={{ 
                borderRadius: 2,
                boxShadow: 1,
                borderColor: 'var(--primary-color)',
                color: 'var(--primary-color)',
                '&:hover': {
                  borderColor: 'var(--primary-dark)',
                  backgroundColor: 'rgba(114, 0, 42, 0.08)'
                }
              }}
            >
              Cambiar contraseña
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Estadísticas del usuario */}
      <Grid container spacing={3} sx={{ mb: 4 }} justifyContent={'center'}>
        <Grid item xs={12} sm={4}>
          <Card className="stat-card" sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Cursos
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main' }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 700 }}>
                {stats.coursesCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card className="stat-card" sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Tareas
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: 'warning.main' }}>
                  <TaskIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 700 }}>
                {stats.tasksCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card className="stat-card" sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Pendientes
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'success.main' }}>
                  <ChecklistIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 700 }}>
                {stats.todosCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Pestañas para edición de perfil y cambio de contraseña */}
      <Card className="profile-tab-card" sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        </Box>
        
        <CardContent sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
          {/* Panel para información personal */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleUpdateProfile} className="profile-tab-panel">
              <TextField
                className="profile-form-input"
                fullWidth
                label="Nombre"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                margin="normal"
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon color="primary" fontSize="large" /></InputAdornment>
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    height: 60,
                    fontSize: '1.1rem',
                    paddingLeft: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <TextField
                className="profile-form-input"
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                margin="normal"
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon color="primary" fontSize="large" /></InputAdornment>
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    height: 60,
                    fontSize: '1.1rem',
                    paddingLeft: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  className="profile-save-button"
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ 
                    py: 2,
                    px: 5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem'
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon fontSize="large" />}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Panel para cambio de contraseña */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleChangePassword} className="profile-tab-panel">
              <TextField
                className="profile-form-input"
                fullWidth
                label="Contraseña Actual"
                name="currentPassword"
                type={showPassword.currentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><KeyIcon color="primary" fontSize="large" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('currentPassword')}
                        edge="end"
                        size="large"
                        color="primary"
                      >
                        {showPassword.currentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    height: 60, // Hacerlo más alto
                    fontSize: '1.1rem', // Texto más grande
                    paddingLeft: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem' // Etiqueta más grande
                  }
                }}
              />
              
              <TextField
                className="profile-form-input"
                fullWidth
                label="Nueva Contraseña"
                name="newPassword"
                type={showPassword.newPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
                variant="outlined"
                helperText="Mínimo 6 caracteres"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PasswordIcon color="primary" fontSize="large" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('newPassword')}
                        edge="end"
                        size="large"
                        color="primary"
                      >
                        {showPassword.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    height: 60, 
                    fontSize: '1.1rem',
                    paddingLeft: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <TextField
                className="profile-form-input"
                fullWidth
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                type={showPassword.confirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
                variant="outlined"
                error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
                helperText={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== '' ? "Las contraseñas no coinciden" : ""}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PasswordIcon color="primary" fontSize="large" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                        edge="end"
                        size="large"
                        color="primary"
                      >
                        {showPassword.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    height: 60, 
                    fontSize: '1.1rem',
                    paddingLeft: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  className="profile-save-button"
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ 
                    py: 2,
                    px: 5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem'
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} /> : <LockIcon fontSize="large" />}
                >
                  {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo para vista previa de imagen */}
      <Dialog 
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            borderRadius: '12px'
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0,0,0,0.85)'
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={{
          enter: 300,
          exit: 200
        }}
      >
        <Box 
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
          className="image-preview-dialog"
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              mb: 2, 
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Foto de Perfil
          </Typography>
          
          <Box 
            sx={{ 
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img 
              src={imagePreview || (user.profilePicture && user.profilePicture.url) || ''}
              alt={user.name}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px',
                animation: 'zoomIn 0.3s ease forwards',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 5px 20px rgba(0,0,0,0.4)'
              }}
              className="image-preview"
            />
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => setOpenImageDialog(false)}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Cerrar
            </Button>
            
            {(user.profilePicture && user.profilePicture.url || imagePreview) && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleUploadClick}
                startIcon={<PhotoCameraIcon />}
              >
                Cambiar Foto
              </Button>
            )}
          </Box>
          
          <IconButton
            onClick={() => setOpenImageDialog(false)}
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Profile;