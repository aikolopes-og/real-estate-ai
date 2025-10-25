import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User, UserRole, BrokerRole } from '@prisma/client'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  brokerRole?: BrokerRole | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
    } as jwt.SignOptions)
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    } as jwt.SignOptions)
  }

  static generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      brokerRole: user.brokerRole
    }

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    }
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  static getRefreshTokenExpiry(): Date {
    const expiresIn = this.REFRESH_TOKEN_EXPIRES_IN
    const now = new Date()
    
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1))
      now.setDate(now.getDate() + days)
    } else if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1))
      now.setHours(now.getHours() + hours)
    } else if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn.slice(0, -1))
      now.setMinutes(now.getMinutes() + minutes)
    }
    
    return now
  }
}