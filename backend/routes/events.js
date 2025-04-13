// backend/routes/events.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

// @route   GET api/events
// @desc    Get all user's events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id }).sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/events
// @desc    Add new event
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, startDate, endDate, location, color } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      color,
      user: req.user.id
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;