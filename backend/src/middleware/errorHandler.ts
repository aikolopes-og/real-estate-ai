import { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/errors'
import logger from '../utils/logger'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal server error'

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any
    if (prismaError.code === 'P2002') {
      statusCode = 409
      message = 'Resource already exists'
    } else if (prismaError.code === 'P2025') {
      statusCode = 404
      message = 'Resource not found'
    }
  }

  // Handle validation errors
  if (error.name === 'ZodError') {
    statusCode = 400
    message = 'Validation failed'
  }

  // Log error
  logger.error('Request error', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode
  })

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}