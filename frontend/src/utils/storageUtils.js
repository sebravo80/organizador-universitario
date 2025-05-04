
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`Error al guardar en localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Recupera datos de localStorage de forma segura
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error al leer de localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Elimina datos de localStorage de forma segura
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error al eliminar de localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Limpia todo el localStorage de forma segura
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Error al limpiar localStorage:', error);
    return false;
  }
};