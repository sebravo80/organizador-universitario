import { useState, useContext, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, TextField, 
  Button, Avatar, Grid, Alert, CircularProgress,
  Divider, Card, CardContent, Tabs, Tab, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import { updateUser, changePassword } from '../services/authService';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';

// Componentes estilizados
const ProfileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  overflow: 'visible',
  position: 'relative',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '-60px auto 20px auto',
  border: '5px solid rgba(255, 255, 255, 0.7)',
  fontSize: '3rem',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  minWidth: 120
}));

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);
  
  // Manejar cambio de tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      const updatedUser = await updateUser(profileForm);
      setUser(updatedUser);
      setSuccess('¡Perfil actualizado correctamente!');
    } catch (err) {
      setError('Error al actualizar el perfil. Inténtalo nuevamente.');
      console.error(err);
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
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Debes iniciar sesión para ver tu perfil</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold" mb={7}>
        Mi Perfil
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
      
      {/* Tarjeta principal de perfil */}
      <ProfileCard>
        <CardContent sx={{ textAlign: 'center', pt: 3 }}>
          <ProfileAvatar sx={{ bgcolor: 'primary.main' }}>
            {user.name?.charAt(0) || 'U'}
          </ProfileAvatar>
          
          <Typography variant="h4" gutterBottom>
            {user.name}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmailIcon sx={{ mr: 1 }} />
            {user.email}
          </Typography>
          
          <Divider sx={{ mt: 3, mb: 3 }} />
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered 
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 3 }}
          >
            <StyledTab icon={<PersonIcon />} label="Perfil" />
            <StyledTab icon={<LockIcon />} label="Contraseña" />
          </Tabs>
          
          {/* Panel para información personal */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ maxWidth: 500, mx: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                variant="contained"
                sx={{ 
                  mt: 4, 
                  mb: 2, 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          )}
          
          {/* Panel para cambio de contraseña */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleChangePassword} sx={{ maxWidth: 500, mx: 'auto' }}>
              <TextField
                fullWidth
                label="Contraseña Actual"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Nueva Contraseña"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
                helperText="Mínimo 6 caracteres"
              />
              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
                error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
                helperText={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== '' ? "Las contraseñas no coinciden" : ""}
              />
              
              <Button
                type="submit"
                variant="contained"
                sx={{ 
                  mt: 4, 
                  mb: 2, 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {loading ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>
            </Box>
          )}
        </CardContent>
      </ProfileCard>
    </Container>
  );
}

export default Profile;