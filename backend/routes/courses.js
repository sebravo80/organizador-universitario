const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');

// @route   GET api/courses
// @desc    Obtener todos los cursos del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort({ date: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   POST api/courses
// @desc    Crear un curso
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, code, professor, schedule, room } = req.body;

  try {
    const newCourse = new Course({
      name,
      code,
      professor,
      schedule,
      room,
      user: req.user.id
    });

    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   PUT api/courses/:id
// @desc    Actualizar un curso
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, code, professor, schedule, room } = req.body;

  // Construir objeto de curso
  const courseFields = {};
  if (name) courseFields.name = name;
  if (code) courseFields.code = code;
  if (professor) courseFields.professor = professor;
  if (schedule) courseFields.schedule = schedule;
  if (room) courseFields.room = room;

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
    res.status(500).send('Error en el servidor');
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
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;