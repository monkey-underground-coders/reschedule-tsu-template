import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/Application'
import LoginPage from './components/LoginPage'
import 'bootstrap/dist/css/bootstrap.min.css'

const root = document.getElementById('root')

const InitialComponent = () => {
  const token = localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')) : null
  const username = localStorage.getItem('username') ? JSON.parse(localStorage.getItem('username')) : null

  if (token) {
    return <App token={token} username={username} />
  }
  return <LoginPage />
}

ReactDOM.render(<InitialComponent />, root)
