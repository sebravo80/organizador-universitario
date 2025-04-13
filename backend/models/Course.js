// backend/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  name: {
    type: String,
    required: true
  },
  professor: {
    type: String
  },
  // Usaremos un array de strings para los horarios
  scheduleStrings: [String],
  color: {
    type: String,
    default: '#3498db'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('course', CourseSchema);