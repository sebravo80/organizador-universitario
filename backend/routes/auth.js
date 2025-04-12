// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { User } = require('../models');

// @route   POST api/auth/register
// @desc    Registrar un usuario
// @access  Public
router.post(
  '/register',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'Por favor, ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Verificar si el usuario ya existe
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'El usuario ya existe' });
      }

      // Crear nuevo usuario
      user = new User({
        name,
        email,
        password
      });

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Guardar usuario en la base de datos
      await user.save();

      // Generar JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error en registro:', err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'La contraseña es obligatoria').exists()
  ],
  async (req, res) => {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Verificar si el usuario existe
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Generar JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error en login:', err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/auth/user
// @desc    Obtener datos del usuario autenticado
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Rutas adicionales que ya habíamos añadido...

module.exports = router;