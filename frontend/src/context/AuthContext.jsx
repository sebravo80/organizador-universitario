// importamos las librerías necesarias
import React, { createContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

// Proveedor del contexto
// esto es lo que maneja la autenticación de los usuarios
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
      
      const response = await api.post('/auth', { email, password });
      
      // Guardar token en localStorage
      // Esto es importante para mantener la sesión del usuario
      localStorage.setItem('token', response.data.token);
      
      // Configurar token en headers
      api.defaults.headers.common['x-auth-token'] = response.data.token;
      
      // Cargar datos del usuario
      const userRes = await api.get('/auth');
      
      setUser(userRes.data);
      setIsAuth(true);
      
      return true;
    } catch (err) {
      console.error('Error completo:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Error al iniciar sesión';
      setError(errorMsg);
      throw { msg: errorMsg }; // Lanzar el error para que pueda ser capturado
    } finally {
      setLoading(false);
    }
  };
  
  // Modificamos la funcion del registro para que no inicie sesión de inmediato
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      const res = await api.post('/users', { name, email, password });
      
      // No guardamos el token ni iniciamos sesión automáticamente
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

  // Añadimos función para actualizar la foto de perfil en el contexto
  const updateProfilePicture = (profilePicture) => {
    setUser(prevUser => ({
      ...prevUser,
      profilePicture
    }));
  };

  // Memo para el valor del contexto
  const contextValue = useMemo(() => ({
    isAuth,
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfilePicture // Exportamos el nuevo método
  }), [isAuth, user, loading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};