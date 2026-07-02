const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed!'), false)
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Upload resume and generate questions
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file!' })
    }

    // Read PDF
    const filePath = path.join(__dirname, '../uploads/', req.file.filename)
    const dataBuffer = fs.readFileSync(filePath)
    const pdfData = await pdfParse(dataBuffer)
    const resumeText = pdfData.text.slice(0, 3000)

    // Delete file after reading
    fs.unlinkSync(filePath)

    // Generate questions from resume
    const prompt = `Based on this resume, generate 5 relevant interview questions.
    
Resume Content:
${resumeText}

Return ONLY a JSON array like this:
["question1", "question2", "question3", "question4", "question5"]
No extra text, only JSON array.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    const cleanText = responseText.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(cleanText)

    res.json({
      message: 'Resume processed successfully!',
      questions,
      resumeText: resumeText.slice(0, 500)
    })

  } catch (error) {
    console.log('RESUME ERROR:', error.message)
    res.status(500).json({ message: 'Failed to process resume', error: error.message })
  }
});

module.exports = router;