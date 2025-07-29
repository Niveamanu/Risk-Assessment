import React from 'react'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../authConfig'
import './LoginPage.css'
import logo from '../assets/Flourish_Logo.png'

const LoginPage: React.FC = () => {
  const { instance } = useMsal()

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error(e)
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Flourish Logo" className="flourish-logo" />
        <div className="login-header">
          <h1>Welcome to Risk Assessment</h1>
          <p>Please sign in to continue</p>
        </div>
        
        <div className="login-content">
          <button 
            className="login-button"
            onClick={handleLogin}
          >
            <svg className="microsoft-icon" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
              <path fill="#f3f3f3" d="M0 0h11v11H0z"/>
              <path fill="#f3f3f3" d="M12 0h11v11H12z"/>
              <path fill="#f3f3f3" d="M0 12h11v11H0z"/>
              <path fill="#f3f3f3" d="M12 12h11v11H12z"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 