import { Router, Request, Response } from 'express'
import { prisma } from '../server'
import { AuthService } from '../services/auth'
import { authenticate, optionalAuth } from '../middleware/auth'
import logger from '../utils/logger'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
  RegisterInput,
  LoginInput
} from '../schemas/auth'

const router = Router()

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      })
    }
    
    // Hash password
    const hashedPassword = await AuthService.hashPassword(validatedData.password)
    
    // Determine role - convert string to enum
    let userRole: 'USER' | 'BROKER' | 'ADMIN' = 'USER'
    let brokerRole: 'DIRECTOR' | 'AGENT' | null = null
    
    if (validatedData.role) {
      const roleUpper = validatedData.role.toUpperCase()
      if (roleUpper === 'BROKER' || roleUpper === 'CORRETOR') {
        userRole = 'BROKER'
        // Define brokerRole baseado no campo brokerRole ou usa AGENT como padrão
        brokerRole = validatedData.brokerRole === 'DIRECTOR' ? 'DIRECTOR' : 'AGENT'
      } else if (roleUpper === 'ADMIN') {
        userRole = 'ADMIN'
      }
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName || '',
        lastName: validatedData.lastName || '',
        phone: validatedData.phone || null,
        role: userRole,
        brokerRole: brokerRole,
        // Campos específicos para corretores
        creci: validatedData.creci || null,
        yearsExperience: validatedData.yearsExperience || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        creci: true,
        yearsExperience: true,
        isVerified: true,
        createdAt: true
      }
    })
    
    // Generate tokens
    const tokens = AuthService.generateTokens(user as any)
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: AuthService.getRefreshTokenExpiry()
      }
    })
    
    logger.info('User registered successfully', { userId: user.id, email: user.email, role: user.role })
    
    res.status(201).json({
      success: true,
      data: {
        user,
        tokens
      }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    logger.error('Registration failed', { error: error.message, stack: error.stack })
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (!user) {
      logger.warn('Login failed - user not found', { email: validatedData.email })
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    // Validate password
    const isValidPassword = await AuthService.validatePassword(
      validatedData.password,
      user.password
    )
    
    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { email: validatedData.email })
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    // Generate tokens
    const tokens = AuthService.generateTokens(user)
    
    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: AuthService.getRefreshTokenExpiry()
      }
    })
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    
    logger.info('User logged in successfully', { userId: user.id, email: user.email })
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens
      }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    logger.error('Login failed', { error: error.message, stack: error.stack })
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    })
  }
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body)
    
    // Verify refresh token
    const payload = AuthService.verifyRefreshToken(refreshToken)
    
    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      })
    }
    
    // Generate new tokens
    const tokens = AuthService.generateTokens(storedToken.user)
    
    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    })
    
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.user.id,
        expiresAt: AuthService.getRefreshTokenExpiry()
      }
    })
    
    res.json({
      success: true,
      data: { tokens }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    logger.error('Token refresh failed', { error: error.message })
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    })
  }
})

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    
    if (refreshToken) {
      // Delete specific refresh token
      await prisma.refreshToken.deleteMany({
        where: { 
          token: refreshToken,
          userId: req.user!.userId 
        }
      })
    } else {
      // Delete all refresh tokens for user (logout from all devices)
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user!.userId }
      })
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error: any) {
    logger.error('Logout failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    })
  }
})

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: { user }
    })
  } catch (error: any) {
    logger.error('Get user failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    })
  }
})

// Update profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body)
    
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    res.json({
      success: true,
      data: { user }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    logger.error('Update profile failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    })
  }
})

// Change password
router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body)
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Verify current password
    const isValidPassword = await AuthService.validatePassword(
      validatedData.currentPassword,
      user.password
    )
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }
    
    // Hash new password
    const hashedPassword = await AuthService.hashPassword(validatedData.newPassword)
    
    // Update password
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { password: hashedPassword }
    })
    
    // Logout from all devices (delete all refresh tokens)
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.userId }
    })
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    logger.error('Change password failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    })
  }
})

export default router