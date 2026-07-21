import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import generateInterviewPDF from '../generatePDF'

const COMPANIES = [
  {
    id: 'google', name: 'Google', emoji: '🔵',
    color: 'from-blue-600 to-green-500', border: 'border-blue-500', bg: 'bg-blue-900/20',
    category: 'FAANG', role: 'Software Engineer', style: 'Problem-solving & System Design focused',
    tips: ['Focus on data structures and algorithms', 'Practice system design questions', 'Use STAR method for behavioral questions', 'Think out loud during problem solving', 'Ask clarifying questions before solving']
  },
  {
    id: 'microsoft', name: 'Microsoft', emoji: '🪟',
    color: 'from-blue-500 to-cyan-400', border: 'border-cyan-500', bg: 'bg-cyan-900/20',
    category: 'FAANG', role: 'Software Developer', style: 'Growth mindset & Technical skills focused',
    tips: ['Demonstrate growth mindset', 'Focus on collaborative problem solving', 'Discuss past experiences with impact', 'Show passion for technology', 'Be ready for coding challenges']
  },
  {
    id: 'amazon', name: 'Amazon', emoji: '📦',
    color: 'from-orange-500 to-yellow-400', border: 'border-orange-500', bg: 'bg-orange-900/20',
    category: 'FAANG', role: 'SDE', style: 'Leadership Principles focused',
    tips: ['Learn all 16 Leadership Principles', 'Use STAR format for every answer', 'Quantify your achievements', 'Show customer obsession', 'Demonstrate ownership mentality']
  },
  {
    id: 'meta', name: 'Meta', emoji: '👥',
    color: 'from-blue-600 to-indigo-500', border: 'border-indigo-500', bg: 'bg-indigo-900/20',
    category: 'FAANG', role: 'Software Engineer', style: 'Move fast & Impact focused',
    tips: ['Focus on scalability and performance', 'Show experience with large-scale systems', 'Discuss product sense and user impact', 'Be ready for rapid problem solving', 'Demonstrate data-driven thinking']
  },
  {
    id: 'apple', name: 'Apple', emoji: '🍎',
    color: 'from-gray-400 to-gray-600', border: 'border-gray-400', bg: 'bg-gray-800/50',
    category: 'FAANG', role: 'Software Engineer', style: 'Excellence & Innovation focused',
    tips: ['Show passion for user experience', 'Demonstrate attention to detail', 'Discuss innovation and creativity', 'Show knowledge of Apple ecosystem', 'Focus on quality over quantity']
  },
  {
    id: 'netflix', name: 'Netflix', emoji: '🎬',
    color: 'from-red-600 to-red-500', border: 'border-red-500', bg: 'bg-red-900/20',
    category: 'FAANG', role: 'Senior Engineer', style: 'Freedom & Responsibility culture',
    tips: ['Show high performance mindset', 'Demonstrate good judgment', 'Discuss handling ambiguity', 'Show data-driven decisions', 'Be honest about mistakes and learnings']
  },
  {
    id: 'tcs', name: 'TCS', emoji: '🏢',
    color: 'from-blue-700 to-blue-500', border: 'border-blue-600', bg: 'bg-blue-900/20',
    category: 'Indian IT', role: 'Software Developer', style: 'Technical & HR focused for freshers',
    tips: ['Strong basics in C, Java, or Python', 'Know about TCS values and culture', 'Be ready for aptitude questions', 'Discuss academic projects clearly', 'Show willingness to learn and adapt']
  },
  {
    id: 'infosys', name: 'Infosys', emoji: '💼',
    color: 'from-indigo-600 to-blue-500', border: 'border-indigo-500', bg: 'bg-indigo-900/20',
    category: 'Indian IT', role: 'Systems Engineer', style: 'Communication & Technical skills focused',
    tips: ['Good communication skills essential', 'Know core CS fundamentals', 'Be ready for puzzle questions', 'Discuss internship/project experience', 'Show client-handling attitude']
  },
  {
    id: 'accenture', name: 'Accenture', emoji: '🌐',
    color: 'from-purple-600 to-pink-500', border: 'border-purple-500', bg: 'bg-purple-900/20',
    category: 'Indian IT', role: 'Associate Software Engineer', style: 'Consulting & Technology focused',
    tips: ['Show consulting mindset', 'Discuss technology trends', 'Be ready for case studies', 'Show teamwork and collaboration', 'Discuss digital transformation']
  },
  {
    id: 'wipro', name: 'Wipro', emoji: '⚡',
    color: 'from-yellow-500 to-orange-400', border: 'border-yellow-500', bg: 'bg-yellow-900/20',
    category: 'Indian IT', role: 'Project Engineer', style: 'Technical & Aptitude focused',
    tips: ['Strong logical reasoning skills', 'Know OOPs concepts thoroughly', 'Be ready for coding rounds', 'Show problem solving approach', 'Discuss team projects']
  },
  {
    id: 'cognizant', name: 'Cognizant', emoji: '🧠',
    color: 'from-blue-500 to-teal-400', border: 'border-teal-500', bg: 'bg-teal-900/20',
    category: 'Indian IT', role: 'Programmer Analyst', style: 'Digital & Technology focused',
    tips: ['Know about digital technologies', 'Show adaptability to new tech', 'Discuss agile methodology', 'Be ready for HR questions', 'Show passion for continuous learning']
  },
  {
    id: 'capgemini', name: 'Capgemini', emoji: '🔷',
    color: 'from-blue-600 to-cyan-500', border: 'border-cyan-500', bg: 'bg-cyan-900/20',
    category: 'Indian IT', role: 'Software Analyst', style: 'Innovation & Collaboration focused',
    tips: ['Show innovative thinking', 'Discuss cloud technologies', 'Be ready for psychometric tests', 'Show multicultural awareness', 'Discuss sustainability interests']
  }
]

