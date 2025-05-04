// Tipos de errores
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  PERMISSION: 'PERMISSION',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

// Categorizar el error según su tipo
export const categorizeError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNKNOWN, message: 'Error desconocido' };

  // Error de red (sin conexión)
  if (!navigator.onLine || error.message === 'Network Error') {
    return {
      type: ERROR_TYPES.NETWORK,
      message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      original: error
    };
  }

  // Error de autenticación
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    return {
      type: ERROR_TYPES.AUTHENTICATION,
      message: error.response.status === 401 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
        : 'No tienes permisos para realizar esta acción.',
      original: error
    };
  }

  // Error de validación
  if (error.response && error.response.status === 400) {
    return {
      type: ERROR_TYPES.VALIDATION,
      message: 'Los datos proporcionados no son válidos.',
      details: error.response.data.msg || error.response.data.message || null,
      original: error
    };
  }

  // Error del servidor
  if (error.response && error.response.status >= 500) {
    return {
      type: ERROR_TYPES.SERVER,
      message: 'Error en el servidor. Por favor, intenta más tarde.',
      original: error
    };
  }

  // Error desconocido
  return {
    type: ERROR_TYPES.UNKNOWN,
    message: error.message || 'Ocurrió un error inesperado.',
    original: error
  };
};

// Manejador de errores global
export const handleError = (error, setError = null, onAuthError = null) => {
  const categorizedError = categorizeError(error);
  
  console.error('Error:', categorizedError);
  
  // Si el error es de autenticación, manejar el caso especial
  if (categorizedError.type === ERROR_TYPES.AUTHENTICATION && onAuthError) {
    onAuthError();
    return;
  }
  
  // Actualizar el estado de error si se proporciona una función para establecerlo
  if (setError) {
    setError(categorizedError.message);
  }
  
  return categorizedError;
};