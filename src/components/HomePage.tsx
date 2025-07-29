import React from 'react'
import { useIsAuthenticated } from '@azure/msal-react'
import './HomePage.css'

const HomePage: React.FC = () => {
  const isAuthenticated = useIsAuthenticated()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="home-container">
      <main className="home-main">
        <h1>Welcome to Risk Assessment</h1>
        <p>This is the home page of the application.</p>
      </main>
    </div>
  )
}

export default HomePage 