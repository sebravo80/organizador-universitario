// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando iniciar sesión con:', { email });
      
      // Usar fetch directamente para ver más detalles
      const response = await fetch('http://localhost:5000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText
      });
      
      const data = await response.json();
      console.log('Datos de respuesta:', data);
      
      if (!response.ok) {
        throw { response: { status: response.status, data } };
      }
      
      // Guardar token en localStorage
      localStorage.setItem('token', data.token);
      
      // Configurar token en headers
      api.defaults.headers.common['x-auth-token'] = data.token;
      
      // Cargar datos del usuario
      const userRes = await api.get('/auth');
      
      console.log('Datos del usuario:', userRes.data);
      
      setUser(userRes.data);
      setIsAuth(true);
      
      return true;
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      
      if (err.response) {
        console.error('Detalles del error:', {
          status: err.response.status,
          data: err.response.data
        });
        setError(err.response.data?.msg || 'Error al iniciar sesión');
      } else {
        console.error('Error sin respuesta:', err.message);
        setError('Error de conexión. Intenta nuevamente.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Función para registrar usuario
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      const res = await api.post('/users', { name, email, password });
      
      // Guardar token en localStorage
      localStorage.setItem('token', res.data.token);
      
      // Configurar token en headers
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Cargar datos del usuario
      const userRes = await api.get('/auth');
      
      setUser(userRes.data);
      setIsAuth(true);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError(err.response?.data?.msg || 'Error al registrar usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar token
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    
    setUser(null);
    setIsAuth(false);
  };

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        
        // Verificar si hay token en localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuth(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Configurar token en headers
        api.defaults.headers.common['x-auth-token'] = token;
        
        // Obtener datos del usuario
        const res = await api.get('/auth');
        
        setUser(res.data);
        setIsAuth(true);
        setError(null);
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        
        // Limpiar token si hay error
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token'];
        
        setUser(null);
        setIsAuth(false);
        setError('Error al autenticar. Por favor, inicia sesión nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};