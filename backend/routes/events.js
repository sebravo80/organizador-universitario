const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Event = require('../models/Event');
const Course = require('../models/Course');

// @route   GET api/events
// @desc    Obtener todos los eventos del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id })
      .populate('course', 'name code')
      .sort({ start: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/events/:id
// @desc    Obtener un evento por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('course', 'name code');
    
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    // Verificar que el evento pertenece al usuario
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/events
// @desc    Crear un nuevo evento
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'El título es obligatorio').not().isEmpty(),
      check('start', 'La fecha de inicio es obligatoria').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { title, description, start, end, allDay, course, type, recurrence } = req.body;
      
      // Verificar que el curso existe y pertenece al usuario
      if (course) {
        const courseDoc = await Course.findById(course);
        if (!courseDoc) {
          return res.status(404).json({ msg: 'Curso no encontrado' });
        }
        if (courseDoc.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'No autorizado' });
        }
      }
      
      const newEvent = new Event({
        title,
        description,
        start,
        end,
        allDay: allDay || false,
        course,
        type,
        recurrence,
        user: req.user.id
      });
      
      const event = await newEvent.save();
      
      // Poblar el campo course para devolverlo en la respuesta
      await event.populate('course', 'name code');
      
      res.json(event);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   PUT api/events/:id
// @desc    Actualizar un evento
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    // Verificar que el evento pertenece al usuario
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    const { title, description, start, end, allDay, course, type, recurrence } = req.body;
    
    // Verificar que el curso existe y pertenece al usuario
    if (course) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(404).json({ msg: 'Curso no encontrado' });
      }
      if (courseDoc.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'No autorizado' });
      }
    }
    
    // Construir objeto de evento
    const eventFields = {};
    if (title !== undefined) eventFields.title = title;
    if (description !== undefined) eventFields.description = description;
    if (start !== undefined) eventFields.start = start;
    if (end !== undefined) eventFields.end = end;
    if (allDay !== undefined) eventFields.allDay = allDay;
    if (course !== undefined) eventFields.course = course;
    if (type !== undefined) eventFields.type = type;
    if (recurrence !== undefined) eventFields.recurrence = recurrence;
    
    // Actualizar evento
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    ).populate('course', 'name code');
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE api/events/:id
// @desc    Eliminar un evento
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    // Verificar que el evento pertenece al usuario
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    await event.remove();
    
    res.json({ msg: 'Evento eliminado' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/events/course/:courseId
// @desc    Obtener eventos por curso
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const events = await Event.find({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course', 'name code').sort({ start: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/events/range
// @desc    Obtener eventos por rango de fechas
// @access  Private
router.get('/range', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ msg: 'Se requieren fechas de inicio y fin' });
    }
    
    const events = await Event.find({
      user: req.user.id,
      start: { $gte: new Date(start) },
      end: { $lte: new Date(end) }
    }).populate('course', 'name code').sort({ start: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;