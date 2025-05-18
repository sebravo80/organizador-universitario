// se importan las dependencias necesarias
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { initializeNotifications, registerNotificationChannels } from './services/notificationService';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
// importar archivos de estilos
import './index.css';
import './styles/variables.css';
import './styles/theme.css';
import './styles/animations.css';
import './styles/calendar.css';
import './styles/forms.css';
import './styles/navbar.css';
import './styles/todo.css';
import './styles/dashboard.css';
import './styles/profile.css';
import './styles/responsive.css';
import './styles/common.css';

// el sistema de notificaciones de momento funciona en un dispositivo nativo, como un movil
if (Capacitor.isNativePlatform()) {
  console.log('Inicializando sistema de notificaciones nativas');
  initializeNotifications();
  registerNotificationChannels();
}

// se crea un tema estandar para MUI
const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#72002a',
    },
    secondary: {
      main: '#a30044',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <MUIThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <CustomThemeProvider>
              <App />
            </CustomThemeProvider>
          </MUIThemeProvider>
        </LocalizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
