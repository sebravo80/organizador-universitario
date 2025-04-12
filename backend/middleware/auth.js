// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtener token del header
  const token = req.header('x-auth-token');

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir usuario al request
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Error en middleware auth:', err.message);
    res.status(401).json({ msg: 'Token no válido' });
  }
};