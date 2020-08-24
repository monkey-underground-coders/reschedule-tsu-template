import React, { useCallback, useState } from 'react'
import { baseUrl, generatebase64 } from '../../utils'

export default () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fetching, setFetching] = useState(false)

  const cleanupPayload = useCallback(() => {
    setUsername(username.trim())
    setPassword(password.trim())
  }, [username, password, setUsername, setPassword])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()

      cleanupPayload()
      if (username && password && !fetching) {
        setFetching(true)
        const token = generatebase64([username, password].join(':'))
        const headers = {
          Authorization: `Basic ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        }
        fetch(`${baseUrl}/user/cookies`, { headers }).then((res) => {
          if (res.ok) {
            localStorage.setItem('token', JSON.stringify(token))
            localStorage.setItem('username', JSON.stringify(username))
            window.location.replace(window.location.href)
          } else {
            alert('invalid data')
          }
          setFetching(false)
        })
      }
    },
    [username, password, fetching, cleanupPayload]
  )

  return (
    <div className="form container my-5">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" type="submit">
            Auth
          </button>
        </div>
      </form>
    </div>
  )
}
