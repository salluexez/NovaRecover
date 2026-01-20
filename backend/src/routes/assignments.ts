import { Router, Request, Response } from 'express'
import pool from '../db'
import { authenticate, requireRole } from '../middleware/auth'

const router = Router()

// List assignments (optional filters)
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { case_id, dca_id, limit = 50, offset = 0 } = req.query as any
  const clauses: string[] = []
  const params: any[] = []
  let idx = 1
  if (case_id) { clauses.push(`case_id = $${idx++}`); params.push(Number(case_id)) }
  if (dca_id) { clauses.push(`dca_id = $${idx++}`); params.push(Number(dca_id)) }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const r = await pool.query(`SELECT * FROM assignments ${where} ORDER BY assigned_at DESC LIMIT $${idx++} OFFSET $${idx++}`, [...params, Number(limit), Number(offset)])
  res.json({ assignments: r.rows })
})

// Get assignment
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const r = await pool.query('SELECT * FROM assignments WHERE id=$1', [id])
  if (!r.rows[0]) return res.status(404).json({ message: 'not found' })
  res.json({ assignment: r.rows[0] })
})

// Reassign (Admin or DCA)
router.post('/:id/reassign', authenticate, requireRole('Admin', 'DCA'), async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { dca_id, note } = req.body
  if (!dca_id) return res.status(400).json({ message: 'dca_id required' })
  // lookup assignment
  const ar = await pool.query('SELECT case_id FROM assignments WHERE id=$1', [id])
  if (!ar.rows[0]) return res.status(404).json({ message: 'assignment not found' })
  const caseId = ar.rows[0].case_id
  await pool.query('UPDATE cases SET assigned_dca=$1 WHERE id=$2', [dca_id, caseId])
  const r = await pool.query('INSERT INTO assignments (case_id, dca_id, assigned_by, note) VALUES ($1,$2,$3,$4) RETURNING *', [caseId, dca_id, (req as any).user.id, note ?? null])
  res.json({ assignment: r.rows[0] })
})

export default router
