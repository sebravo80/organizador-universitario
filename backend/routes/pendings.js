const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pending = require('../models/Pending');

// @route   GET api/pendings
// @desc    Get all user's pendings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/pendings - UserId:', req.user.id);
    const pendings = await Pending.find({ user: req.user.id })
      .sort({ date: -1 }); // Ordenar por fecha, más reciente primero
    res.json(pendings);
  } catch (err) {
    console.error('Error al obtener pendientes:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/pendings
// @desc    Add new pending
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    
    console.log('Recibida solicitud para crear pendiente:', {
      title,
      description,
      completed
    });

    // Crear nuevo pendiente
    const newPending = new Pending({
      title,
      description,
      completed: completed || false,
      user: req.user.id
    });
    
    const pending = await newPending.save();
    res.json(pending);
  } catch (err) {
    console.error('Error al crear pendiente:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET api/pendings/:id
// @desc    Get pending by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const pending = await Pending.findById(req.params.id);
    
    // Verificar si el pendiente existe
    if (!pending) {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del pendiente
    if (pending.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    res.json(pending);
  } catch (err) {
    console.error('Error al obtener pendiente:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT api/pendings/:id
// @desc    Update pending
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    
    // Construir objeto de pendiente
    const pendingFields = {};
    if (title !== undefined) pendingFields.title = title;
    if (description !== undefined) pendingFields.description = description;
    if (completed !== undefined) pendingFields.completed = completed;
    
    let pending = await Pending.findById(req.params.id);
    
    // Verificar si el pendiente existe
    if (!pending) {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del pendiente
    if (pending.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Actualizar pendiente
    pending = await Pending.findByIdAndUpdate(
      req.params.id,
      { $set: pendingFields },
      { new: true }
    );
    
    res.json(pending);
  } catch (err) {
    console.error('Error al actualizar pendiente:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE api/pendings/:id
// @desc    Delete pending
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const pending = await Pending.findById(req.params.id);
    
    // Verificar si el pendiente existe
    if (!pending) {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del pendiente
    if (pending.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Eliminar pendiente
    await Pending.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Pendiente eliminado' });
  } catch (err) {
    console.error('Error al eliminar pendiente:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;