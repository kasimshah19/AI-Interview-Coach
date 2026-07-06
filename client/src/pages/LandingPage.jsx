import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: '🤖', title: 'AI-Powered Questions', description: 'Advanced AI generates unique interview questions tailored to your field and experience level.' },
    { icon: '🎤', title: 'Voice Interview Mode', description: 'Practice speaking your answers aloud with voice recognition - just like a real interview.' },
    { icon: '📄', title: 'Resume Based Interview', description: 'Upload your resume and AI generates personalized questions based on your actual experience.' },
    { icon: '📊', title: 'Instant AI Feedback', description: 'Get detailed feedback with scores, strengths, and improvement areas after every answer.' },
    { icon: '📈', title: 'Progress Analytics', description: 'Track your improvement over time with beautiful charts and performance analytics.' },
    { icon: '📝', title: 'PDF Reports', description: 'Download comprehensive PDF reports of your interview performance to review anytime.' }
  ]

  const steps = [
    { number: '01', icon: '✍️', title: 'Create Free Account', description: 'Sign up in seconds. No credit card required. Instant access to all features.' },
    { number: '02', icon: '🎯', title: 'Choose Interview Type', description: 'Select HR, Technical, Behavioral, or upload your resume for personalized questions.' },
    { number: '03', icon: '💬', title: 'Practice & Get Feedback', description: 'Answer by typing or speaking. Get instant AI scores and detailed feedback.' },
    { number: '04', icon: '🏆', title: 'Track & Improve', description: 'Monitor progress with charts, download PDF reports, and ace your real interview.' }
  ]

  const whyUs = [
    { icon: '⚡', title: 'Lightning Fast', description: 'Get AI feedback in seconds, not hours. Practice more, wait less.' },
    { icon: '🎯', title: '100% Personalized', description: 'Every question is tailored to your profile, resume, and target role.' },
    { icon: '🔒', title: 'Safe & Private', description: 'Your data is secure. Practice confidently without any privacy concerns.' },
    { icon: '💰', title: 'Completely Free', description: 'All features available at zero cost. No hidden charges, ever.' }
  ]

  const testimonials = [
    { name: 'Rahul Sharma', role: 'Software Engineer at TCS', avatar: 'RS', rating: 5, text: 'AI Interview Coach helped me crack my TCS interview! The AI feedback was incredibly detailed and helped me improve my communication skills significantly.' },
    { name: 'Priya Patel', role: 'HR Manager at Infosys', avatar: 'PP', rating: 5, text: 'I used this to prepare for my HR role interview. The behavioral questions were spot-on and the voice feature made it feel like a real interview!' },
    { name: 'Arjun Mehta', role: 'Full Stack Developer', avatar: 'AM', rating: 5, text: 'The resume-based interview feature is genius! It read my resume and asked exactly the right technical questions. Got my dream job!' },
    { name: 'Sneha Gupta', role: 'Data Analyst at Wipro', avatar: 'SG', rating: 5, text: 'As a fresher, I was nervous about interviews. This platform built my confidence with realistic practice sessions and detailed PDF reports.' }
  ]

  const faqs = [
    { question: 'Is AI Interview Coach completely free?', answer: 'Yes! AI Interview Coach is 100% free to use. All features including AI feedback, voice mode, resume upload, PDF reports, and progress tracking are available at no cost.' },
    { question: 'What types of interviews can I practice?', answer: 'You can practice HR interviews, Technical interviews, Behavioral interviews, and Resume-based interviews where AI generates questions based on your actual resume.' },
    { question: 'How does the AI feedback work?', answer: 'After you submit each answer, our AI analyzes your response and provides a score out of 10, detailed feedback on what you did well, and specific areas where you can improve.' },
    { question: 'Can I practice using my voice?', answer: 'Yes! Our voice interview mode uses your browser\'s built-in speech recognition. You can also hear questions spoken aloud using our text-to-speech feature.' },
    { question: 'How does the resume-based interview work?', answer: 'Simply upload your PDF resume and our AI will read it, understand your experience and skills, then generate 5 personalized interview questions specifically tailored to your background.' },
    { question: 'Can I download my interview results?', answer: 'Yes! After completing any interview, you can download a comprehensive PDF report containing all questions, your answers, AI feedback, and scores for each question.' }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-purple-400">AI Interview Coach</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition text-sm">How it Works</a>
            <a href="#why-us" className="text-gray-400 hover:text-white transition text-sm">Why Us</a>
            <a href="#testimonials" className="text-gray-400 hover:text-white transition text-sm">Reviews</a>
            <a href="#faq" className="text-gray-400 hover:text-white transition text-sm">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-gray-400 hover:text-white transition text-sm font-medium px-4 py-2">Login</Link>
            <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">Get Started Free</Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-400 hover:text-white">
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 space-y-4">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white transition text-sm">Features</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white transition text-sm">How it Works</a>
            <a href="#why-us" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white transition text-sm">Why Us</a>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white transition text-sm">Reviews</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 hover:text-white transition text-sm">FAQ</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center border border-gray-700 text-gray-400 px-4 py-2 rounded-lg text-sm">Login</Link>
              <Link to="/signup" className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700/50 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-purple-300 text-sm font-medium">AI-Powered Interview Preparation Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ace Your Next
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"> Interview</span>
            <br />with AI Coaching
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Practice with AI-generated questions, get instant detailed feedback,
            track your progress with analytics, and land your dream job with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl transition text-lg shadow-lg shadow-purple-600/25">
              🚀 Start Practicing Free
            </Link>
            <a href="#how-it-works" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg border border-gray-700 flex items-center justify-center gap-2">
              ▶ Watch How It Works
            </a>
          </div>

          <p className="text-gray-500 text-sm mb-16">
            ✅ No credit card required &nbsp;•&nbsp; ✅ 100% Free &nbsp;•&nbsp; ✅ Instant Access
          </p>

          {/* Hero Illustration */}
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-500 text-sm ml-2">AI Interview Coach</span>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <p className="text-purple-400 text-sm font-medium mb-1">🤖 AI Interviewer</p>
                  <p className="text-white">Can you tell me about yourself and your key strengths?</p>
                </div>
                <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-800/50 ml-8">
                  <p className="text-green-400 text-sm font-medium mb-1">👤 You</p>
                  <p className="text-gray-300">I am a passionate developer with 2 years of experience...</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <p className="text-yellow-400 text-sm font-medium mb-1">📊 AI Feedback</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-purple-400">8/10</span>
                    <p className="text-gray-400 text-sm">Great introduction! Add more specific achievements to stand out.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '4+', label: 'Interview Types' },
            { number: 'AI', label: 'Powered Feedback' },
            { number: '100%', label: 'Free to Use' },
            { number: '24/7', label: 'Available' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold text-purple-400 mb-2">{stat.number}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 font-medium mb-3">FEATURES</p>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to <span className="text-purple-400">Succeed</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Our AI-powered platform provides all the tools you need to prepare for any interview.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 font-medium mb-3">HOW IT WORKS</p>
            <h2 className="text-4xl font-bold mb-4">Get Started in <span className="text-purple-400">4 Simple Steps</span></h2>
            <p className="text-gray-400 text-lg">From signup to interview-ready in minutes.</p>
          </div>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6 items-start bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition">
                <div className="text-5xl font-bold text-purple-600/20 min-w-fit">{s.number}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                  </div>
                  <p className="text-gray-400">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why-us" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 font-medium mb-3">WHY CHOOSE US</p>
            <h2 className="text-4xl font-bold mb-4">Why Students <span className="text-purple-400">Love Us</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">We built this platform keeping students and freshers in mind.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((w, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500/50 transition group">
                <div className="text-4xl mb-4">{w.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition">{w.title}</h3>
                <p className="text-gray-400 text-sm">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 font-medium mb-3">TESTIMONIALS</p>
            <h2 className="text-4xl font-bold mb-4">What Students <span className="text-purple-400">Say About Us</span></h2>
            <p className="text-gray-400 text-lg">Real stories from real students who landed their dream jobs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 font-medium mb-3">FAQ</p>
            <h2 className="text-4xl font-bold mb-4">Frequently Asked <span className="text-purple-400">Questions</span></h2>
            <p className="text-gray-400 text-lg">Everything you need to know about AI Interview Coach.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-800/50 transition"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <span className="text-purple-400 text-xl flex-shrink-0">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-purple-900/30 via-gray-900 to-blue-900/30 border-y border-purple-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Land Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"> Dream Job?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Start practicing today and walk into your next interview with confidence.
          </p>
          <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-xl transition text-lg inline-block shadow-lg shadow-purple-600/25">
            🚀 Start For Free Today
          </Link>
          <p className="text-gray-500 text-sm mt-4">No signup fees • No hidden costs • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold text-purple-400">AI Interview Coach</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Your AI-powered interview preparation platform. Practice, improve, and land your dream job with confidence.
              </p>
              <p className="text-gray-500 text-xs"> Made with ❤️ by Kasim Shah </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-gray-400 hover:text-white transition text-sm">Login</Link>
                <Link to="/signup" className="block text-gray-400 hover:text-white transition text-sm">Sign Up Free</Link>
                <a href="#features" className="block text-gray-400 hover:text-white transition text-sm">Features</a>
                <a href="#how-it-works" className="block text-gray-400 hover:text-white transition text-sm">How it Works</a>
                <a href="#faq" className="block text-gray-400 hover:text-white transition text-sm">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Interview Types</h4>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">👔 HR Interview</p>
                <p className="text-gray-400 text-sm">💻 Technical Interview</p>
                <p className="text-gray-400 text-sm">🧠 Behavioral Interview</p>
                <p className="text-gray-400 text-sm">📄 Resume Based</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 AI Interview Coach. All rights reserved.</p>
            <p className="text-gray-500 text-sm">Built with MERN Stack + Groq AI 🚀</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage