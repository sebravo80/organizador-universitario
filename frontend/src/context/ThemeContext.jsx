import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

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

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};