import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchHistory(token)
  }, [])

  const fetchHistory = async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/interview/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHistory(response.data.interviews)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Chart data prepare
  const chartData = history.map((interview, index) => ({
    name: `#${index + 1} ${interview.interviewType}`,
    score: interview.overallScore,
    date: new Date(interview.createdAt).toLocaleDateString()
  })).reverse()

  const typeData = ['HR', 'Technical', 'Behavioral', 'Resume'].map(type => {
    const typeInterviews = history.filter(i => i.interviewType === type)
    return {
      type,
      count: typeInterviews.length,
      avgScore: typeInterviews.length > 0
        ? Math.round(typeInterviews.reduce((sum, i) => sum + i.overallScore, 0) / typeInterviews.length)
        : 0
    }
  }).filter(t => t.count > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">AI Interview Coach</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Hello, {user?.name}!</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-900 to-gray-900 rounded-2xl p-8 mb-8 border border-purple-800">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
          <p className="text-gray-400 mb-6">Ready to practice your interview skills today?</p>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/interview"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
            >
              Start New Interview
            </Link>
            <Link
              to="/resume-interview"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
            >
              Resume Based Interview
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Interviews</p>
            <p className="text-4xl font-bold text-purple-400">{history.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Average Score</p>
            <p className="text-4xl font-bold text-green-400">
              {history.length > 0
                ? Math.round(history.reduce((sum, i) => sum + i.overallScore, 0) / history.length)
                : 0}/10
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Best Score</p>
            <p className="text-4xl font-bold text-yellow-400">
              {history.length > 0
                ? Math.max(...history.map(i => i.overallScore))
                : 0}/10
            </p>
          </div>
        </div>

        {/* Line Chart - Progress */}
        {history.length > 1 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-xl font-bold mb-6">Score Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - By Type */}
        {typeData.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-xl font-bold mb-6">Average Score by Interview Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9ca3af" />
                <YAxis domain={[0, 10]} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Interview History */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4">Interview History</h3>
          {history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg mb-4">No interviews yet!</p>
              <Link
                to="/interview"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition inline-block"
              >
                Start Your First Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((interview, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{interview.interviewType} Interview</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      {interview.overallScore}/10
                    </p>
                    <p className="text-gray-400 text-sm">{interview.totalQuestions} questions</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard