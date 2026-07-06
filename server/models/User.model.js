const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Profile fields
  fullName: { type: String, default: '' },
  bio: { type: String, default: '' },
  targetJobRole: { type: String, default: '' },
  experienceLevel: { type: String, default: 'fresher' },
  preferredLanguage: { type: String, default: 'english' },
  skills: { type: [String], default: [] },
  photoUrl: { type: String, default: '' },
  resumeName: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);