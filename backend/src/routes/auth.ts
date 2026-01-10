import { Router, Request, Response } from 'express'
import pool from '../db'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateAndStoreRefreshToken, verifyRefreshToken, rotateRefreshToken, isRefreshTokenPresent } from '../auth'
import { revokeRefreshToken } from '../redis'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, role } = req.body
  if (!email || !password) return res.status(400).json({ message: 'email and password required' })
  const hashed = await bcrypt.hash(password, 10)
  try {
    const r = await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id,email,role', [email, hashed, role ?? 'Auditor'])
    const user = r.rows[0]
    res.status(201).json({ user })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'email and password required' })
  const r = await pool.query('SELECT id, email, password_hash, role FROM users WHERE email=$1', [email])
  const user = r.rows[0]
  if (!user) return res.status(401).json({ message: 'invalid credentials' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'invalid credentials' })

  const accessToken = generateAccessToken({ userId: user.id, role: user.role })
  const refreshToken = await generateAndStoreRefreshToken(user.id)

  // set refresh token cookie (httpOnly)
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
  res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } })
})

router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ message: 'no refresh token' })
  const payload: any = verifyRefreshToken(token)
  if (!payload) return res.status(401).json({ message: 'invalid refresh token' })
  const { tokenId, userId } = payload
  const present = await isRefreshTokenPresent(tokenId)
  if (!present) return res.status(401).json({ message: 'refresh token revoked' })

  // rotate
  const newRefresh = await rotateRefreshToken(tokenId, userId)
  const r = await pool.query('SELECT role FROM users WHERE id=$1', [userId])
  const role = r.rows[0]?.role ?? 'Auditor'
  const accessToken = generateAccessToken({ userId, role })
  res.cookie('refreshToken', newRefresh, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
  res.json({ accessToken })
})

router.post('/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken
  if (token) {
    const payload: any = verifyRefreshToken(token)
    if (payload?.tokenId) await revokeRefreshToken(payload.tokenId)
  }
  res.clearCookie('refreshToken')
  res.json({ message: 'logged out' })
})

export default router
