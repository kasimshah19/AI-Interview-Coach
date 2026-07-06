import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import generateInterviewPDF from '../generatePDF'

const TIMER_CONFIG = {
  HR: 2 * 60,
  Technical: 5 * 60,
  Behavioral: 3 * 60,
  Coding: 20 * 60,
  Resume: 3 * 60,
  default: 3 * 60
}

const DIFFICULTY_CONFIG = {
  Beginner: {
    label: 'Beginner', icon: '🟢', color: 'text-green-400',
    border: 'border-green-500', bg: 'bg-green-500/10',
    badge: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Basic questions for freshers', duration: '15-20 min',
  },
  Intermediate: {
    label: 'Intermediate', icon: '🟡', color: 'text-yellow-400',
    border: 'border-yellow-500', bg: 'bg-yellow-500/10',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    description: 'Moderate questions for 1-3 years experience', duration: '20-25 min',
  },
  Advanced: {
    label: 'Advanced', icon: '🟠', color: 'text-orange-400',
    border: 'border-orange-500', bg: 'bg-orange-500/10',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: 'Complex questions for 3-5 years experience', duration: '25-30 min',
  },
  Expert: {
    label: 'Expert', icon: '🔴', color: 'text-red-400',
    border: 'border-red-500', bg: 'bg-red-500/10',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    description: 'Challenging questions for senior professionals', duration: '30-40 min',
  }
}

const CATEGORIES = {
  HR: [
    { id: 'general_hr', label: 'General HR', icon: '👔', desc: 'Common HR questions' },
    { id: 'communication', label: 'Communication', icon: '🗣️', desc: 'Communication skills' },
    { id: 'leadership', label: 'Leadership', icon: '👑', desc: 'Leadership & management' },
    { id: 'salary_negotiation', label: 'Salary Negotiation', icon: '💰', desc: 'Salary & benefits' },
  ],
  Technical: [
    { id: 'coding', label: 'Coding', icon: '💻', desc: 'Programming & algorithms' },
    { id: 'system_design', label: 'System Design', icon: '🏗️', desc: 'Architecture & design' },
    { id: 'database', label: 'Database', icon: '🗄️', desc: 'SQL & NoSQL concepts' },
    { id: 'operating_system', label: 'Operating System', icon: '⚙️', desc: 'OS concepts & theory' },
    { id: 'networking', label: 'Networking', icon: '🌐', desc: 'Network protocols & concepts' },
  ],
  Behavioral: [
    { id: 'general_behavioral', label: 'General Behavioral', icon: '🧠', desc: 'Situational questions' },
    { id: 'teamwork', label: 'Teamwork', icon: '🤝', desc: 'Collaboration & team skills' },
    { id: 'problem_solving', label: 'Problem Solving', icon: '🔍', desc: 'Analytical thinking' },
    { id: 'conflict_resolution', label: 'Conflict Resolution', icon: '⚖️', desc: 'Handling conflicts' },
  ]
}

function TimerCircle({ timeLeft, totalTime, isWarning }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = timeLeft / totalTime
  const strokeDashoffset = circumference * (1 - progress)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={isWarning ? '#ef4444' : '#8b5cf6'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-400">left</span>
        </div>
      </div>
      {isWarning && <p className="text-red-400 text-xs font-medium mt-1 animate-pulse">⚠️ Hurry up!</p>}
    </div>
  )
}

function TimeUpAnimation({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-bounce">⏰</div>
        <h2 className="text-4xl font-bold text-red-400 mb-2">Time's Up!</h2>
        <p className="text-gray-400">Moving to next question...</p>
      </div>
    </div>
  )
}

