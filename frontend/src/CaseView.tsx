import { useEffect, useState } from 'react'

export default function CaseView({ id, onClose }: { id: number; onClose: () => void }) {
  const [c, setC] = useState<any>(null)
  const [assign, setAssign] = useState<string>('')

  async function load() {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`http://localhost:4000/cases/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!res.ok) return alert(data.message || 'error')
    setC(data.case)
  }

  useEffect(() => { load() }, [id])

  async function update(updateBody: any) {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`http://localhost:4000/cases/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(updateBody) })
    const data = await res.json()
    if (!res.ok) return alert(data.message || 'update failed')
    setC(data.case)
  }

  async function closeCase() {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`http://localhost:4000/cases/${id}/close`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!res.ok) return alert(data.message || 'close failed')
    setC(data.case)
  }

  async function doAssign() {
    if (!assign) return alert('enter dca id')
    await update({ assigned_dca: Number(assign) })
    setAssign('')
  }

  if (!c) return <div>Loading...</div>

  return (
    <div>
      <h2>Case {c.id}</h2>
      <div>Customer: {c.customer_id}</div>
      <div>Amount: {c.amount}</div>
      <div>Ageing: {c.ageing_days}</div>
      <div>Status: {c.status}</div>
      <div>Assigned DCA: {c.assigned_dca ?? '-'}</div>
      <div>Priority: {c.priority}</div>
      <div style={{ marginTop: 10 }}>
        <input placeholder="DCA id" value={assign} onChange={(e) => setAssign(e.target.value)} />
        <button onClick={doAssign} style={{ marginLeft: 8 }}>Assign</button>
        <button onClick={closeCase} style={{ marginLeft: 8 }}>Close Case</button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>Back</button>
      </div>
    </div>
  )
}
