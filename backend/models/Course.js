// backend/models/Course.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definir el esquema
const CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String
  },
  professor: {
    type: String
  },
  schedule: {
    type: String
  },
  location: {
    type: String
  },
  color: {
    type: String,
    default: '#3788d8'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Registrar el modelo
const Course = mongoose.model('course', CourseSchema);

// Exportar el modelo
module.exports = Course;