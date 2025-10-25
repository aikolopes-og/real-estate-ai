import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { AuthService, JWTPayload } from '../services/auth'
import { prisma } from '../server'

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    try {
      const payload = AuthService.verifyAccessToken(token)
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        })
      }

      req.user = payload
      next()
    } catch (_error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }

    next()
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    try {
      const payload = AuthService.verifyAccessToken(token)
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })
      
      if (user) {
        req.user = payload
      }
    } catch (_error) {
      // Continue without authentication for optional auth
    }
  }
  
  next()
}