const TIMER_CONFIG = {
  google: 5 * 60, microsoft: 5 * 60, amazon: 4 * 60, meta: 5 * 60,
  apple: 4 * 60, netflix: 4 * 60, tcs: 3 * 60, infosys: 3 * 60,
  accenture: 3 * 60, wipro: 3 * 60, cognizant: 3 * 60, capgemini: 3 * 60,
  custom: 3 * 60
}

function TimerCircle({ timeLeft, totalTime, isWarning }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = timeLeft / totalTime
  const strokeDashoffset = circumference * (1 - progress)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none"
            stroke={isWarning ? '#ef4444' : '#8b5cf6'} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      {isWarning && <p className="text-red-400 text-xs animate-pulse mt-1">⚠️ Hurry!</p>}
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

function CompanyInterview() {
  const [step, setStep] = useState('select')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
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
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customCompanyName, setCustomCompanyName] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [customError, setCustomError] = useState('')
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null)
  const [cameraError, setCameraError] = useState('')

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setVideoEnabled(true)
      setCameraError('')
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedVideoUrl(URL.createObjectURL(blob))
      }
      recorder.start()
      mediaRecorderRef.current = recorder
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permission.')
      setVideoEnabled(false)
    }
  }

  const stopCamera = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setVideoEnabled(false)
  }, [])

  const downloadVideo = () => {
    if (!recordedVideoUrl) return
    const a = document.createElement('a')
    a.href = recordedVideoUrl
    a.download = `interview-${selectedCompany?.name}-${new Date().toLocaleDateString()}.webm`
    a.click()
  }

  useEffect(() => { return () => { stopCamera() } }, [stopCamera])

  useEffect(() => {
    if (videoEnabled && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [videoEnabled, step])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setTimerActive(false)
  }, [])

  const stopSpeaking = useCallback(() => { window.speechSynthesis.cancel(); setIsSpeaking(false) }, [])
  const stopListening = useCallback(() => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false) }, [])

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
      setAllAnswers(prev => [...prev, { question: questions[currentQuestion], userAnswer: currentAnswer, score: response.data.score, aiFeedback: response.data.feedback }])
      setStep('feedback')
    } catch (err) { setStep('feedback') }
    finally { setLoading(false) }
  }, [answer, interviewId, currentQuestion, questions, token])

  const handleTimeUp = useCallback(() => {
    stopTimer(); stopListening(); stopSpeaking(); setShowTimeUp(true)
  }, [stopTimer, stopListening, stopSpeaking])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { handleTimeUp(); return 0 } return prev - 1 })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive, handleTimeUp])

  const startTimer = useCallback((companyId) => {
    const duration = TIMER_CONFIG[companyId] || 3 * 60
    setTimeLeft(duration); setTotalTime(duration); setTimerActive(true)
  }, [])

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

  useEffect(() => {
    if (step === 'interview' && questions[currentQuestion]) {
      setTimeout(() => speakQuestion(questions[currentQuestion]), 500)
    }
  }, [step, currentQuestion])

  const handleCustomCompany = () => {
    if (!customCompanyName.trim()) { setCustomError('Please enter company name'); return }
    const customCompany = {
      id: 'custom', name: customCompanyName.trim(), emoji: '🏭',
      color: 'from-purple-600 to-pink-500', border: 'border-purple-500', bg: 'bg-purple-900/20',
      category: 'Custom', role: customRole.trim() || 'Software Engineer',
      style: `${customCompanyName.trim()} interview style`,
      tips: ['Research the company thoroughly', 'Understand their products and services', 'Prepare for both technical and HR questions', 'Show enthusiasm for the company', 'Ask thoughtful questions at the end']
    }
    setSelectedCompany(customCompany)
    setShowCustomModal(false)
    setCustomCompanyName(''); setCustomRole(''); setCustomError('')
    setStep('tips')
  }

  const startInterview = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/start`,
        { interviewType: selectedCompany.id === 'custom' ? 'HR' : selectedCompany.name, companyName: selectedCompany.name, companyStyle: selectedCompany.style, role: selectedCompany.role },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestions(response.data.questions)
      setInterviewId(response.data.interviewId)
      setStep('interview')
      startTimer(selectedCompany.id)
    } catch (err) { alert('Failed to start interview!') }
    finally { setLoading(false) }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) { alert('Please write your answer first!'); return }
    stopTimer(); stopListening(); stopSpeaking()
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/answer`,
        { interviewId, questionIndex: currentQuestion, question: questions[currentQuestion], userAnswer: answer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFeedback(response.data)
      setAllAnswers(prev => [...prev, { question: questions[currentQuestion], userAnswer: answer, score: response.data.score, aiFeedback: response.data.feedback }])
      setStep('feedback')
    } catch (err) { alert('Failed to submit answer!') }
    finally { setLoading(false) }
  }

  const nextQuestion = async () => {
    if (currentQuestion + 1 >= questions.length) {
      stopCamera()
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/interview/complete`,
          { interviewId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setScore(response.data.overallScore)
        setStep('complete')
      } catch (err) { alert('Failed to complete!') }
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setAnswer(''); setFeedback(null)
      setStep('interview')
      startTimer(selectedCompany.id)
    }
  }

  const downloadPDF = () => {
    generateInterviewPDF({
      userName: user.name || 'Candidate',
      interviewType: `${selectedCompany.name} Interview`,
      date: new Date().toLocaleDateString(),
      overallScore: score, questions: allAnswers
    })
  }

  const isWarning = timeLeft <= 30 && timeLeft > 0
  const filteredCompanies = filterCategory === 'All' ? COMPANIES : COMPANIES.filter(c => c.category === filterCategory)

  // Select Screen
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-400">🏢 Company Interviews</h1>
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm transition">← Dashboard</button>
        </nav>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Choose Your Target Company</h2>
            <p className="text-gray-400 text-lg">Practice with real company-specific interview questions</p>
          </div>
          <div className="flex gap-3 justify-center mb-8">
            {['All', 'FAANG', 'Indian IT'].map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${filterCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {filteredCompanies.map((company) => (
              <button key={company.id} onClick={() => { setSelectedCompany(company); setStep('tips') }}
                className={`${company.bg} border ${company.border} rounded-2xl p-5 text-center hover:scale-105 transition-all duration-200 group`}
              >
                <div className="text-5xl mb-3">{company.emoji}</div>
                <p className="font-bold text-lg group-hover:text-white">{company.name}</p>
                <p className="text-gray-400 text-xs mt-1">{company.role}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gradient-to-r ${company.color} text-white`}>{company.category}</span>
              </button>
            ))}
            <button onClick={() => setShowCustomModal(true)}
              className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-2xl p-5 text-center hover:scale-105 transition-all duration-200 group bg-gray-900/50"
            >
              <div className="text-5xl mb-3">➕</div>
              <p className="font-bold text-lg text-gray-400 group-hover:text-purple-400">Custom Company</p>
              <p className="text-gray-500 text-xs mt-1">Any company</p>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">Custom</span>
            </button>
          </div>
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4 text-center">
            <p className="text-purple-400 text-sm">🔍 Don't see your target company? Click <strong>"Custom Company"</strong> to practice for any company!</p>
          </div>
        </div>

        {showCustomModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-2">Custom Company</h3>
              <p className="text-gray-400 text-sm mb-6">Enter any company name — AI will generate questions accordingly</p>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Company Name *</label>
                <input type="text" value={customCompanyName}
                  onChange={e => { setCustomCompanyName(e.target.value); setCustomError('') }}
                  placeholder="e.g. Flipkart, Zomato, Razorpay..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  onKeyDown={e => e.key === 'Enter' && handleCustomCompany()}
                />
                {customError && <p className="text-red-400 text-xs mt-1">{customError}</p>}
              </div>
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Role (Optional)</label>
                <input type="text" value={customRole} onChange={e => setCustomRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Product Manager..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  onKeyDown={e => e.key === 'Enter' && handleCustomCompany()}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowCustomModal(false); setCustomCompanyName(''); setCustomRole(''); setCustomError('') }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-semibold py-3 rounded-xl transition">Cancel</button>
                <button onClick={handleCustomCompany}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition">Start Practice →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tips Screen
  if (step === 'tips') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-400">🏢 Company Interviews</h1>
          <button onClick={() => setStep('select')} className="text-gray-400 hover:text-white text-sm transition">← Back</button>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className={`${selectedCompany.bg} border ${selectedCompany.border} rounded-2xl p-8 mb-6 text-center`}>
            <div className="text-7xl mb-4">{selectedCompany.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{selectedCompany.name}</h2>
            <p className="text-gray-400 mb-2">{selectedCompany.role}</p>
            <p className="text-sm text-gray-500">{selectedCompany.style}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">⏱️ Time per question</p>
                <p className="text-gray-400 text-sm">Auto-submit when timer ends</p>
              </div>
              <p className="text-2xl font-bold text-purple-400">{Math.floor((TIMER_CONFIG[selectedCompany.id] || 180) / 60)} min</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">💡 Interview Tips for {selectedCompany.name}</h3>
            <div className="space-y-3">
              {selectedCompany.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-0.5">✓</span>
                  <p className="text-gray-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={startInterview} disabled={loading}
            className={`w-full bg-gradient-to-r ${selectedCompany.color} text-white font-bold py-4 rounded-xl transition text-lg disabled:opacity-50`}
          >
            {loading ? 'Generating Questions...' : `Start ${selectedCompany.name} Interview 🚀`}
          </button>
        </div>
      </div>
    )
  }

  // ✅ INTERVIEW SCREEN — SIDE BY SIDE LAYOUT
  if (step === 'interview') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {showTimeUp && <TimeUpAnimation onComplete={handleTimeUpComplete} />}

        {isWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-600/20 border-b border-red-500 py-2 text-center z-40">
            <p className="text-red-400 font-semibold animate-pulse">⚠️ Only {timeLeft} seconds remaining!</p>
          </div>
        )}

        {/* Navbar */}
        <nav className={`bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center ${isWarning ? 'mt-10' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCompany.emoji}</span>
            <h1 className="text-xl font-bold text-purple-400">{selectedCompany.name} Interview</h1>
            <button
              onClick={videoEnabled ? stopCamera : startCamera}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition ${
                videoEnabled
                  ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-purple-500 hover:text-purple-400'
              }`}
            >
              {videoEnabled ? '📹 Stop Camera' : '📷 Start Camera'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Q {currentQuestion + 1}/{questions.length}</span>
            <TimerCircle timeLeft={timeLeft} totalTime={totalTime} isWarning={isWarning} />
          </div>
        </nav>

        {cameraError && (
          <div className="bg-red-900/20 border-b border-red-500/30 px-6 py-2 text-center">
            <p className="text-red-400 text-sm">⚠️ {cameraError}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all bg-gradient-to-r ${selectedCompany.color}`}
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* SIDE BY SIDE LAYOUT */}
        <div className="flex gap-4 px-6 py-6 h-[calc(100vh-140px)]">

          {/* LEFT — Question + Answer */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">

            {/* Question Box */}
            <div className={`rounded-xl p-6 border transition-all ${isWarning ? 'bg-red-900/10 border-red-500/30' : `${selectedCompany.bg} ${selectedCompany.border}`}`}>
              <p className="text-sm text-purple-400 font-medium mb-3">
                {selectedCompany.name} — Question {currentQuestion + 1} of {questions.length}
              </p>
              <p className="text-xl font-medium mb-4 leading-relaxed">{questions[currentQuestion]}</p>
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(questions[currentQuestion])}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
              >
                {isSpeaking ? '🔇 Stop' : '🔊 Hear Question'}
              </button>
            </div>

            {/* Answer Box */}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer or use microphone..."
              className={`flex-1 text-white px-4 py-3 rounded-xl border focus:outline-none resize-none transition-all ${
                isWarning ? 'bg-red-900/10 border-red-500/50' : 'bg-gray-900 border-gray-700 focus:border-purple-500'
              }`}
              style={{ minHeight: '160px' }}
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => isListening ? stopListening() : startListening()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
                  isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {isListening ? '🔴 Stop Recording' : '🎤 Speak Answer'}
              </button>
              <button onClick={() => setAnswer('')} className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition">
                Clear
              </button>
            </div>

            {isListening && (
              <div className="bg-red-900/20 border border-red-500 rounded-xl p-3 text-center">
                <p className="text-red-400 text-sm animate-pulse">🎙️ Listening... Speak now!</p>
              </div>
            )}

            <button
              onClick={submitAnswer}
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 bg-gradient-to-r ${selectedCompany.color}`}
            >
              {loading ? 'Getting AI Feedback...' : 'Submit Answer'}
            </button>
          </div>

          {/* RIGHT — Camera Feed */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-3">
            {videoEnabled ? (
              <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-purple-500 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ minHeight: '300px' }}
                />
                {/* REC indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs text-white font-bold">REC</span>
                </div>
                {/* Stop button */}
                <button
                  onClick={stopCamera}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full transition"
                >
                  ✕ Stop
                </button>
                {/* Bottom label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium text-center">📹 You are being recorded</p>
                  <p className="text-gray-400 text-xs text-center mt-1">Face the camera naturally</p>
                </div>
              </div>
            ) : (
              /* Camera OFF state */
              <div className="flex-1 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900 flex flex-col items-center justify-center gap-4 p-6"
                style={{ minHeight: '300px' }}
              >
                <div className="text-6xl">📷</div>
                <p className="text-gray-400 text-center text-sm">Camera is off</p>
                <p className="text-gray-600 text-center text-xs">Click "Start Camera" in navbar to enable video recording</p>
                <button
                  onClick={startCamera}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
                >
                  📷 Start Camera
                </button>
              </div>
            )}

            {/* Tips box below camera */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-medium mb-2">💡 Quick Tips</p>
              <ul className="space-y-1">
                <li className="text-xs text-gray-500">• Maintain eye contact with camera</li>
                <li className="text-xs text-gray-500">• Speak clearly and confidently</li>
                <li className="text-xs text-gray-500">• Sit in good lighting</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // Feedback Screen
  if (step === 'feedback') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-purple-400">{selectedCompany.emoji} {selectedCompany.name} Interview</h1>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">AI Feedback</h2>
          <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800 text-center">
            <p className="text-gray-400 mb-2">Your Score</p>
            <p className="text-6xl font-bold text-purple-400">{feedback?.score}<span className="text-2xl text-gray-400">/10</span></p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800">
            <h3 className="text-purple-400 font-semibold mb-2">Feedback</h3>
            <p className="text-gray-300">{feedback?.feedback}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
            <h3 className="text-yellow-400 font-semibold mb-2">Areas to Improve</h3>
            <p className="text-gray-300">{feedback?.improvements}</p>
          </div>
          <button onClick={nextQuestion} className={`w-full bg-gradient-to-r ${selectedCompany.color} text-white font-semibold py-3 rounded-xl transition`}>
            {currentQuestion + 1 >= questions.length ? 'Complete Interview' : 'Next Question'}
          </button>
        </div>
      </div>
    )
  }

  // Complete Screen
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-8xl mb-4">{selectedCompany.emoji}</div>
          <h2 className="text-4xl font-bold mb-2">{selectedCompany.name} Interview Complete!</h2>
          <p className="text-gray-400 mb-6">Your overall score</p>
          <p className="text-8xl font-bold text-purple-400 mb-8">{score}<span className="text-3xl text-gray-400">/10</span></p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition">
              📄 Download PDF Report
            </button>
            {recordedVideoUrl && (
              <button onClick={downloadVideo} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition">
                🎥 Download Interview Video
              </button>
            )}
            {recordedVideoUrl && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-3 text-center">🎬 Your Interview Recording</p>
                <video src={recordedVideoUrl} controls className="w-full rounded-xl" style={{ maxHeight: '200px' }} />
              </div>
            )}
            <button
              onClick={() => { setStep('select'); setSelectedCompany(null); setRecordedVideoUrl(null) }}
              className={`bg-gradient-to-r ${selectedCompany.color} text-white font-semibold px-6 py-3 rounded-xl transition`}
            >
              Try Another Company
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

export default CompanyInterview