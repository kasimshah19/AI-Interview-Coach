const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewType: {
    type: String,
    enum: [
      'HR', 'Technical', 'Behavioral', 'Resume',
      'Google', 'Amazon', 'Microsoft', 'TCS',
      'Infosys', 'Wipro', 'Accenture', 'Flipkart',
      'Meta', 'Apple', 'Netflix'
    ],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  categories: {
    type: [String],
    default: []
  },
  questions: [
    {
      question: { type: String },
      userAnswer: { type: String },
      aiFeedback: { type: String },
      score: { type: Number }
    }
  ],
  overallScore: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', interviewSchema);