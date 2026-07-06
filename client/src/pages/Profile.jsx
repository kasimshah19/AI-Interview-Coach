import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    bio: '',
    targetJobRole: '',
    experienceLevel: 'fresher',
    preferredLanguage: 'english',
    skills: [],
    photoUrl: null,
    resumeName: null,
  })

  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    weakAreas: [],
    strongAreas: [],
  })

  const [recentInterviews, setRecentInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(prev => ({ ...prev, ...data.user }))
      }
    } catch (err) {
      console.log('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/interview/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const interviews = data.interviews || []
        setRecentInterviews(interviews.slice(0, 5))

        if (interviews.length > 0) {
          const scores = interviews.map(i => i.overallScore || 0)
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length
          const best = Math.max(...scores)
          setStats({
            totalInterviews: interviews.length,
            averageScore: avg.toFixed(1),
            bestScore: best,
            weakAreas: getWeakAreas(interviews),
            strongAreas: getStrongAreas(interviews),
          })
        }
      }
    } catch (err) {
      console.log('Stats fetch error:', err)
    }
  }

  const getWeakAreas = (interviews) => {
    const types = interviews
      .filter(i => (i.overallScore || 0) < 6)
      .map(i => i.interviewType)
    return [...new Set(types)].slice(0, 3)
  }

  const getStrongAreas = (interviews) => {
    const types = interviews
      .filter(i => (i.overallScore || 0) >= 7)
      .map(i => i.interviewType)
    return [...new Set(types)].slice(0, 3)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, photoUrl: url, photoFile: file }))
    }
  }

  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfile(prev => ({ ...prev, resumeName: file.name, resumeFile: file }))
    }
  }

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      const skill = skillInput.trim()
      if (!profile.skills.includes(skill)) {
        setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  // UPDATED handleSave — validation added
  const handleSave = async () => {
    if (!profile.fullName.trim()) {
      alert('Please enter your full name')
      return
    }
    if (!profile.targetJobRole) {
      alert('Please select your target job role')
      return
    }
    if (profile.skills.length === 0) {
      alert('Please add at least one skill')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      formData.append('fullName', profile.fullName)
      formData.append('bio', profile.bio)
      formData.append('targetJobRole', profile.targetJobRole)
      formData.append('experienceLevel', profile.experienceLevel)
      formData.append('preferredLanguage', profile.preferredLanguage)
      formData.append('skills', JSON.stringify(profile.skills))
      if (profile.photoFile) formData.append('photo', profile.photoFile)
      if (profile.resumeFile) formData.append('resume', profile.resumeFile)

      const res = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Failed to save profile. Please try again.')
      }
    } catch (err) {
      console.log('Save error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const jobRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Analyst', 'Data Scientist',
    'Product Manager', 'UI/UX Designer', 'DevOps Engineer',
    'Machine Learning Engineer', 'Business Analyst', 'Other'
  ]

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-500/20 border-green-500/30'
    if (score >= 6) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-purple-400">AI Interview Coach</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
              Dashboard
            </Link>
            <Link to="/interview" className="text-gray-400 hover:text-white transition text-sm">
              Practice
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-400 mt-1">Manage your profile and view your interview stats</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : saved ? (
              <>✅ Saved!</>
            ) : (
              <>💾 Save Profile</>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium text-sm transition border-b-2 -mb-px ${
              activeTab === 'profile'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            👤 Profile Info
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium text-sm transition border-b-2 -mb-px ${
              activeTab === 'stats'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            📊 Stats & History
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-8">

            <div className="space-y-6">

              {/* Photo Upload */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                <div
                  className="w-28 h-28 rounded-full mx-auto mb-4 cursor-pointer overflow-hidden border-4 border-purple-500/30 hover:border-purple-500 transition relative group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-sm">📷 Change</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="text-purple-400 text-sm hover:text-purple-300 transition"
                >
                  Upload Photo
                </button>
                <p className="text-gray-500 text-xs mt-1">JPG, PNG max 2MB</p>

                {profile.fullName && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="font-semibold text-lg">{profile.fullName}</p>
                    <p className="text-purple-400 text-sm">{profile.targetJobRole || 'No role set'}</p>
                    <p className="text-gray-500 text-xs mt-1 capitalize">{profile.experienceLevel}</p>
                  </div>
                )}
              </div>

              {/* Resume Upload */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  📄 Resume
                </h3>
                <div
                  className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500 transition"
                  onClick={() => resumeInputRef.current.click()}
                >
                  {profile.resumeName ? (
                    <div>
                      <p className="text-green-400 text-sm">✅ Uploaded</p>
                      <p className="text-gray-400 text-xs mt-1 truncate">{profile.resumeName}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl mb-2">📤</p>
                      <p className="text-gray-400 text-sm">Click to upload your resume</p>
                      <p className="text-gray-600 text-xs mt-1">PDF only</p>
                    </div>
                  )}
                </div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeChange}
                />
                {profile.resumeName && (
                  <button
                    onClick={() => resumeInputRef.current.click()}
                    className="text-purple-400 text-xs mt-2 hover:text-purple-300 transition w-full text-center"
                  >
                    Change Resume
                  </button>
                )}
              </div>

              {/* AI Personalization */}
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-5">
                <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  🤖 AI Personalization
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  The more you fill out your profile, the more personalized your AI interview questions will be based on your skills and goals.
                </p>
                <div className="mt-3 space-y-1">
                  {[
                    { label: 'Target Role', done: !!profile.targetJobRole },
                    { label: 'Experience Level', done: !!profile.experienceLevel },
                    { label: 'Skills Added', done: profile.skills.length > 0 },
                    { label: 'Resume Uploaded', done: !!profile.resumeName },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span>{item.done ? '✅' : '⬜'}</span>
                      <span className={item.done ? 'text-green-400' : 'text-gray-500'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-5 text-lg">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Full Name *</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={e => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Target Job Role *</label>
                    <select
                      value={profile.targetJobRole}
                      onChange={e => setProfile(prev => ({ ...prev, targetJobRole: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                    >
                      <option value="">Select role...</option>
                      {jobRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Experience Level</label>
                    <select
                      value={profile.experienceLevel}
                      onChange={e => setProfile(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                    >
                      <option value="fresher">Fresher (0 years)</option>
                      <option value="junior">Junior (1-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Preferred Interview Language</label>
                    <select
                      value={profile.preferredLanguage}
                      onChange={e => setProfile(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="hinglish">Hinglish</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-gray-400 text-sm mb-2 block">Bio / About Me</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself — your background, goals, and interests..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition resize-none"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-2 text-lg">Skills *</h3>
                <p className="text-gray-500 text-xs mb-4">Type a skill and press Enter to add — AI will generate questions based on your skills</p>
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="e.g. React, Node.js, Python — press Enter to add"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition mb-4"
                />
                {profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span
                        key={skill}
                        className="bg-purple-900/40 border border-purple-700/50 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-purple-400 hover:text-red-400 transition text-xs font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No skills added yet — type above to add</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Interviews Done', value: stats.totalInterviews, icon: '🎯' },
                { label: 'Average Score', value: `${stats.averageScore}/10`, icon: '📊' },
                { label: 'Best Score', value: `${stats.bestScore}/10`, icon: '🏆' },
                { label: 'Keep Practicing!', value: '🔥', icon: '📅' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                  <p className="text-3xl mb-2">{stat.icon}</p>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">💪 Strong Areas</h3>
                {stats.strongAreas.length > 0 ? (
                  <div className="space-y-2">
                    {stats.strongAreas.map((area, i) => (
                      <div key={i} className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm capitalize">
                        ✅ {area} Interview
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">🎯</p>
                    <p className="text-gray-500 text-sm">Keep practicing — your strong areas will appear here</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">📈 Weak Areas (Needs Improvement)</h3>
                {stats.weakAreas.length > 0 ? (
                  <div className="space-y-2">
                    {stats.weakAreas.map((area, i) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-red-400 text-sm capitalize">⚠️ {area} Interview</span>
                        <Link to="/interview" className="text-xs text-purple-400 hover:text-purple-300 transition">
                          Practice →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">🌟</p>
                    <p className="text-gray-500 text-sm">No weak areas found — or not enough data yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Recent Interviews</h3>
                <Link to="/interview" className="text-purple-400 text-sm hover:text-purple-300 transition">
                  + New Interview
                </Link>
              </div>
              {recentInterviews.length > 0 ? (
                <div className="space-y-3">
                  {recentInterviews.map((interview, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-5 py-4 hover:bg-gray-800/80 transition">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {interview.interviewType === 'HR' ? '👔' :
                           interview.interviewType === 'Technical' ? '💻' : '🧠'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{interview.interviewType} Interview</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(interview.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${getScoreBg(interview.overallScore)}`}>
                        <span className={getScoreColor(interview.overallScore)}>
                          {interview.overallScore}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-gray-400 mb-2">No interviews completed yet</p>
                  <Link
                    to="/interview"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2 rounded-xl transition inline-block mt-2"
                  >
                    Start Your First Interview 🚀
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile