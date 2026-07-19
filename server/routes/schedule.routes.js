const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Schedule = require('../models/Schedule.model');

// Get all schedules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const schedules = await Schedule.find({
      userId: req.userId,
      status: { $ne: 'cancelled' }
    }).sort({ scheduledAt: 1 })

    res.json({ schedules })
  } catch (error) {
    console.log('GET SCHEDULES ERROR:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Create schedule
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { interviewType, difficulty, scheduledAt, title, note } = req.body

    if (!scheduledAt) return res.status(400).json({ message: 'Please select date and time' })
    if (new Date(scheduledAt) < new Date()) return res.status(400).json({ message: 'Please select a future date and time' })

    const schedule = new Schedule({
      userId: req.userId,
      interviewType,
      difficulty,
      scheduledAt: new Date(scheduledAt),
      title: title || `${interviewType} Interview Practice`,
      note: note || ''
    })

    await schedule.save()
    res.status(201).json({ message: 'Schedule created!', schedule })
  } catch (error) {
    console.log('CREATE SCHEDULE ERROR:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Delete schedule
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Schedule.findByIdAndUpdate(req.params.id, { status: 'cancelled' })
    res.json({ message: 'Schedule cancelled!' })
  } catch (error) {
    console.log('DELETE SCHEDULE ERROR:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Update schedule
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { interviewType, difficulty, scheduledAt, title, note } = req.body
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { interviewType, difficulty, scheduledAt, title, note },
      { new: true }
    )
    res.json({ message: 'Schedule updated!', schedule })
  } catch (error) {
    console.log('UPDATE SCHEDULE ERROR:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router;