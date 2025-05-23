const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');


router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id })
      .populate('course', 'name color')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    console.error('Error al obtener eventos:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, color, course } = req.body;
    
    // Crear nuevo evento
    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      color,
      // Tratar la cadena vacía como null
      course: course === "" ? null : course,
      user: req.user.id
    });
    
    const event = await newEvent.save();
    
    // Poblar el campo course para devolverlo en la respuesta
    await event.populate('course', 'name color');
    
    res.json(event);
  } catch (err) {
    console.error('Error al crear evento:', err.message);
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('course', 'name color');
    
    // Verificar si el evento existe
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del evento
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    res.json(event);
  } catch (err) {
    console.error('Error al obtener evento:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, color, course } = req.body;
    
    // Construir objeto de evento
    const eventFields = {};
    if (title) eventFields.title = title;
    if (description !== undefined) eventFields.description = description;
    if (startDate) eventFields.startDate = startDate;
    if (endDate) eventFields.endDate = endDate;
    if (location !== undefined) eventFields.location = location;
    if (color) eventFields.color = color;
    
    // Manejar correctamente el campo course
    if (course === '') {
      eventFields.course = null;  // Explícitamente establecer null cuando está vacío
    } else if (course) {
      eventFields.course = course;
    }
    
    let event = await Event.findById(req.params.id);
    
    // Verificar si el evento existe
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del evento
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Actualizar evento
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    ).populate('course', 'name color');
    
    res.json(event);
  } catch (err) {
    console.error('Error al actualizar evento:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    // Verificar si el evento existe
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del evento
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Eliminar evento
    await Event.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Evento eliminado' });
  } catch (err) {
    console.error('Error al eliminar evento:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


router.get('/count', auth, async (req, res) => {
  try {
    const count = await Event.countDocuments({ user: req.user.id });
    res.json({ count });
  } catch (err) {
    console.error('Error al contar eventos:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
