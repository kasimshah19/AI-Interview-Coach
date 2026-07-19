import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import ResumeInterview from './pages/ResumeInterview'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import CompanyInterview from './pages/CompanyInterview'
import Leaderboard from './pages/Leaderboard'
import Schedule from './pages/Schedule'
import './App.css'

// Theme Context — poore app mein use kar sakte hain
export const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true // default dark
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : 'light'}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/resume-interview" element={<ResumeInterview />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/company-interview" element={<CompanyInterview />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  )
}

export default App