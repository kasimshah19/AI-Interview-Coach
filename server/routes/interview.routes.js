const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Interview = require('../models/Interview.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Start new interview
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { interviewType } = req.body;

    // Gemini se question generate karo
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate 5 ${interviewType} interview questions for a fresher. 
    Return ONLY a JSON array like this:
    ["question1", "question2", "question3", "question4", "question5"]
    No extra text, only JSON array.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON parse karo
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleanText);

    // Database mein save karo
    const interview = new Interview({
      userId: req.userId,
      interviewType,
      questions: questions.map(q => ({ question: q })),
      totalQuestions: questions.length
    });

    await interview.save();

    res.status(201).json({
      message: 'Interview started!',
      interviewId: interview._id,
      questions: questions
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit answer and get feedback
router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { interviewId, questionIndex, question, userAnswer } = req.body;

    // Gemini se feedback lo
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert interviewer. 
    Question: "${question}"
    Candidate's Answer: "${userAnswer}"
    
    Give feedback in this JSON format only:
    {
      "score": (number between 1-10),
      "feedback": "detailed feedback here",
      "improvements": "what to improve"
    }
    Return ONLY JSON, no extra text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const feedbackData = JSON.parse(cleanText);

    // Database update karo
    const interview = await Interview.findById(interviewId);
    interview.questions[questionIndex].userAnswer = userAnswer;
    interview.questions[questionIndex].aiFeedback = feedbackData.feedback;
    interview.questions[questionIndex].score = feedbackData.score;
    await interview.save();

    res.json({
      score: feedbackData.score,
      feedback: feedbackData.feedback,
      improvements: feedbackData.improvements
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete interview
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    // Overall score calculate karo
    const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const overallScore = Math.round(totalScore / interview.questions.length);

    interview.overallScore = overallScore;
    interview.status = 'completed';
    await interview.save();

    res.json({
      message: 'Interview completed!',
      overallScore,
      totalQuestions: interview.totalQuestions
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get interview history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.userId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    res.json({ interviews });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;