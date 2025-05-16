const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'course'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('event', EventSchema);
