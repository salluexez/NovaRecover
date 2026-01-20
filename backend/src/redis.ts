import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export default redis

export async function saveRefreshToken(tokenId: string, userId: number, ttlSeconds: number) {
  await redis.set(`refresh:${tokenId}`, String(userId), 'EX', ttlSeconds)
}

export async function revokeRefreshToken(tokenId: string) {
  await redis.del(`refresh:${tokenId}`)
}

export async function isRefreshTokenValid(tokenId: string) {
  const v = await redis.get(`refresh:${tokenId}`)
  return v !== null
}