function Interview() {
  const [step, setStep] = useState('select')
  const [interviewType, setInterviewType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [interviewId, setInterviewId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)
  const [allAnswers, setAllAnswers] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [showTimeUp, setShowTimeUp] = useState(false)
  const [timerActive, setTimerActive] = useState(false)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setTimerActive(false)
  }, [])

  const handleTimeUp = useCallback(async () => {
    stopTimer()
    if (recognitionRef.current) recognitionRef.current.stop()
    window.speechSynthesis.cancel()
    setShowTimeUp(true)
  }, [stopTimer])

  const startTimer = useCallback((type) => {
    const duration = TIMER_CONFIG[type] || TIMER_CONFIG.default
    setTimeLeft(duration)
    setTotalTime(duration)
    setTimerActive(true)
  }, [])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleTimeUp(); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive, handleTimeUp])

  const handleTimeUpComplete = useCallback(async () => {
    setShowTimeUp(false)
    const currentAnswer = answer.trim() || 'No answer provided - Time expired'
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/answer`,
        { interviewId, questionIndex: currentQuestion, question: questions[currentQuestion], userAnswer: currentAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFeedback(response.data)
      setAllAnswers(prev => [...prev, {
        question: questions[currentQuestion], userAnswer: currentAnswer,
        score: response.data.score, aiFeedback: response.data.feedback
      }])
      setStep('feedback')
    } catch (err) {
      if (currentQuestion + 1 >= questions.length) {
        completeInterview()
      } else {
        setCurrentQuestion(prev => prev + 1)
        setAnswer('')
        setStep('interview')
        startTimer(interviewType)
      }
    } finally {
      setLoading(false)
    }
  }, [answer, interviewId, currentQuestion, questions, token, interviewType])

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'; utterance.rate = 0.9
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false) }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Please use Chrome for voice input!'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'; recognition.continuous = true; recognition.interimResults = true
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript
      }
      if (finalTranscript) setAnswer(prev => prev + ' ' + finalTranscript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false) }

  useEffect(() => {
    if (step === 'interview' && questions[currentQuestion]) {
      setTimeout(() => speakQuestion(questions[currentQuestion]), 500)
    }
  }, [step, currentQuestion])

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const selectAllCategories = () => {
    const allIds = CATEGORIES[interviewType]?.map(c => c.id) || []
    setSelectedCategories(allIds)
  }

  // Start interview
  const startInterview = async (type) => {
    setLoading(true)
    setInterviewType(type)
    const cats = selectedCategories.length > 0 ? selectedCategories : ['general']
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/start`,
        { interviewType: type, difficulty, categories: cats },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestions(response.data.questions)
      setInterviewId(response.data.interviewId)
      setStep('interview')
      startTimer(type)
    } catch (err) {
      alert('Failed to start interview. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) { alert('Please write or speak your answer first!'); return }
    stopTimer(); stopListening(); stopSpeaking()
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/answer`,
        { interviewId, questionIndex: currentQuestion, question: questions[currentQuestion], userAnswer: answer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFeedback(response.data)
      setAllAnswers(prev => [...prev, {
        question: questions[currentQuestion], userAnswer: answer,
        score: response.data.score, aiFeedback: response.data.feedback
      }])
      setStep('feedback')
    } catch (err) {
      alert('Failed to submit answer. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  const nextQuestion = async () => {
    if (currentQuestion + 1 >= questions.length) {
      completeInterview()
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setAnswer(''); setFeedback(null)
      setStep('interview')
      startTimer(interviewType)
    }
  }

  const completeInterview = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/complete`,
        { interviewId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setScore(response.data.overallScore)
      setStep('complete')
    } catch (err) { alert('Failed to complete interview!') }
  }

  const downloadPDF = () => {
    generateInterviewPDF({
      userName: user.name || 'Candidate',
      interviewType, difficulty,
      date: new Date().toLocaleDateString(),
      overallScore: score, questions: allAnswers
    })
  }

  const isWarning = timeLeft <= 30 && timeLeft > 0
  const diffConfig = DIFFICULTY_CONFIG[difficulty] || {}

  // STEP 1 — Select Interview Type
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-center mb-2">Select Interview Type</h2>
          <p className="text-gray-400 text-center mb-8">Choose the type of interview you want to practice</p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-400 mb-3 font-medium">⏱️ Time limits per question:</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'HR', label: 'HR Interview', time: '2 min', icon: '👔' },
                { type: 'Technical', label: 'Technical', time: '5 min', icon: '💻' },
                { type: 'Behavioral', label: 'Behavioral', time: '3 min', icon: '🧠' },
              ].map((t) => (
                <div key={t.type} className="text-center bg-gray-800 rounded-lg p-2">
                  <p className="text-lg">{t.icon}</p>
                  <p className="text-xs text-gray-400">{t.label}</p>
                  <p className="text-purple-400 font-bold text-sm">{t.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {['HR', 'Technical', 'Behavioral'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setInterviewType(type)
                  setSelectedCategories([])
                  setStep('category')
                }}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-purple-500 text-left p-6 rounded-xl transition group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-purple-400 transition">
                      {type} Interview
                    </h3>
                    <p className="text-gray-400 mt-1 text-sm">
                      {type === 'HR' && 'General HR questions about yourself and career goals'}
                      {type === 'Technical' && 'Technical questions related to your field'}
                      {type === 'Behavioral' && 'Situational and behavioral questions'}
                    </p>
                    <p className="text-purple-500 text-xs mt-2">
                      {CATEGORIES[type]?.length} categories available →
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">
                      {type === 'HR' && '2 min'}
                      {type === 'Technical' && '5 min'}
                      {type === 'Behavioral' && '3 min'}
                    </p>
                    <p className="text-gray-500 text-xs">per question</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // STEP 2 — Select Categories
  if (step === 'category') {
    const availableCategories = CATEGORIES[interviewType] || []
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setStep('select')} className="text-gray-400 hover:text-white transition">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <p className="text-purple-400 text-sm font-medium mb-1">{interviewType} Interview</p>
            <h2 className="text-3xl font-bold mb-2">Select Categories</h2>
            <p className="text-gray-400">Choose one or multiple categories to practice</p>
          </div>

          {/* Select All button */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">
              {selectedCategories.length === 0
                ? 'No category selected — all will be included'
                : `${selectedCategories.length} selected`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={selectAllCategories}
                className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full transition"
              >
                Select All
              </button>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded-full transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`text-left p-5 rounded-xl border-2 transition hover:scale-[1.02] ${
                    isSelected
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{cat.icon}</span>
                    {isSelected && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">✓</span>
                    )}
                  </div>
                  <p className={`font-semibold text-sm mb-1 ${isSelected ? 'text-purple-400' : 'text-white'}`}>
                    {cat.label}
                  </p>
                  <p className="text-gray-500 text-xs">{cat.desc}</p>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setStep('difficulty')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Continue → Select Difficulty
          </button>
        </div>
      </div>
    )
  }

  // STEP 3 — Select Difficulty
  if (step === 'difficulty') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setStep('category')} className="text-gray-400 hover:text-white transition">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="text-center mb-6">
            <p className="text-purple-400 text-sm font-medium mb-1">{interviewType} Interview</p>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {selectedCategories.map(catId => {
                  const cat = CATEGORIES[interviewType]?.find(c => c.id === catId)
                  return cat ? (
                    <span key={catId} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded-full">
                      {cat.icon} {cat.label}
                    </span>
                  ) : null
                })}
              </div>
            )}
            <h2 className="text-3xl font-bold mb-2">Select Difficulty Level</h2>
            <p className="text-gray-400">AI will generate questions based on your selected level</p>
          </div>

          <div className="grid gap-4">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  setDifficulty(key)
                  startInterview(interviewType)
                }}
                className={`text-left p-6 rounded-xl border-2 transition hover:scale-[1.01] ${
                  difficulty === key ? `${config.border} ${config.bg}` : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-xl font-bold ${config.color}`}>{config.label}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${config.badge}`}>{key}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${config.color}`}>⏱️ {config.duration}</p>
                    <p className="text-gray-500 text-xs">estimated</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-10 mt-6">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-400 text-lg">Generating questions with AI...</p>
              <p className="text-gray-400 mt-2 text-sm">Please wait...</p>
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
        {showTimeUp && <TimeUpAnimation onComplete={handleTimeUpComplete} />}

        {isWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-600/20 border-b border-red-500 py-2 text-center z-40">
            <p className="text-red-400 font-semibold animate-pulse">
              ⚠️ Only {timeLeft} seconds remaining! Submit your answer now!
            </p>
          </div>
        )}

        <nav className={`bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center ${isWarning ? 'mt-10' : ''}`}>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${diffConfig.badge}`}>
              {diffConfig.icon} {difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Question {currentQuestion + 1} of {questions.length}</span>
            <TimerCircle timeLeft={timeLeft} totalTime={totalTime} isWarning={isWarning} />
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className={`rounded-xl p-6 mb-4 border transition-all ${isWarning ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-900 border-gray-800'}`}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <p className="text-sm text-purple-400 font-medium">
                {interviewType} Interview - Question {currentQuestion + 1}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${diffConfig.badge}`}>
                {diffConfig.icon} {difficulty}
              </span>
            </div>
            <p className="text-xl font-medium mb-4">{questions[currentQuestion]}</p>
            <button
              onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(questions[currentQuestion])}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isSpeaking ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isSpeaking ? '🔇 Stop Speaking' : '🔊 Hear Question'}
            </button>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here or use the microphone below..."
            rows={5}
            className={`w-full text-white px-4 py-3 rounded-xl border focus:outline-none resize-none mb-4 transition-all ${
              isWarning ? 'bg-red-900/10 border-red-500/50 focus:border-red-400' : 'bg-gray-900 border-gray-700 focus:border-purple-500'
            }`}
          />

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => isListening ? stopListening() : startListening()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
                isListening ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isListening ? '🔴 Stop Recording' : '🎤 Speak Answer'}
            </button>
            <button onClick={() => setAnswer('')} className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition">
              Clear
            </button>
          </div>

          {isListening && (
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-400 text-sm animate-pulse">🎙️ Listening... Speak now!</p>
            </div>
          )}

          <button
            onClick={submitAnswer}
            disabled={loading}
            className={`w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 ${
              isWarning ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
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
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
          <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${diffConfig.badge}`}>
            {diffConfig.icon} {difficulty}
          </span>
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
          <button onClick={nextQuestion} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition">
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
          <h2 className="text-4xl font-bold mb-2">Interview Complete!</h2>
          <div className="flex justify-center mb-4">
            <span className={`text-sm px-4 py-1 rounded-full border font-medium ${diffConfig.badge}`}>
              {diffConfig.icon} {difficulty} Level Completed
            </span>
          </div>
          <p className="text-gray-400 mb-6">Your overall score</p>
          <p className="text-8xl font-bold text-purple-400 mb-8">
            {score}<span className="text-3xl text-gray-400">/10</span>
          </p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition">
              Download PDF Report
            </button>
            <button
              onClick={() => { setStep('select'); setDifficulty(''); setInterviewType(''); setSelectedCategories([]) }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Practice Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Interview 