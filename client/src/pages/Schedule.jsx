import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Schedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    interviewType: 'HR',
    difficulty: 'Beginner',
    scheduledAt: '',
    title: '',
    note: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/schedule`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSchedules(res.data.schedules)
    } catch (err) {
      console.log('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.scheduledAt) { setError('Please select date and time'); return }
    setSaving(true)
    setError('')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/schedule`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Interview scheduled! You will get email reminder 10 minutes before.')
      setShowForm(false)
      setForm({ interviewType: 'HR', difficulty: 'Beginner', scheduledAt: '', title: '', note: '' })
      fetchSchedules()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this schedule?')) return
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/schedule/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchSchedules()
    } catch (err) {
      console.log('Cancel error:', err)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'upcoming') return 'text-green-400 bg-green-400/10 border-green-400/30'
    if (status === 'reminded') return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    if (status === 'completed') return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    return 'text-red-400 bg-red-400/10 border-red-400/30'
  }

  const getTypeIcon = (type) => {
    if (type === 'HR') return '👔'
    if (type === 'Technical') return '💻'
    if (type === 'Behavioral') return '🧠'
    return '📄'
  }

  const getDifficultyColor = (diff) => {
    if (diff === 'Beginner') return 'text-green-400'
    if (diff === 'Intermediate') return 'text-yellow-400'
    if (diff === 'Advanced') return 'text-orange-400'
    return 'text-red-400'
  }

  const isUpcoming = (date) => new Date(date) > new Date()

  // Min datetime for input (now)
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  const upcomingSchedules = schedules.filter(s => s.status !== 'cancelled' && isUpcoming(s.scheduledAt))
  const pastSchedules = schedules.filter(s => !isUpcoming(s.scheduledAt) && s.status !== 'cancelled')

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

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">📅 Interview Schedule</h1>
            <p className="text-gray-400 mt-1">Plan your practice sessions — get email reminders</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 rounded-xl transition flex items-center gap-2"
          >
            {showForm ? '✕ Cancel' : '+ New Schedule'}
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p>{success}</p>
          </div>
        )}

        {/* Schedule Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-6">Schedule New Interview</h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Morning HR Practice"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  min={minDateTime}
                  onChange={e => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Interview Type</label>
                <select
                  value={form.interviewType}
                  onChange={e => setForm(prev => ({ ...prev, interviewType: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="HR">👔 HR Interview</option>
                  <option value="Technical">💻 Technical Interview</option>
                  <option value="Behavioral">🧠 Behavioral Interview</option>
                  <option value="Resume">📄 Resume Interview</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="Beginner">🟢 Beginner</option>
                  <option value="Intermediate">🟡 Intermediate</option>
                  <option value="Advanced">🟠 Advanced</option>
                  <option value="Expert">🔴 Expert</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Note (Optional)</label>
              <textarea
                value={form.note}
                onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="e.g. Focus on system design questions today..."
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {/* Email reminder info */}
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4 mb-6">
              <p className="text-purple-400 text-sm">
                📧 <strong>Email Reminder</strong> — You will receive an email reminder 10 minutes before your scheduled interview.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scheduling...
                </>
              ) : (
                '📅 Schedule Interview'
              )}
            </button>
          </div>
        )}

        {/* Upcoming Schedules */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🔜 Upcoming Sessions
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{upcomingSchedules.length}</span>
          </h3>

          {upcomingSchedules.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
              <p className="text-5xl mb-3">📅</p>
              <p className="text-gray-400 mb-4">No upcoming sessions scheduled</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition text-sm"
              >
                Schedule Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSchedules.map(schedule => (
                <div key={schedule._id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getTypeIcon(schedule.interviewType)}</div>
                      <div>
                        <h4 className="font-semibold text-lg">{schedule.title || `${schedule.interviewType} Interview`}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                          <span className={`text-xs font-medium ${getDifficultyColor(schedule.difficulty)}`}>
                            {schedule.difficulty}
                          </span>
                        </div>
                        {schedule.note && (
                          <p className="text-gray-500 text-sm mt-2">📝 {schedule.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-purple-400 font-semibold text-sm">
                        {new Date(schedule.scheduledAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(schedule.scheduledAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      <div className="flex gap-2 mt-3 justify-end">
                        <Link
                          to="/interview"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Start Now
                        </Link>
                        <button
                          onClick={() => handleCancel(schedule._id)}
                          className="bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Schedules */}
        {pastSchedules.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-400">Past Sessions</h3>
            <div className="space-y-3">
              {pastSchedules.map(schedule => (
                <div key={schedule._id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(schedule.interviewType)}</span>
                      <div>
                        <p className="font-medium text-sm">{schedule.title}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(schedule.scheduledAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Schedule