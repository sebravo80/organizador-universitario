// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';
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
      
      const response = await api.post(
        '/auth',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true // Añade esta línea
        }
      );
      
      console.log('Respuesta del servidor:', response.data);
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token);
      
      // Configurar token en headers
      api.defaults.headers.common['x-auth-token'] = response.data.token;
      
      // Cargar datos del usuario
      const userRes = await api.get('/auth');
      
      console.log('Datos del usuario:', userRes.data);
      
      setUser(userRes.data);
      setIsAuth(true);
      
      return true;
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error al iniciar sesión: ' + (err.response?.data?.msg || err.message));
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

  // Memo para el valor del contexto
  const contextValue = useMemo(() => ({
    isAuth,
    user,
    loading,
    login,
    logout,
    register
  }), [isAuth, user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};