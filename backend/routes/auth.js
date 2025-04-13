// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
require('dotenv').config();

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/auth
// @desc    Auth user & get token
// @access  Public
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

module.exports = router;