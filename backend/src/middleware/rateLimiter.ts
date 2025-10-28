import { RateLimiterMemory } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'

// Different rate limits for different endpoints
const authLimiter = new RateLimiterMemory({
  points: 50, // 50 attempts (increased for development)
  duration: 15 * 60, // per 15 minutes
})

const generalLimiter = new RateLimiterMemory({
  points: 1000, // 1000 requests (increased for development)
  duration: 15 * 60, // per 15 minutes
})

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Apply stricter limits to auth endpoints
    if (req.path.includes('/auth/')) {
      await authLimiter.consume(req.ip || 'unknown')
    } else {
      await generalLimiter.consume(req.ip || 'unknown')
    }
    next()
  } catch (rateLimiterRes: any) {
    const remainingHits = rateLimiterRes?.remainingHits || 0
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': req.path.includes('/auth/') ? '5' : '100',
      'X-RateLimit-Remaining': remainingHits,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
    })
    
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: Math.round(msBeforeNext / 1000) || 1,
      timestamp: new Date().toISOString()
    })
  }
}