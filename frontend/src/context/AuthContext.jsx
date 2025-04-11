import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await authService.getCurrentUser();
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setError(err.response?.data?.msg || 'Error al cargar usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Registrar usuario
  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      localStorage.setItem('token', res.data.token);
      
      // Cargar datos del usuario
      const userRes = await authService.getCurrentUser();
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar');
      return false;
    }
  };

  // Iniciar sesión
  const login = async (formData) => {
    try {
      const res = await authService.login(formData);
      localStorage.setItem('token', res.data.token);
      
      // Cargar datos del usuario
      const userRes = await authService.getCurrentUser();
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al iniciar sesión');
      return false;
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};