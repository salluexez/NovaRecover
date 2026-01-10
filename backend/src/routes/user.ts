import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import pool from '../db'
import { requireRole } from '../middleware/auth'

const router = Router()

router.get('/me', authenticate, async (req: any, res: any) => {
  const userId = req.user.id
  const r = await pool.query('SELECT id,email,role,created_at FROM users WHERE id=$1', [userId])
  const user = r.rows[0]
  res.json({ user })
})

router.get('/admin', authenticate, requireRole('Admin'), async (_req: any, res: any) => {
  res.json({ message: 'admin-only data' })
})

export default router
