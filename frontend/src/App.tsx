import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Login'
import CaseList from './CaseList'
import CaseView from './CaseView'

type User = { id: number; email: string; role: string }

function App() {
  const [count, setCount] = useState(0)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [viewCaseId, setViewCaseId] = useState<number | null>(null)

  async function handleLogin(token: string, u: User) {
    setAccessToken(token)
    setUser(u)
    localStorage.setItem('accessToken', token)
  }

  async function fetchMe() {
    const token = accessToken ?? localStorage.getItem('accessToken')
    if (!token) return
    const res = await fetch('http://localhost:4000/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      alert('failed to fetch /me')
      return
    }
    const data = await res.json()
    setUser(data.user)
  }

  async function doRefresh() {
    const res = await fetch('http://localhost:4000/auth/refresh', { method: 'POST', credentials: 'include' })
    const data = await res.json()
    if (res.ok) {
      setAccessToken(data.accessToken)
      localStorage.setItem('accessToken', data.accessToken)
    } else alert(data.message || 'refresh failed')
  }

  async function logout() {
    await fetch('http://localhost:4000/auth/logout', { method: 'POST', credentials: 'include' })
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem('accessToken')
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      {!accessToken && !user && <Login onLogin={handleLogin} />}

      {user && (
        <div className="card">
          <p>Signed in as <strong>{user.email}</strong> ({user.role})</p>
          <button onClick={fetchMe}>Refresh profile (/me)</button>
          <button onClick={doRefresh}>Refresh access token</button>
          <button onClick={logout}>Logout</button>

          {user.role === 'Admin' && <div style={{ marginTop: 12 }}>
            <h3>Admin panel</h3>
            <p>Only visible to Admins.</p>
          </div>}

          <div style={{ marginTop: 12 }}>
            <h3>Cases</h3>
            {!viewCaseId && <CaseList onOpen={(id) => setViewCaseId(id)} />}
            {viewCaseId && <CaseView id={viewCaseId} onClose={() => setViewCaseId(null)} />}
          </div>
        </div>
      )}

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
