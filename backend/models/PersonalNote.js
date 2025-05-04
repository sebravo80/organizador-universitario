const mongoose = require('mongoose');

const PersonalNoteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  done: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PersonalNote', PersonalNoteSchema);