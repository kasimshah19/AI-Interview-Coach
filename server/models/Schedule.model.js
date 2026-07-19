const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewType: {
    type: String,
    enum: ['HR', 'Technical', 'Behavioral', 'Resume'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    default: 'Interview Practice'
  },
  note: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'reminded', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);