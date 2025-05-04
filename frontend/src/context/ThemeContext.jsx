import { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

// Hook personalizado para usar el contexto del tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Estado para el tema (por defecto oscuro)
  const [darkMode, setDarkMode] = useState(true);
  
  // Cargar preferencia del tema guardada al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    
    // Aplicar el tema al elemento HTML
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, []);
  
  // Efecto para actualizar el atributo data-theme cuando cambie el modo
  useEffect(() => {
    // Guardar en localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    // Aplicar el tema al elemento HTML
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  // Función para cambiar el tema
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Agregamos el valor "theme" para que App.jsx pueda usarlo directamente
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme: darkMode ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
};