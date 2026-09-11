import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import summaryRoutes from './routes/summaryRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// Essential Security & Utility Middleware
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Root Route & Healthcheck
app.get('/', (req, res) => {
  res.json({
    project: 'AAROGYA — Healthcare AI Prototype API',
    status: 'online',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

// Mount REST API Routes
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/doctor', doctorRoutes)
app.use('/api/documents', documentRoutes)

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Centralized Error Handler
app.use(errorHandler)

export default app
