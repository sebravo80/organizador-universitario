const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
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
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date
  },
  allDay: {
    type: Boolean,
    default: false
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'course'
  },
  type: {
    type: String,
    enum: ['clase', 'examen', 'taller', 'otro'],
    default: 'otro'
  },
  recurrence: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('event', EventSchema);