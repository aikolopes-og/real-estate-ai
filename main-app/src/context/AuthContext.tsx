"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { logger } from '../utils/logger'

type User = {
  id?: number | string
  email?: string
  name?: string
  role?: 'USER' | 'BROKER' | 'ADMIN'
  brokerRole?: 'DIRECTOR' | 'AGENT' | null
}

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // initialize from localStorage
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (t) {
      setToken(t)
      apiClient.setToken(t)
      // fetch current user
      apiClient.getMe().then((u) => {
        // map common fields (narrow unknown)
        const obj = u as Record<string, unknown>
        const mapped = { 
          id: (obj.id ?? obj._id) as (number|string) | undefined, 
          email: obj.email as string | undefined, 
          name: obj.name as string | undefined, 
          role: obj.role as 'USER' | 'BROKER' | 'ADMIN' | undefined,
          brokerRole: obj.brokerRole as 'DIRECTOR' | 'AGENT' | null | undefined
        }
        setUser(mapped)
      }).catch(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
      }).finally(()=> setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  type TokenResponse = { access_token?: string, token_type?: string }

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      console.log('AuthContext.login called with:', email)
      const resp = await apiClient.login(email, password) as TokenResponse
      console.log('Login response:', resp)
      if (resp && resp.access_token) {
        const t = resp.access_token as string
        localStorage.setItem('token', t)
        apiClient.setToken(t)
        setToken(t)
        try {
          console.log('Fetching user info...')
          const u = await apiClient.getMe()
          console.log('User info:', u)
          const obj = u as Record<string, unknown>
          const mapped = { 
            id: (obj.id ?? obj._id) as (number|string) | undefined, 
            email: obj.email as string | undefined, 
            name: obj.name as string | undefined, 
            role: obj.role as 'USER' | 'BROKER' | 'ADMIN' | undefined,
            brokerRole: obj.brokerRole as 'DIRECTOR' | 'AGENT' | null | undefined
          }
          setUser(mapped)
        } catch (err) {
          logger.error('Failed to get user info', { error: err })
          console.error('Failed to get user info:', err)
        }
        // Do not auto-redirect here; let the caller decide where to navigate after login
        return
      }
      throw new Error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    apiClient.setToken('')
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  async function register(email: string, password: string, displayName: string): Promise<boolean> {
    setLoading(true)
    try {
      const name = (displayName || '').trim()
      const [firstName, ...rest] = name.split(/\s+/)
      const lastName = rest.join(' ') || 'User'
      await apiClient.register(email, password, 'USER', firstName || 'User', lastName)
      return true
    } catch (err) {
      logger.error('Registration failed', { error: err })
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
