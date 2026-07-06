const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Interview = require('../models/Interview.model');
const User = require('../models/User.model');

// Get leaderboard data
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { filter = 'all', sort = 'avgScore', search = '' } = req.query;

    // Date filter
    let dateFilter = {}
    const now = new Date()
    if (filter === 'week') {
      dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } }
    } else if (filter === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } }
    }

    // Aggregate interview stats per user
    const stats = await Interview.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: '$userId',
          avgScore: { $avg: '$overallScore' },
          bestScore: { $max: '$overallScore' },
          totalInterviews: { $sum: 1 },
          lastInterview: { $max: '$createdAt' }
        }
      }
    ])

    if (stats.length === 0) {
      return res.json({ leaderboard: [], totalParticipants: 0, highestScore: 0, averageScore: 0 })
    }

    // Get user details
    const userIds = stats.map(s => s._id)
    const users = await User.find({ _id: { $in: userIds } }).select('name fullName targetJobRole skills photoUrl')

    // Merge stats with user data
    let leaderboard = stats.map(stat => {
      const user = users.find(u => u._id.toString() === stat._id.toString())
      return {
        userId: stat._id,
        name: user?.fullName || user?.name || 'Anonymous',
        targetJobRole: user?.targetJobRole || 'Not specified',
        skills: user?.skills || [],
        photoUrl: user?.photoUrl || null,
        avgScore: Math.round(stat.avgScore * 10) / 10,
        bestScore: stat.bestScore,
        totalInterviews: stat.totalInterviews,
        lastInterview: stat.lastInterview,
      }
    })

    // Search filter
    if (search) {
      leaderboard = leaderboard.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort
    if (sort === 'avgScore') {
      leaderboard.sort((a, b) => b.avgScore - a.avgScore || b.totalInterviews - a.totalInterviews)
    } else if (sort === 'bestScore') {
      leaderboard.sort((a, b) => b.bestScore - a.bestScore)
    } else if (sort === 'totalInterviews') {
      leaderboard.sort((a, b) => b.totalInterviews - a.totalInterviews)
    } else if (sort === 'lowestScore') {
      leaderboard.sort((a, b) => a.avgScore - b.avgScore)
    }

    // Add rank and badge
    leaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: getBadge(user, index),
      streak: Math.floor(Math.random() * 7) + 1 // Placeholder
    }))

    // Overall stats
    const allScores = leaderboard.map(u => u.avgScore)
    const highestScore = Math.max(...allScores)
    const averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length * 10) / 10

    // My rank
    const myRank = leaderboard.find(u => u.userId.toString() === req.userId.toString())?.rank || null

    res.json({
      leaderboard,
      totalParticipants: leaderboard.length,
      highestScore,
      averageScore,
      myRank
    })

  } catch (error) {
    console.log('LEADERBOARD ERROR:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

function getBadge(user, index) {
  if (index === 0) return { label: 'Interview Master', icon: '👑', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' }
  if (index === 1) return { label: 'Top Performer', icon: '🏆', color: 'text-gray-300 bg-gray-300/10 border-gray-300/30' }
  if (index === 2) return { label: 'Rising Star', icon: '⭐', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' }
  if (user.totalInterviews >= 10) return { label: 'Consistent Performer', icon: '🎯', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' }
  if (user.avgScore >= 8) return { label: 'Fast Learner', icon: '🚀', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' }
  return { label: 'Participant', icon: '🌟', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' }
}

module.exports = router;