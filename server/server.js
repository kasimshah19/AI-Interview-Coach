const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/auth.routes');
const interviewRoutes = require('./routes/interview.routes');
const resumeRoutes = require('./routes/resume.routes');
const userRoutes = require('./routes/user.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const scheduleRoutes = require('./routes/schedule.routes');

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/schedule', scheduleRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AI Interview Coach Backend is running!' });
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Cron job — har 1 minute mein check karo
cron.schedule('* * * * *', async () => {
  try {
    const Schedule = require('./models/Schedule.model');
    const User = require('./models/User.model');

    const now = new Date()
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000)

    // Upcoming schedules jo 10 min mein hain
    const upcoming = await Schedule.find({
      scheduledAt: { $gte: now, $lte: tenMinutesLater },
      reminderSent: false,
      status: 'upcoming'
    })

    for (const schedule of upcoming) {
      const user = await User.findById(schedule.userId)
      if (user?.email) {
        // Email bhejo
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `⏰ Reminder: ${schedule.title} starts in 10 minutes!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #8b5cf6;">AI Interview Coach Reminder</h2>
              <p>Hi ${user.name || 'there'}! 👋</p>
              <p>Your <strong>${schedule.interviewType} Interview</strong> practice session starts in <strong>10 minutes!</strong></p>
              <div style="background: #1f2937; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="color: #e5e7eb; margin: 4px 0;">📋 <strong>Title:</strong> ${schedule.title}</p>
                <p style="color: #e5e7eb; margin: 4px 0;">🎯 <strong>Type:</strong> ${schedule.interviewType}</p>
                <p style="color: #e5e7eb; margin: 4px 0;">📊 <strong>Difficulty:</strong> ${schedule.difficulty}</p>
                <p style="color: #e5e7eb; margin: 4px 0;">⏰ <strong>Time:</strong> ${new Date(schedule.scheduledAt).toLocaleString()}</p>
              </div>
              <a href="http://localhost:5173/interview" 
                 style="background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
                Start Interview Now 🚀
              </a>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">AI Interview Coach</p>
            </div>
          `
        })

        // Mark as reminded
        await Schedule.findByIdAndUpdate(schedule._id, { reminderSent: true, status: 'reminded' })
        console.log(`Reminder sent to ${user.email} for schedule: ${schedule.title}`)
      }
    }
  } catch (err) {
    console.log('CRON ERROR:', err.message)
  }
})

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});