// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Course = require('../models/Course');

// @route   GET api/tasks
// @desc    Get all user's tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .populate('course')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error al obtener tareas:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/tasks
// @desc    Add new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, course, dueDate, priority, status } = req.body;
    
    console.log('Recibida solicitud para crear tarea:', {
      title,
      description,
      course,
      dueDate,
      priority,
      status
    });
    
    // Validar que la prioridad sea válida
    const validPriorities = ['Alta', 'Media', 'Baja'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ 
        msg: `La prioridad debe ser una de: ${validPriorities.join(', ')}` 
      });
    }
    
    // Validar que el estado sea válido
    const validStatuses = ['Pendiente', 'En progreso', 'Completada'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        msg: `El estado debe ser uno de: ${validStatuses.join(', ')}` 
      });
    }
    
    // Crear nueva tarea
    const newTask = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'Media',
      status: status || 'Pendiente',
      user: req.user.id
    });
    
    // Agregar curso si se proporciona
    if (course) {
      // Verificar que el curso exista
      const courseExists = await Course.findById(course);
      if (!courseExists) {
        return res.status(404).json({ msg: 'Curso no encontrado' });
      }
      
      // Verificar que el usuario sea el propietario del curso
      if (courseExists.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'No autorizado' });
      }
      
      newTask.course = course;
    }
    
    const task = await newTask.save();
    
    // Poblar el campo course para la respuesta
    const populatedTask = await Task.findById(task._id).populate('course');
    
    res.json(populatedTask);
  } catch (err) {
    console.error('Error al crear tarea:', err.message);
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('course');
    
    // Verificar si la tarea existe
    if (!task) {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario sea el propietario de la tarea
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    res.json(task);
  } catch (err) {
    console.error('Error al obtener tarea:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, course, dueDate, priority, status } = req.body;
    
    // Validar que la prioridad sea válida
    const validPriorities = ['Alta', 'Media', 'Baja'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ 
        msg: `La prioridad debe ser una de: ${validPriorities.join(', ')}` 
      });
    }
    
    // Validar que el estado sea válido
    const validStatuses = ['Pendiente', 'En progreso', 'Completada'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        msg: `El estado debe ser uno de: ${validStatuses.join(', ')}` 
      });
    }
    
    // Construir objeto de tarea
    const taskFields = {};
    if (title) taskFields.title = title;
    if (description !== undefined) taskFields.description = description;
    if (dueDate) taskFields.dueDate = dueDate;
    if (priority) taskFields.priority = priority;
    if (status) taskFields.status = status;
    
    let task = await Task.findById(req.params.id);
    
    // Verificar si la tarea existe
    if (!task) {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario sea el propietario de la tarea
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Manejar el campo course
    if (course !== undefined) {
      if (course === '') {
        // Eliminar el curso
        taskFields.course = undefined;
      } else {
        // Verificar que el curso exista
        const courseExists = await Course.findById(course);
        if (!courseExists) {
          return res.status(404).json({ msg: 'Curso no encontrado' });
        }
        
        // Verificar que el usuario sea el propietario del curso
        if (courseExists.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'No autorizado' });
        }
        
        taskFields.course = course;
      }
    }
    
    // Actualizar tarea
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    ).populate('course');
    
    res.json(task);
  } catch (err) {
    console.error('Error al actualizar tarea:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Verificar si la tarea existe
    if (!task) {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario sea el propietario de la tarea
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Eliminar tarea
    await Task.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Tarea eliminada' });
  } catch (err) {
    console.error('Error al eliminar tarea:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tarea no encontrada' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;