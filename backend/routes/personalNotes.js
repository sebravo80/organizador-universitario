const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PersonalNote = require('../models/PersonalNotes');

// Obtener todas las notas del usuario
router.get('/', auth, async (req, res) => {
  const notes = await PersonalNote.find({ user: req.user.id }).sort({ date: -1 });
  res.json(notes);
});

// Crear nota
router.post('/', auth, async (req, res) => {
  const { text } = req.body;
  const note = new PersonalNote({ user: req.user.id, text });
  await note.save();
  res.json(note);
});

// Actualizar nota
router.put('/:id', auth, async (req, res) => {
  const { text, done } = req.body;
  const note = await PersonalNote.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { text, done },
    { new: true }
  );
  res.json(note);
});

// Eliminar nota
router.delete('/:id', auth, async (req, res) => {
  await PersonalNote.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ msg: 'Nota eliminada' });
});

module.exports = router;