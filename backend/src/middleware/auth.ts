import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../auth'

export interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string }
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' })
  const token = authHeader.split(' ')[1]
  const payload = verifyAccessToken(token)
  if (!payload) return res.status(401).json({ message: 'Invalid token' })
  req.user = { id: payload.userId, role: payload.role }
  next()
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
    next()
  }
}
