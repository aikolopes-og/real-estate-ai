import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import logger from './utils/logger'

// Import routes
import authRoutes from './routes/auth'
import propertyRoutes from './routes/properties'
import companyRoutes from './routes/companies'
import adminRoutes from './routes/admin'
import aiRoutes from './routes/ai'
import searchRoutes from './routes/search'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'

// Load environment variables
dotenv.config()

// Initialize Prisma client
export const prisma = new PrismaClient()

// Create Express app
const app = express()
const PORT = process.env.PORT || 8001

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:4100']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Rate limiting
app.use(rateLimiter)

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/search', searchRoutes)

// Brazilian route aliases for frontend compatibility
app.use('/imoveis', propertyRoutes)
app.use('/buscar', searchRoutes)
app.use('/corretores', companyRoutes)
app.use('/imobiliarias', companyRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app