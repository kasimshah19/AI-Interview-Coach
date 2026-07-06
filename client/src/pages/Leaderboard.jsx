import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Leaderboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('avgScore')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchLeaderboard()
  }, [filter, sort])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/leaderboard?filter=${filter}&sort=${sort}&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setData(res.data)
    } catch (err) {
      console.log('Leaderboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    const delay = setTimeout(() => fetchLeaderboard(), 400)
    return () => clearTimeout(delay)
  }, [search])

  const getRankDisplay = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>
    if (rank === 2) return <span className="text-2xl">🥈</span>
    if (rank === 3) return <span className="text-2xl">🥉</span>
    return <span className="text-gray-400 font-bold text-sm">#{rank}</span>
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Skeleton Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-purple-400">AI Interview Coach</span>
          </Link>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-3 w-2/3"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-800 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold text-purple-400">AI Interview Coach</span>
        </Link>
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-400">See how you rank against other candidates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Participants', value: data?.totalParticipants || 0, icon: '👥', color: 'text-blue-400' },
            { label: 'Highest Score', value: `${data?.highestScore || 0}/10`, icon: '🏆', color: 'text-yellow-400' },
            { label: 'Average Score', value: `${data?.averageScore || 0}/10`, icon: '📊', color: 'text-green-400' },
            { label: 'My Rank', value: data?.myRank ? `#${data.myRank}` : 'N/A', icon: '🎯', color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center hover:border-gray-700 transition">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-gray-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search + Sort */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'month', label: 'This Month' },
                { value: 'week', label: 'This Week' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filter === f.value ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search by name..."
                className="bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition w-48"
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition text-gray-300"
            >
              <option value="avgScore">Sort: Avg Score</option>
              <option value="bestScore">Sort: Best Score</option>
              <option value="totalInterviews">Sort: Most Interviews</option>
              <option value="lowestScore">Sort: Lowest Score</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {(!data?.leaderboard || data.leaderboard.length === 0) && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <p className="text-6xl mb-4">📋</p>
            <h3 className="text-xl font-bold mb-2">No Data Yet</h3>
            <p className="text-gray-400 mb-6">Complete some interviews to appear on the leaderboard</p>
            <Link to="/interview" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition inline-block">
              Start Practicing
            </Link>
          </div>
        )}

        {/* Leaderboard Table */}
        {data?.leaderboard && data.leaderboard.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 text-xs text-gray-400 font-medium uppercase tracking-wide">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">User</div>
              <div className="col-span-2 text-center">Avg Score</div>
              <div className="col-span-2 text-center">Best Score</div>
              <div className="col-span-1 text-center">Interviews</div>
              <div className="col-span-2 text-center">Badge</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-800">
              {data.leaderboard.map((user) => {
                const isMe = user.name === (currentUser?.name || '')
                return (
                  <div
                    key={user.userId}
                    onClick={() => setSelectedUser(user)}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition hover:bg-gray-800/50 ${
                      isMe ? 'bg-purple-900/20 border-l-4 border-purple-500' : ''
                    } ${user.rank <= 3 ? 'bg-yellow-900/5' : ''}`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center flex items-center justify-center">
                      {getRankDisplay(user.rank)}
                    </div>

                    {/* User Info */}
                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-600">
                        {user.photoUrl ? (
                          <img src={`http://localhost:5000${user.photoUrl}`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm truncate ${isMe ? 'text-purple-400' : 'text-white'}`}>
                          {user.name} {isMe && <span className="text-xs text-purple-400">(You)</span>}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{user.targetJobRole}</p>
                      </div>
                    </div>

                    {/* Avg Score */}
                    <div className="col-span-2 text-center">
                      <span className={`text-lg font-bold ${getScoreColor(user.avgScore)}`}>
                        {user.avgScore}
                      </span>
                      <span className="text-gray-500 text-xs">/10</span>
                    </div>

                    {/* Best Score */}
                    <div className="col-span-2 text-center">
                      <span className="text-white font-semibold">{user.bestScore}</span>
                      <span className="text-gray-500 text-xs">/10</span>
                    </div>

                    {/* Interviews */}
                    <div className="col-span-1 text-center">
                      <span className="text-gray-300 font-medium">{user.totalInterviews}</span>
                    </div>

                    {/* Badge */}
                    <div className="col-span-2 text-center hidden md:block">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${user.badge.color}`}>
                        {user.badge.icon} {user.badge.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedUser(null)}
              className="float-right text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            {/* Photo */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mx-auto mb-3 border-4 border-purple-500/30">
                {selectedUser.photoUrl ? (
                  <img src={`http://localhost:5000${selectedUser.photoUrl}`} alt={selectedUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <h3 className="text-xl font-bold">{selectedUser.name}</h3>
              <p className="text-purple-400 text-sm">{selectedUser.targetJobRole}</p>
              <div className="flex justify-center mt-2">
                <span className={`text-xs px-3 py-1 rounded-full border ${selectedUser.badge.color}`}>
                  {selectedUser.badge.icon} {selectedUser.badge.label}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Avg Score', value: `${selectedUser.avgScore}/10`, color: 'text-green-400' },
                { label: 'Best Score', value: `${selectedUser.bestScore}/10`, color: 'text-yellow-400' },
                { label: 'Interviews', value: selectedUser.totalInterviews, color: 'text-blue-400' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-3 text-center">
                  <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            {selectedUser.skills && selectedUser.skills.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs font-medium mb-2">SKILLS</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills.slice(0, 6).map((skill, i) => (
                    <span key={i} className="bg-purple-900/40 border border-purple-700/50 text-purple-300 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rank */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Current Rank: <span className="text-white font-bold">#{selectedUser.rank}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard