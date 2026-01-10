import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { saveRefreshToken, revokeRefreshToken, isRefreshTokenValid } from './redis'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRY ?? '15m'
const REFRESH_EXPIRES_SECONDS = Number(process.env.REFRESH_TOKEN_EXPIRY_SECONDS ?? '604800') // 7 days

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export async function generateAndStoreRefreshToken(userId: number) {
  const tokenId = crypto.randomBytes(16).toString('hex')
  const token = jwt.sign({ tokenId, userId }, JWT_SECRET, { expiresIn: `${REFRESH_EXPIRES_SECONDS}s` })
  await saveRefreshToken(tokenId, userId, REFRESH_EXPIRES_SECONDS)
  return token
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (err) {
    return null
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (err) {
    return null
  }
}

export async function rotateRefreshToken(oldTokenId: string | null, userId: number) {
  if (oldTokenId) await revokeRefreshToken(oldTokenId)
  const newToken = await generateAndStoreRefreshToken(userId)
  return newToken
}

export async function isRefreshTokenPresent(tokenId: string) {
  return isRefreshTokenValid(tokenId)
}
