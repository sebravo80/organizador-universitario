const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Grade, Course } = require('../models');

// @route   GET api/grades
// @desc    Get all user's grades grouped by course
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ user: req.user.id }).populate('course', 'name color');
    res.json(grades);
  } catch (err) {
    console.error('Error al obtener notas:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET api/grades/course/:courseId
// @desc    Get all grades for a specific course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ 
      user: req.user.id,
      course: req.params.courseId 
    }).populate('course', 'name color');
    
    res.json(grades);
  } catch (err) {
    console.error('Error al obtener notas del curso:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/grades
// @desc    Add new grade
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { course, name, score, weight, notes } = req.body;
    
    // Validar puntaje y peso
    if (score < 0 || score > 7) {
      return res.status(400).json({ msg: 'La nota debe estar entre 0 y 7' });
    }
    
    if (weight <= 0 || weight > 100) {
      return res.status(400).json({ msg: 'El porcentaje debe estar entre 1 y 100' });
    }
    
    // Verificar que el curso exista
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ msg: 'Curso no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del curso
    if (courseExists.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Crear nueva nota
    const newGrade = new Grade({
      user: req.user.id,
      course,
      name,
      score,
      weight,
      notes
    });
    
    const grade = await newGrade.save();
    
    // Poblar el campo course para la respuesta
    const populatedGrade = await Grade.findById(grade._id).populate('course', 'name color');
    
    res.json(populatedGrade);
  } catch (err) {
    console.error('Error al crear nota:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT api/grades/:id
// @desc    Update grade
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, score, weight, notes } = req.body;
    
    // Validar puntaje y peso si se proporcionan
    if (score !== undefined && (score < 0 || score > 7)) {
      return res.status(400).json({ msg: 'La nota debe estar entre 0 y 7' });
    }
    
    if (weight !== undefined && (weight <= 0 || weight > 100)) {
      return res.status(400).json({ msg: 'El porcentaje debe estar entre 1 y 100' });
    }
    
    // Construir objeto de nota
    const gradeFields = {};
    if (name) gradeFields.name = name;
    if (score !== undefined) gradeFields.score = score;
    if (weight !== undefined) gradeFields.weight = weight;
    if (notes !== undefined) gradeFields.notes = notes;
    
    let grade = await Grade.findById(req.params.id);
    
    // Verificar si la nota existe
    if (!grade) {
      return res.status(404).json({ msg: 'Nota no encontrada' });
    }
    
    // Verificar que el usuario sea el propietario de la nota
    if (grade.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Actualizar nota
    grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { $set: gradeFields },
      { new: true }
    ).populate('course', 'name color');
    
    res.json(grade);
  } catch (err) {
    console.error('Error al actualizar nota:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Nota no encontrada' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE api/grades/:id
// @desc    Delete grade
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    
    // Verificar si la nota existe
    if (!grade) {
      return res.status(404).json({ msg: 'Nota no encontrada' });
    }
    
    // Verificar que el usuario sea el propietario de la nota
    if (grade.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Eliminar nota
    await Grade.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Nota eliminada' });
  } catch (err) {
    console.error('Error al eliminar nota:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Nota no encontrada' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;