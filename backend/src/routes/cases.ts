import { Router, Request, Response } from 'express'
import pool from '../db'
import { authenticate, requireRole } from '../middleware/auth'

const router = Router()

// Create a case
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { customer_id, amount, ageing_days, assigned_dca, priority } = req.body
  if (!customer_id) return res.status(400).json({ message: 'customer_id required' })
  const r = await pool.query(
    'INSERT INTO cases (customer_id, amount, ageing_days, assigned_dca, priority) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [customer_id, amount ?? 0, ageing_days ?? 0, assigned_dca ?? null, priority ?? 3],
  )
  const created = r.rows[0]
  // if assigned_dca provided, create assignment record
  if (assigned_dca) {
    await pool.query('INSERT INTO assignments (case_id, dca_id, assigned_by) VALUES ($1,$2,$3)', [created.id, assigned_dca, (req as any).user.id])
  }
  res.status(201).json({ case: created })
})

// List cases (simple)
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { status, assigned_dca, limit = 50, offset = 0 } = req.query as any
  const clauses: string[] = []
  const params: any[] = []
  let idx = 1
  if (status) { clauses.push(`status = $${idx++}`); params.push(status) }
  if (assigned_dca) { clauses.push(`assigned_dca = $${idx++}`); params.push(Number(assigned_dca)) }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const r = await pool.query(`SELECT * FROM cases ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`, [...params, Number(limit), Number(offset)])
  res.json({ cases: r.rows })
})

// Get case by id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const r = await pool.query('SELECT * FROM cases WHERE id=$1', [id])
  const c = r.rows[0]
  if (!c) return res.status(404).json({ message: 'not found' })
  const a = await pool.query('SELECT * FROM assignments WHERE case_id=$1 ORDER BY assigned_at DESC', [id])
  res.json({ case: c, assignments: a.rows })
})

// Update case
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { customer_id, amount, ageing_days, assigned_dca, priority, status } = req.body
  // allow partial update
  const updates: string[] = []
  const params: any[] = []
  let idx = 1
  if (customer_id !== undefined) { updates.push(`customer_id=$${idx++}`); params.push(customer_id) }
  if (amount !== undefined) { updates.push(`amount=$${idx++}`); params.push(amount) }
  if (ageing_days !== undefined) { updates.push(`ageing_days=$${idx++}`); params.push(ageing_days) }
  if (priority !== undefined) { updates.push(`priority=$${idx++}`); params.push(priority) }
  if (status !== undefined) { updates.push(`status=$${idx++}`); params.push(status) }
  if (assigned_dca !== undefined) { updates.push(`assigned_dca=$${idx++}`); params.push(assigned_dca) }
  if (!updates.length) return res.status(400).json({ message: 'no fields to update' })
  params.push(id)
  const q = `UPDATE cases SET ${updates.join(', ')} WHERE id=$${idx} RETURNING *`
  const r = await pool.query(q, params)
  const updated = r.rows[0]
  // create assignment record if assigned_dca changed
  if (assigned_dca !== undefined) {
    await pool.query('INSERT INTO assignments (case_id, dca_id, assigned_by) VALUES ($1,$2,$3)', [id, assigned_dca, (req as any).user.id])
  }
  res.json({ case: updated })
})

// Close case
router.patch('/:id/close', authenticate, requireRole('Admin', 'DCA'), async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const r = await pool.query(`UPDATE cases SET status='closed' WHERE id=$1 RETURNING *`, [id])
  if (!r.rows[0]) return res.status(404).json({ message: 'not found' })
  res.json({ case: r.rows[0] })
})

export default router
