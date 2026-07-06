import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import ResumeInterview from './pages/ResumeInterview'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import CompanyInterview from './pages/CompanyInterview'
import Leaderboard from "./pages/Leaderboard";
import './App.css'

function App() {
  return (
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
      </Routes>
    </BrowserRouter>
  )
}

export default App