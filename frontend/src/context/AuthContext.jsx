// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { register, login, getCurrentUser, logout, isAuthenticated } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la aplicación
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuth(true);
        } catch (err) {
          console.error('Error al obtener usuario:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Registrar usuario
  const registerUser = async (userData) => {
    setError(null);
    try {
      const data = await register(userData);
      setUser(data.user || await getCurrentUser());
      setIsAuth(true);
      return true;
    } catch (err) {
      setError(err.msg || 'Error al registrar usuario');
      return false;
    }
  };

  // Iniciar sesión
  const loginUser = async (userData) => {
    setError(null);
    try {
      const data = await login(userData);
      setUser(data.user || await getCurrentUser());
      setIsAuth(true);
      return true;
    } catch (err) {
      setError(err.msg || 'Credenciales inválidas');
      return false;
    }
  };

  // Cerrar sesión
  const logoutUser = () => {
    logout();
    setUser(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuth,
        register: registerUser,
        login: loginUser,
        logout: logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};