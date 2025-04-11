const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', async (req, res) => {
  res.send('Ruta de registro');
});

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', async (req, res) => {
  res.send('Ruta de login');
});

module.exports = router;