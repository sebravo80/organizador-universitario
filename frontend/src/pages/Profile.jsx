import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Box, TextField, Button, Typography, Paper, Avatar, CircularProgress, Alert, Divider, Container, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { indigo, grey } from '@mui/material/colors';

// Componentes estilizados personalizados
const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1.5),
  backgroundColor: '#1e1e1e',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  marginBottom: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: indigo[500],
  fontSize: '2rem',
  boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 60,
    height: 3,
    backgroundColor: theme.palette.primary.main,
  },
}));

const PasswordSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#252525',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  borderLeft: `4px solid ${theme.palette.error.main}`,
  marginTop: theme.spacing(4),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#a30044',
  '&:hover': {
    backgroundColor: '#cc0055',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(163, 0, 68, 0.25)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: grey[700],
    },
    '&:hover fieldset': {
      borderColor: grey[500],
    },
    '&.Mui-focused fieldset': {
      borderColor: indigo[500],
    },
    backgroundColor: '#2d2d2d',
  },
  '& .MuiInputLabel-root': {
    color: grey[400],
  },
  '& .MuiOutlinedInput-input': {
    color: '#ffffff',
  },
}));

function Profile() {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        updateCurrentUser(response.data);
        setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar el perfil',
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({ type: 'success', text: 'Contraseña actualizada con éxito' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cambiar la contraseña',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
              Mi Perfil
            </Typography>
          </Box>
          
          <ProfilePaper elevation={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <StyledAvatar>{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</StyledAvatar>
              <Typography variant="h5" sx={{ color: '#fff', mb: 0.5 }}>
                {currentUser?.name || 'Usuario'}
              </Typography>
              <Typography variant="body2" sx={{ color: grey[500] }}>
                {currentUser?.email || 'correo@ejemplo.com'}
              </Typography>
            </Box>

            <Divider sx={{ my: 3, backgroundColor: grey[800] }} />

            <Box component="form" onSubmit={updateProfile}>
              <SectionTitle variant="h6" component="h2" gutterBottom sx={{ color: '#fff' }}>
                Información Personal
              </SectionTitle>

              <StyledTextField
                fullWidth
                label="Nombre"
                name="name"
                value={userData.name}
                onChange={handleUserDataChange}
                variant="outlined"
                required
              />

              <StyledTextField
                fullWidth
                label="Email"
                name="email"
                value={userData.email}
                onChange={handleUserDataChange}
                variant="outlined"
                required
                type="email"
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <ActionButton
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Actualizar Perfil'}
                </ActionButton>
              </Box>
            </Box>

            <PasswordSection component="form" onSubmit={changePassword}>
              <SectionTitle variant="h6" component="h2" gutterBottom sx={{ color: '#fff' }}>
                Cambiar Contraseña
              </SectionTitle>

              <StyledTextField
                fullWidth
                label="Contraseña Actual"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                variant="outlined"
                type="password"
                required
              />

              <StyledTextField
                fullWidth
                label="Nueva Contraseña"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                variant="outlined"
                type="password"
                required
              />

              <StyledTextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                variant="outlined"
                type="password"
                required
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <ActionButton
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Cambiar Contraseña'}
                </ActionButton>
              </Box>
            </PasswordSection>

            {message.text && (
              <Alert severity={message.type} sx={{ mt: 3 }}>
                {message.text}
              </Alert>
            )}
          </ProfilePaper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;