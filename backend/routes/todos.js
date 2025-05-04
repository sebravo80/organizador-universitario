const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TodoItem = require('../models/TodoItem');

// @route   GET api/todos
// @desc    Get all user's todo items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const todos = await TodoItem.find({ user: req.user.id }).sort({ date: -1 });
    res.json(todos);
  } catch (err) {
    console.error('Error al obtener elementos pendientes:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/todos
// @desc    Add new todo item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'El texto del elemento es requerido' });
    }
    
    const newTodo = new TodoItem({
      text,
      user: req.user.id
    });
    
    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    console.error('Error al crear elemento pendiente:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT api/todos/:id
// @desc    Update todo item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { text, completed } = req.body;
    
    const todoFields = {};
    if (text !== undefined) todoFields.text = text;
    if (completed !== undefined) todoFields.completed = completed;
    
    let todo = await TodoItem.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    todo = await TodoItem.findByIdAndUpdate(
      req.params.id,
      { $set: todoFields },
      { new: true }
    );
    
    res.json(todo);
  } catch (err) {
    console.error('Error al actualizar elemento pendiente:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE api/todos/:id
// @desc    Delete todo item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await TodoItem.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    await TodoItem.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Elemento eliminado' });
  } catch (err) {
    console.error('Error al eliminar elemento pendiente:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;