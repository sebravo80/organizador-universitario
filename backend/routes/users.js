// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Agregar la importación de nodemailer
const nodemailer = require('nodemailer');
require('dotenv').config();
// Añade esta importación al inicio del archivo
const { logEmailActivity } = require('../utils/emailLogger');

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
            },
            // Para servicios que requieren configuración SMTP específica
            ...(process.env.EMAIL_HOST && {
              host: process.env.EMAIL_HOST,
              port: parseInt(process.env.EMAIL_PORT || '587'),
              secure: process.env.EMAIL_PORT === '465'
            })
          });
          
          // Configurar el mensaje
          const mailOptions = {
            to: user.email,
            from: {
              name: "Organizador Universitario",
              address: process.env.EMAIL_USER
            },
            subject: '¡Bienvenido a Organizador Universitario!',
            html: `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=600px, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 20px 0; text-align: center; background-color: #72002a;">
                      <img src="https://i.imgur.com/zkQVtwR.png" alt="Organizador Universitario Logo" width="60" style="display: inline-block;">
                      <h1 style="color: white; margin: 10px 0;">Organizador Universitario</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
                        <tr>
                          <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #72002a; margin-top: 0;">¡Hola ${user.name}!</h2>
                            <p style="font-size: 16px; line-height: 1.5; color: #333;">Gracias por registrarte en <strong>Organizador Universitario</strong>.</p>
                            <p style="font-size: 16px; line-height: 1.5; color: #333;">Tu cuenta ha sido creada exitosamente y ya puedes comenzar a utilizar todas nuestras herramientas:</p>
                            <ul style="font-size: 15px; line-height: 1.5; color: #333;">
                              <li>Gestión de tareas y recordatorios</li>
                              <li>Calendario de eventos y clases</li>
                              <li>Organización de ramos y horarios</li>
                              <li>Calculadora de notas</li>
                              <li>Lista de pendientes</li>
                            </ul>
                            <div style="text-align: center; margin: 30px 0;">
                              <a href="${process.env.FRONTEND_URL}/login" style="background-color: #72002a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Iniciar Sesión</a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px; text-align: center; color: #666; font-size: 12px; background-color: #f1f1f1;">
                      <p>© ${new Date().getFullYear()} Organizador Universitario. Todos los derechos reservados.</p>
                      <p>Este es un mensaje automatizado. Por favor no respondas a este correo.</p>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `
          };
          
          // Enviar correo
          await transporter.sendMail(mailOptions);
          logEmailActivity('WELCOME', user.email, '¡Bienvenido a Organizador Universitario!', true);
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