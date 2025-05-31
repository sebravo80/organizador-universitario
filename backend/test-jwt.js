const jwt = require('jsonwebtoken');
require('dotenv').config();

const testJwt = () => {
  try {
    console.log('Probando jsonwebtoken...');
    
    // Verificar que JWT_SECRET esté definido
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      process.exit(1);
    }
    
    console.log('JWT_SECRET está definido');
    
    // Crear payload
    const payload = {
      user: {
        id: '123456789'
      }
    };
    
    console.log('Payload:', payload);
    
    // Generar token
    console.log('Generando token...');
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
    console.log('Token generado:', token);
    
    // Verificar token
    console.log('Verificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado:', decoded);
    
    console.log('Prueba de jsonwebtoken completada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error en la prueba de jsonwebtoken:', err);
    process.exit(1);
  }
};

testJwt();