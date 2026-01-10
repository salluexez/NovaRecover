import { useState } from 'react'

type User = { id: number; email: string; role: string }

export default function Login({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Auditor')
  const [registerMode, setRegisterMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: any) {
    e.preventDefault()
    setError(null)
    try {
      if (registerMode) {
        const r = await fetch('http://localhost:4000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        })
        const d = await r.json()
        if (!r.ok) return setError(d.message || 'register failed')
        return alert('registered! please login')
      }

      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message || 'Login failed')
      onLogin(data.accessToken, data.user)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <h2>Login</h2>
      <div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      </div>
      <div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      </div>
      {registerMode && (
        <div>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Admin</option>
            <option>DCA</option>
            <option>Auditor</option>
          </select>
        </div>
      )}
      <div>
        <button type="submit">Login</button>
        <button type="button" onClick={() => setRegisterMode((v) => !v)} style={{ marginLeft: 8 }}>
          {registerMode ? 'Cancel' : 'Register'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
