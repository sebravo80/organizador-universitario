// backend/models/index.js
const User = require('./User');
const Course = require('./Course');
const Task = require('./Task');
const Event = require('./Event');
const Grade = require('./Grade');

module.exports = {
  User,
  Course,
  Task,
  Event,
  Grade
};