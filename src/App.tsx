import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar' 
import StudyList from './components/StudyList'
import Dashboard from './components/Dashboard'
import RiskEvaluation from './components/RiskEvaluation'
import AssessedStudies from './components/AssessedStudies'
import AssessmentAudit from './components/AssessmentAudit'
import AssessmentTimeline from './components/AssessmentTimeline';
import RiskTableScreen from './components/RiskTableScreen';
import useMsalUser from './hooks/useMsalUser'
import { useTokenStorage } from './hooks/useTokenStorage'
import { useIsAuthenticated } from '@azure/msal-react'
import LoginPage from './components/LoginPage'
import './App.css'

function App() {
  const isAuthenticated = useIsAuthenticated()
  const userInfo = useMsalUser()
  const { logout } = useTokenStorage()
  const userName = userInfo?.name || 'User'

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Router>
      <Navbar userName={userName} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study-list" element={<StudyList />} />
        <Route path="/risk-evaluation" element={<RiskEvaluation />} />
        <Route path="/risk-evaluation/:assessmentId" element={<RiskEvaluation />} />
        <Route path="/assessed-studies" element={<AssessedStudies />} />
        <Route path="/assessment-audit" element={<AssessmentAudit />} />
        <Route path="/assessment-timeline" element={<AssessmentTimeline />} />
        <Route path="/risk-table" element={<RiskTableScreen />} />
      </Routes>
    </Router>
  )
}

export default App 