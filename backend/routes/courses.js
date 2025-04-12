const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { Course } = require('../models');

// @route   GET api/courses
// @desc    Obtener todos los cursos del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort({ name: 1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/courses
// @desc    Crear un nuevo curso
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'El nombre es obligatorio').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, professor, schedule, location, color } = req.body;

    try {
      const newCourse = new Course({
        name,
        code,
        professor,
        schedule,
        location,
        color,
        user: req.user.id
      });

      const course = await newCourse.save();
      res.json(course);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   PUT api/courses/:id
// @desc    Actualizar un curso
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, code, professor, schedule, location, color } = req.body;

  // Construir objeto de curso
  const courseFields = {};
  if (name) courseFields.name = name;
  if (code !== undefined) courseFields.code = code;
  if (professor !== undefined) courseFields.professor = professor;
  if (schedule !== undefined) courseFields.schedule = schedule;
  if (location !== undefined) courseFields.location = location;
  if (color) courseFields.color = color;

  try {
    let course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Curso no encontrado' });

    // Verificar que el usuario es dueño del curso
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: courseFields },
      { new: true }
    );

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE api/courses/:id
// @desc    Eliminar un curso
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Curso no encontrado' });

    // Verificar que el usuario es dueño del curso
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await Course.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Curso eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;