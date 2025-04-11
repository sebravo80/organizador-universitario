const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Course = require('../models/Course');

// @route   GET api/tasks
// @desc    Obtener todas las tareas del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .populate('course', 'name')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   POST api/tasks
// @desc    Crear una tarea
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, course, dueDate, priority } = req.body;

  try {
    // Verificar si el curso existe y pertenece al usuario
    if (course) {
      const courseExists = await Course.findOne({
        _id: course,
        user: req.user.id
      });

      if (!courseExists) {
        return res.status(404).json({ msg: 'Curso no encontrado' });
      }
    }

    const newTask = new Task({
      title,
      description,
      course,
      dueDate,
      priority,
      user: req.user.id
    });

    const task = await newTask.save();
    
    // Populate course info for the response
    const populatedTask = await Task.findById(task._id).populate('course', 'name');
    
    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   PUT api/tasks/:id
// @desc    Actualizar una tarea
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, course, dueDate, priority, completed } = req.body;

  // Construir objeto de tarea
  const taskFields = {};
  if (title !== undefined) taskFields.title = title;
  if (description !== undefined) taskFields.description = description;
  if (course !== undefined) taskFields.course = course;
  if (dueDate !== undefined) taskFields.dueDate = dueDate;
  if (priority !== undefined) taskFields.priority = priority;
  if (completed !== undefined) taskFields.completed = completed;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });

    // Verificar que el usuario es dueño de la tarea
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    // Verificar si el curso existe y pertenece al usuario
    if (course) {
      const courseExists = await Course.findOne({
        _id: course,
        user: req.user.id
      });

      if (!courseExists) {
        return res.status(404).json({ msg: 'Curso no encontrado' });
      }
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    ).populate('course', 'name');

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Eliminar una tarea
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });

    // Verificar que el usuario es dueño de la tarea
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await Task.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Tarea eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;