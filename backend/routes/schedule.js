const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Course = require('../models/Course');

// @route   GET api/schedule
// @desc    Obtener todos los eventos del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id })
      .populate('course', 'name')
      .sort({ start: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   POST api/schedule
// @desc    Crear un evento
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, start, end, allDay, color, course } = req.body;

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

    const newEvent = new Event({
      title,
      start,
      end,
      allDay: allDay || false,
      color: color || '#4285F4',
      course,
      user: req.user.id
    });

    const event = await newEvent.save();
    
    // Populate course info for the response
    const populatedEvent = await Event.findById(event._id).populate('course', 'name');
    
    res.json(populatedEvent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   PUT api/schedule/:id
// @desc    Actualizar un evento
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, start, end, allDay, color, course } = req.body;

  // Construir objeto de evento
  const eventFields = {};
  if (title !== undefined) eventFields.title = title;
  if (start !== undefined) eventFields.start = start;
  if (end !== undefined) eventFields.end = end;
  if (allDay !== undefined) eventFields.allDay = allDay;
  if (color !== undefined) eventFields.color = color;
  if (course !== undefined) eventFields.course = course;

  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Evento no encontrado' });

    // Verificar que el usuario es dueño del evento
    if (event.user.toString() !== req.user.id) {
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

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    ).populate('course', 'name');

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   DELETE api/schedule/:id
// @desc    Eliminar un evento
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Evento no encontrado' });

    // Verificar que el usuario es dueño del evento
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await Event.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Evento eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   GET api/schedule/course/:courseId
// @desc    Obtener eventos por curso
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const events = await Event.find({ 
      user: req.user.id,
      course: req.params.courseId 
    }).populate('course', 'name').sort({ start: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;