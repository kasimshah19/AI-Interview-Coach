import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

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
        <h1 className="text-xl font-bold text-purple-400">
          AI Interview Coach
        </h1>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-900 to-gray-900 rounded-2xl p-8 mb-8 border border-purple-800">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-400 mb-6">
            Ready to practice your interview skills today?
          </p>
          <Link
            to="/interview"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
          >
            Start New Interview
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Interviews</p>
            <p className="text-4xl font-bold text-purple-400">
              {history.length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Average Score</p>
            <p className="text-4xl font-bold text-green-400">
              {history.length > 0
                ? Math.round(history.reduce((sum, i) => sum + i.overallScore, 0) / history.length)
                : 0}
              /10
            </p>
          </div>
        </div>

        {/* Interview History */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4">Interview History</h3>

          {history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg mb-4">
                No interviews yet!
              </p>
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
                    <p className="text-gray-400 text-sm">
                      {interview.totalQuestions} questions
                    </p>
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