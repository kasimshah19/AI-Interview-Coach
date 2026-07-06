const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Multer setup — photo aur resume upload ke liye
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// GET profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.log('GET PROFILE ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT profile — save karo
router.put('/profile', authMiddleware, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fullName, bio, targetJobRole, experienceLevel, preferredLanguage, skills } = req.body;

    const updateData = {
      fullName: fullName || '',
      bio: bio || '',
      targetJobRole: targetJobRole || '',
      experienceLevel: experienceLevel || 'fresher',
      preferredLanguage: preferredLanguage || 'english',
      skills: skills ? JSON.parse(skills) : [],
    };

    // Photo upload ho toh save karo
    if (req.files?.photo) {
      updateData.photoUrl = `/uploads/${req.files.photo[0].filename}`;
    }

    // Resume upload ho toh save karo
    if (req.files?.resume) {
      updateData.resumeName = req.files.resume[0].originalname;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { returnDocument: 'after' }
    ).select('-password');

    res.json({ message: 'Profile saved!', user });
  } catch (error) {
    console.log('PUT PROFILE ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;