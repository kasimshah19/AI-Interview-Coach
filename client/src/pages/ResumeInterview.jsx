import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import generateInterviewPDF from '../generatePDF'

function ResumeInterview() {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [interviewId, setInterviewId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)
  const [allAnswers, setAllAnswers] = useState([])
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Upload resume
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first!')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/resume/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setQuestions(response.data.questions)
      setStep('start')

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process resume!')
    } finally {
      setLoading(false)
    }
  }

  // Start interview with resume questions
  const startInterview = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/start`,
        { interviewType: 'Resume' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setInterviewId(response.data.interviewId)
      setStep('interview')
    } catch (err) {
      alert('Failed to start interview!')
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
      setAllAnswers(prev => [...prev, {
        question: questions[currentQuestion],
        userAnswer: answer,
        score: response.data.score,
        aiFeedback: response.data.feedback
      }])
      setStep('feedback')
    } catch (err) {
      alert('Failed to submit answer!')
    } finally {
      setLoading(false)
    }
  }

  // Next question
  const nextQuestion = async () => {
    if (currentQuestion + 1 >= questions.length) {
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

  // Download PDF
  const downloadPDF = () => {
    generateInterviewPDF({
      userName: user.name || 'Candidate',
      interviewType: 'Resume Based',
      date: new Date().toLocaleDateString(),
      overallScore: score,
      questions: allAnswers
    })
  }

  // Upload screen
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-center mb-2">Resume Based Interview</h2>
          <p className="text-gray-400 text-center mb-10">
            Upload your resume and AI will generate questions based on it
          </p>

          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div
              className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 transition"
              onClick={() => document.getElementById('resumeInput').click()}
            >
              {file ? (
                <div>
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-green-400 font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-6xl mb-4">📁</p>
                  <p className="text-gray-300 font-medium">Click to upload your resume</p>
                  <p className="text-gray-500 text-sm mt-2">PDF files only (max 5MB)</p>
                </div>
              )}
            </div>

            <input
              id="resumeInput"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Processing Resume with AI...' : 'Upload & Generate Questions'}
            </button>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Questions ready screen
  if (step === 'start') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <p className="text-5xl mb-4">✅</p>
            <h2 className="text-2xl font-bold mb-2">Resume Processed!</h2>
            <p className="text-gray-400">AI has generated {questions.length} questions based on your resume</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="font-semibold text-purple-400 mb-4">Your Questions Preview:</h3>
            {questions.map((q, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <span className="text-purple-400 font-bold">{i + 1}.</span>
                <p className="text-gray-300 text-sm">{q}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Interview'}
          </button>
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
          <span className="text-gray-400">Question {currentQuestion + 1} of {questions.length}</span>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
            <p className="text-sm text-purple-400 font-medium mb-3">
              Resume Based - Question {currentQuestion + 1}
            </p>
            <p className="text-xl font-medium">{questions[currentQuestion]}</p>
          </div>

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

          <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800 text-center">
            <p className="text-gray-400 mb-2">Your Score</p>
            <p className="text-6xl font-bold text-purple-400">
              {feedback?.score}<span className="text-2xl text-gray-400">/10</span>
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800">
            <h3 className="text-purple-400 font-semibold mb-2">Feedback</h3>
            <p className="text-gray-300">{feedback?.feedback}</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
            <h3 className="text-yellow-400 font-semibold mb-2">Areas to Improve</h3>
            <p className="text-gray-300">{feedback?.improvements}</p>
          </div>

          <button
            onClick={nextQuestion}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {currentQuestion + 1 >= questions.length ? 'Complete Interview' : 'Next Question'}
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
            {score}<span className="text-3xl text-gray-400">/10</span>
          </p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Download PDF Report
            </button>
            <button
              onClick={() => navigate('/resume-interview')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Try Again
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

export default ResumeInterview