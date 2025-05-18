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
  courseCode: {
    type: String
  },
  professor: {
    type: String
  },
  room: {
    type: String
  },
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
