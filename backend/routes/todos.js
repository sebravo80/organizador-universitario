const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');


router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ date: -1 });
    res.json(todos);
  } catch (err) {
    console.error('Error al obtener pendientes:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'El texto del pendiente es requerido' });
    }
    
    const newTodo = new Todo({
      text,
      user: req.user.id
    });
    
    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    console.error('Error al crear pendiente:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    const { text, completed } = req.body;
    
    // Construir objeto de pendiente
    const todoFields = {};
    if (text !== undefined) todoFields.text = text;
    if (completed !== undefined) todoFields.completed = completed;
    
    let todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Actualizar pendiente
    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: todoFields },
      { new: true }
    );
    
    res.json(todo);
  } catch (err) {
    console.error('Error al actualizar pendiente:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ msg: 'Pendiente no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    await Todo.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Pendiente eliminado' });
  } catch (err) {
    console.error('Error al eliminar pendiente:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.get('/count', auth, async (req, res) => {
  try {
    const count = await Todo.countDocuments({ user: req.user.id });
    res.json({ count });
  } catch (err) {
    console.error('Error al contar pendientes:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
