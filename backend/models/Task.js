const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  },
  completed: {
    type: Boolean,
    default: false
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'course'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('task', TaskSchema);

module.exports = Task;