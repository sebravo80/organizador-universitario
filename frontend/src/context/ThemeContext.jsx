import { createContext, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Configurar siempre el tema oscuro
  useEffect(() => {
    // Guardar en localStorage
    localStorage.setItem('theme', 'dark');
    
    // Aplicar el tema al elemento HTML
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Contexto con valor fijo
  return (
    <ThemeContext.Provider value={{ darkMode: true }}>
      {children}
    </ThemeContext.Provider>
  );
};