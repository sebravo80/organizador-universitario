import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Obtener preferencia del tema del localStorage o usar claro por defecto
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Efecto para actualizar el atributo data-theme en el elemento HTML
  useEffect(() => {
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    // Aplicar el tema al elemento HTML
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};