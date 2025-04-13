// backend/test-bcrypt.js
const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
  try {
    const password = 'password123';
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Contraseña original:', password);
    console.log('Contraseña encriptada:', hashedPassword);
    
    // Verificar contraseña correcta
    const isMatch1 = await bcrypt.compare(password, hashedPassword);
    console.log('¿Contraseña correcta?', isMatch1); // Debería ser true
    
    // Verificar contraseña incorrecta
    const isMatch2 = await bcrypt.compare('contraseñaIncorrecta', hashedPassword);
    console.log('¿Contraseña incorrecta?', isMatch2); // Debería ser false
  } catch (err) {
    console.error('Error en la prueba de bcrypt:', err);
  }
};

testBcrypt();