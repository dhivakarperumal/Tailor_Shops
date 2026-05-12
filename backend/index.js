import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createDatabaseIfNeeded, getPool, dbConfig } from './src/config/db.js'
import authRouter from './src/routers/authRouter.js'
import categoryRouter from './src/routers/categoryRouter.js'
import orderRouter from './src/routers/orderRouter.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend', timestamp: new Date().toISOString() })
})

app.get('/api/config', (req, res) => {
  res.json({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(PORT),
    database: dbConfig.database,
    dbHost: dbConfig.host,
    dbPort: dbConfig.port
  })
})

app.use('/api/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/orders', orderRouter)

async function startServer() {
  try {
    await createDatabaseIfNeeded()
    const pool = await getPool()
    await pool.query('SELECT 1')

    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`)
      console.log(`Connected to database ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`)
    })
  } catch (error) {
    console.error('Unable to start backend, database connection failed:', error)
    process.exit(1)
  }
}

startServer()
