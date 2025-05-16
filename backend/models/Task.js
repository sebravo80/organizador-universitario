const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'course'
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Alta', 'Media', 'Baja'], // Cambiado a mayúsculas iniciales
    default: 'Media'
  },
  status: {
    type: String,
    enum: ['Pendiente', 'En progreso', 'Completada'],
    default: 'Pendiente'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('task', TaskSchema);
