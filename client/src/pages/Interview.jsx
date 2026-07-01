import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Interview() {
  const [step, setStep] = useState('select')
  const [interviewType, setInterviewType] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [interviewId, setInterviewId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  // Start interview
  const startInterview = async (type) => {
    setLoading(true)
    setInterviewType(type)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/start`,
        { interviewType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestions(response.data.questions)
      setInterviewId(response.data.interviewId)
      setStep('interview')
    } catch (err) {
      alert('Failed to start interview. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  // Submit answer
  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please write your answer first!')
      return
    }
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/answer`,
        {
          interviewId,
          questionIndex: currentQuestion,
          question: questions[currentQuestion],
          userAnswer: answer
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFeedback(response.data)
      setStep('feedback')
    } catch (err) {
      alert('Failed to submit answer. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  // Next question
  const nextQuestion = async () => {
    if (currentQuestion + 1 >= questions.length) {
      // Complete interview
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/interview/complete`,
          { interviewId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setScore(response.data.overallScore)
        setStep('complete')
      } catch (err) {
        alert('Failed to complete interview!')
      }
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setAnswer('')
      setFeedback(null)
      setStep('interview')
    }
  }

  // Select interview type screen
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-center mb-2">
            Select Interview Type
          </h2>
          <p className="text-gray-400 text-center mb-10">
            Choose the type of interview you want to practice
          </p>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-purple-400 text-xl">
                Generating questions with AI...
              </p>
              <p className="text-gray-400 mt-2">Please wait...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {['HR', 'Technical', 'Behavioral'].map((type) => (
                <button
                  key={type}
                  onClick={() => startInterview(type)}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-purple-500 text-left p-6 rounded-xl transition group"
                >
                  <h3 className="text-xl font-bold group-hover:text-purple-400 transition">
                    {type} Interview
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {type === 'HR' && 'General HR questions about yourself and career goals'}
                    {type === 'Technical' && 'Technical questions related to your field'}
                    {type === 'Behavioral' && 'Situational and behavioral questions'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Interview screen
  if (step === 'interview') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
          <span className="text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
            <p className="text-sm text-purple-400 font-medium mb-3">
              {interviewType} Interview - Question {currentQuestion + 1}
            </p>
            <p className="text-xl font-medium">
              {questions[currentQuestion]}
            </p>
          </div>

          {/* Answer */}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 resize-none mb-4"
          />

          <button
            onClick={submitAnswer}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Getting AI Feedback...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    )
  }

  // Feedback screen
  if (step === 'feedback') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">AI Feedback</h2>

          {/* Score */}
          <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800 text-center">
            <p className="text-gray-400 mb-2">Your Score</p>
            <p className="text-6xl font-bold text-purple-400">
              {feedback?.score}
              <span className="text-2xl text-gray-400">/10</span>
            </p>
          </div>

          {/* Feedback */}
          <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800">
            <h3 className="text-purple-400 font-semibold mb-2">Feedback</h3>
            <p className="text-gray-300">{feedback?.feedback}</p>
          </div>

          {/* Improvements */}
          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
            <h3 className="text-yellow-400 font-semibold mb-2">
              Areas to Improve
            </h3>
            <p className="text-gray-300">{feedback?.improvements}</p>
          </div>

          <button
            onClick={nextQuestion}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {currentQuestion + 1 >= questions.length
              ? 'Complete Interview'
              : 'Next Question'}
          </button>
        </div>
      </div>
    )
  }

  // Complete screen
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold mb-4">Interview Complete!</h2>
          <p className="text-gray-400 mb-6">Your overall score</p>
          <p className="text-8xl font-bold text-purple-400 mb-8">
            {score}
            <span className="text-3xl text-gray-400">/10</span>
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/interview')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Practice Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Interview 