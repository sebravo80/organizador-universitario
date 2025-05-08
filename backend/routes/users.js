// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Agregar la importación de nodemailer
const nodemailer = require('nodemailer');
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
      { expiresIn: 3600 },
      async (err, token) => {
        if (err) {
          console.error('Error al generar token JWT:', err);
          return res.status(500).json({ msg: 'Error al generar token', error: err.message });
        }
        
        // Enviar correo de bienvenida
        try {
          // Configurar el transporte de correo
          const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            }
          });
          
          // Configurar el mensaje
          const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_FROM,
            subject: '¡Bienvenido a Organizador Universitario!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #72002a; text-align: center;">¡Hola ${user.name}!</h2>
                <p style="font-size: 16px; line-height: 1.5;">Gracias por registrarte en <strong>Organizador Universitario</strong>.</p>
                <p style="font-size: 16px; line-height: 1.5;">Tu cuenta ha sido creada exitosamente y ya puedes comenzar a utilizar todas nuestras herramientas para organizar tus estudios:</p>
                <ul style="font-size: 15px; line-height: 1.5;">
                  <li>Gestión de tareas y recordatorios</li>
                  <li>Calendario de eventos y clases</li>
                  <li>Organización de ramos y horarios</li>
                  <li>Calculadora de notas</li>
                </ul>
                <p style="font-size: 16px; line-height: 1.5;">Para comenzar, simplemente inicia sesión en tu cuenta con tu correo electrónico y contraseña.</p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.FRONTEND_URL}/login" style="background-color: #72002a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Iniciar Sesión</a>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 40px; text-align: center;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
              </div>
            `
          };
          
          // Enviar correo
          await transporter.sendMail(mailOptions);
          console.log('Correo de bienvenida enviado a:', user.email);
          
        } catch (emailErr) {
          // Si hay un error al enviar el correo, lo registramos pero no interrumpimos el flujo
          console.error('Error al enviar correo de bienvenida:', emailErr);
          // No retornamos error al cliente, seguimos con el registro normal
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