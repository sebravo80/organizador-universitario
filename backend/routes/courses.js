// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');

// @route   GET api/courses
// @desc    Get all user's courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort({ date: -1 });
    res.json(courses);
  } catch (err) {
    console.error('Error al obtener cursos:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/courses
// @desc    Add new course
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, professor, scheduleStrings, color } = req.body;
    
    console.log('Recibida solicitud para crear curso:', {
      name,
      professor,
      scheduleStrings,
      color
    });
    
    // Crear nuevo curso
    const newCourse = new Course({
      name,
      professor,
      scheduleStrings: scheduleStrings || [],
      color,
      user: req.user.id
    });
    
    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error('Error al crear curso:', err.message);
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
});

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    // Verificar si el curso existe
    if (!course) {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del curso
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    res.json(course);
  } catch (err) {
    console.error('Error al obtener curso:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT api/courses/:id
// @desc    Update course
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, professor, scheduleStrings, color } = req.body;
    
    // Construir objeto de curso
    const courseFields = {};
    if (name) courseFields.name = name;
    if (professor !== undefined) courseFields.professor = professor;
    if (scheduleStrings) courseFields.scheduleStrings = scheduleStrings;
    if (color) courseFields.color = color;
    
    let course = await Course.findById(req.params.id);
    
    // Verificar si el curso existe
    if (!course) {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del curso
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Actualizar curso
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: courseFields },
      { new: true }
    );
    
    res.json(course);
  } catch (err) {
    console.error('Error al actualizar curso:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE api/courses/:id
// @desc    Delete course
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    // Verificar si el curso existe
    if (!course) {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del curso
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Eliminar curso
    await Course.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Curso eliminado' });
  } catch (err) {
    console.error('Error al eliminar curso:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;