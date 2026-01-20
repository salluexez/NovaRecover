import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import initPool, { initDb } from './db'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import casesRoutes from './routes/cases'
import assignmentsRoutes from './routes/assignments'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }))

app.use('/auth', authRoutes)
app.use('/', userRoutes)
app.use('/cases', casesRoutes)
app.use('/assignments', assignmentsRoutes)

initDb().then(() => {
  const port = process.env.PORT ?? 4000
  app.listen(port, () => console.log(`backend listening on port ${port}`))
})
