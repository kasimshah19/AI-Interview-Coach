const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AI Interview Coach Backend chal raha hai!' });
});

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error:', err));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chal raha hai port ${PORT} par`);
});