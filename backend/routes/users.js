const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
  console.log('Recibida solicitud de registro. Body:', req.body);
  
  try {
    const { name, email, password } = req.body;

    // Verificar si se proporcionaron todos los campos
    if (!name || !email || !password) {
      console.log('Faltan campos requeridos:', { 
        name: !!name, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ msg: 'Por favor, proporciona todos los campos requeridos' });
    }

    console.log('Verificando si el usuario ya existe...');
    
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });

    if (user) {
      console.log('El usuario ya existe');
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    console.log('Creando nuevo usuario...');
    
    // Crear nuevo usuario
    user = new User({
      name,
      email,
      password
    });

    console.log('Encriptando contraseña...');
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    console.log('Contraseña encriptada correctamente');
    
    // Guardar usuario en la base de datos
    await user.save();

    console.log('Usuario guardado correctamente. ID:', user.id);
    console.log('Generando token JWT...');
    
    // Crear payload para JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Verificar que JWT_SECRET esté definido
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({ msg: 'Error de configuración del servidor: JWT_SECRET no definido' });
    }

    console.log('Firmando token...');
    
    // Generar token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('Error al generar token JWT:', err);
          return res.status(500).json({ msg: 'Error al generar token', error: err.message });
        }
        
        console.log('Token generado correctamente');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error en el registro de usuario:', err);
    
    // Determinar el tipo de error
    if (err.name === 'ValidationError') {
      // Error de validación de Mongoose
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: 'Error de validación', errors: messages });
    }
    
    if (err.code === 11000) {
      // Error de duplicado (índice único)
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno' 
    });
  }
});

module.exports = router;