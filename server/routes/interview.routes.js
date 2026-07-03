const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Interview = require('../models/Interview.model');
const Groq = require('groq-sdk');

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// Start new interview
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { interviewType } = req.body;

    const prompt = `Generate 5 ${interviewType} interview questions for a fresher. 
    Return ONLY a JSON array like this:
    ["question1", "question2", "question3", "question4", "question5"]
    No extra text, only JSON array.`;

    const completion = await getGroq().chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleanText);

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
    console.log('START ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit answer and get feedback
router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { interviewId, questionIndex, question, userAnswer } = req.body;

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

    const completion = await getGroq().chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const feedbackData = JSON.parse(cleanText);

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
    console.log('ANSWER ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete interview
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

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
    console.log('COMPLETE ERROR:', error.message);
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
    console.log('HISTORY ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;