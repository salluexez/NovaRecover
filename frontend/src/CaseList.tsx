import { useEffect, useState } from 'react'

type Case = {
  id: number
  customer_id: string
  amount: number
  ageing_days: number
  status: string
  assigned_dca?: number | null
  priority: number
  created_at: string
}

export default function CaseList({ onOpen }: { onOpen: (id: number) => void }) {
  const [cases, setCases] = useState<Case[]>([])

  async function load() {
    const token = localStorage.getItem('accessToken')
    const res = await fetch('http://localhost:4000/cases', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setCases(data.cases || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h2>Cases</h2>
      <button onClick={load}>Reload</button>
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr><th>ID</th><th>Customer</th><th>Amount</th><th>Ageing</th><th>Status</th><th>Assigned</th></tr>
        </thead>
        <tbody>
          {cases.map(c => (
            <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(c.id)}>
              <td>{c.id}</td>
              <td>{c.customer_id}</td>
              <td>{c.amount}</td>
              <td>{c.ageing_days}</td>
              <td>{c.status}</td>
              <td>{c.assigned_dca ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
