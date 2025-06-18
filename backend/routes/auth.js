const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { upload, cloudinary } = require('../config/cloudinary');
require('dotenv').config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

router.post('/', async (req, res) => {
  console.log('Recibida solicitud de login:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    // Verificar si se proporcionaron todos los campos
    if (!email || !password) {
      console.log('Faltan campos requeridos');
      return res.status(400).json({ msg: 'Por favor, proporciona email y contraseña' });
    }

    // Verificar si el usuario existe
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Crear payload para JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Generar token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error('Error al generar token:', err);
          throw err;
        }
        console.log('Login exitoso, token generado');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error en el login:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: 'Por favor, proporciona tu correo electrónico' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    
    // Si no existe el usuario no mostramos error por seguridad
    // pero no se hace nada (evita recolección de emails)
    if (!user) {
      return res.status(200).json({ 
        msg: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' 
      });
    }

    // Crear token de restablecimiento (válido por 1 hora)
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hora
    
    await user.save();
    
    // Crear URL para restablecer contraseña
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
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
        address: process.env.EMAIL_USER  // diatomeauniversitaria@gmail.com
      },
      subject: 'Recuperación de Contraseña - Organizador Universitario',
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace es válido por 1 hora.</p>
        <p>Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
      `
    };
    
    // Enviar correo
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      msg: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' 
    });
    
  } catch (err) {
    console.error('Error al procesar solicitud de recuperación:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    
    if (!password) {
      return res.status(400).json({ msg: 'Por favor, proporciona una nueva contraseña' });
    }
    
    // Buscar usuario con el token de restablecimiento
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        msg: 'El token de restablecimiento es inválido o ha expirado' 
      });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Actualizar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Limpiar tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.json({ msg: 'Contraseña actualizada correctamente' });
    
  } catch (err) {
    console.error('Error al restablecer contraseña:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.put('/user', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Verificar si se proporcionaron los campos
    if (!name && !email) {
      return res.status(400).json({ msg: 'No se proporcionaron datos para actualizar' });
    }
    
    // Construir objeto de usuario
    const userFields = {};
    if (name) userFields.name = name;
    if (email) {
      // Verificar que el email no esté ya en uso por otro usuario
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ msg: 'El correo electrónico ya está registrado' });
      }
      userFields.email = email;
    }
    
    // Actualizar usuario
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }  // Esto devuelve el documento actualizado
    ).select('-password');
    
    // Agregar registro para depuración
    console.log('Usuario actualizado:', user);
    
    res.json(user);
  } catch (err) {
    console.error('Error al actualizar perfil:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verificar si se proporcionaron todos los campos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Por favor, proporciona tu contraseña actual y la nueva' });
    }
    
    // Validar longitud de la nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });
    }
    
    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Guardar cambios
    await user.save();
    
    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/auth/upload-profile-picture
// @desc    Subir foto de perfil
// @access  Private
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No se ha subido ningún archivo' });
    }

    // Obtener el usuario
    const user = await User.findById(req.user.id).select('-password');
    
    // Si el usuario ya tiene una foto, eliminarla de Cloudinary
    if (user.profilePicture && user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }
    
    // Guardar la info de la nueva foto
    user.profilePicture = {
      url: req.file.path,
      publicId: req.file.filename
    };
    
    await user.save();
    
    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    console.error('Error al subir foto de perfil:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/auth/profile-picture
// @desc    Eliminar foto de perfil
// @access  Private
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (user.profilePicture && user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }
    
    user.profilePicture = {
      url: '',
      publicId: ''
    };
    
    await user.save();
    
    res.json({ msg: 'Foto de perfil eliminada' });
  } catch (err) {
    console.error('Error al eliminar foto de perfil:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
