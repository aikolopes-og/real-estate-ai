import { apiConfig, httpMethods, errorMessages, defaultHeaders } from '@/config/api'
import { logger } from '../utils/logger'

// Custom error class for email already exists
export class EmailExistsError extends Error {
  constructor(message: string, public email: string) {
    super(message)
    this.name = 'EmailExistsError'
  }
}

function getBaseUrl() {
  return apiConfig.baseUrl()
}
export type Imovel = {
  id?: number | string
  _id?: string
  image?: string
  images?: string[]
  tipo?: string
  title?: string
  name?: string
  localidade?: string
  location?: string | Record<string, unknown>
  preco?: number
  price?: number
  pricePerNight?: number
  rating?: number
  // Additional fields from backend API
  city?: string
  address?: string
  [key: string]: any // Allow additional properties
}

function makeTimeoutSignal(timeout = apiConfig.timeouts.default, parent?: AbortSignal) {
  if (parent) return parent
  const c = new AbortController()
  const id = setTimeout(() => c.abort(), timeout)
  const s = c.signal
  // attach a helper to clear the timer when done
  ;(s as unknown as { _clear?: () => void })._clear = () => clearTimeout(id)
  return s
}
async function doFetch<T = unknown>(url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { ...init, signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}
export const apiClient = {
  _token: '' as string,
  setToken(t: string) {
    this._token = t || ''
  },
  async listImoveis(signal?: AbortSignal): Promise<Imovel[]> {
    const s = makeTimeoutSignal(apiConfig.timeouts.listings, signal)
    const url = `${getBaseUrl().replace(/\/$/, '')}${apiConfig.endpoints.properties.list}`
    try {
      const response = await doFetch<any>(url, { method: httpMethods.GET }, s)
      // Extract properties array from the API response structure
      if (response && response.success && response.data && Array.isArray(response.data.properties)) {
        return response.data.properties as Imovel[]
      }
      return []
    } finally {
      const sc = s as unknown as { _clear?: () => void }
      if (sc._clear) sc._clear()
    }
  },
  async healthCheck(signal?: AbortSignal): Promise<boolean> {
    const s = makeTimeoutSignal(apiConfig.timeouts.health, signal)
    const url = `${getBaseUrl().replace(/\/$/, '')}${apiConfig.endpoints.system.health}`
    try {
      await doFetch(url, { method: httpMethods.GET }, s)
      return true
    } catch {
      return false
    } finally {
      const sc = s as unknown as { _clear?: () => void }
      if (sc._clear) sc._clear()
    }
  }
  ,
  async login(email: string, password: string): Promise<{ access_token: string, token_type: string } > {
    const s = makeTimeoutSignal(apiConfig.timeouts.default, undefined)
    const url = `${getBaseUrl().replace(/\/$/, '')}${apiConfig.endpoints.auth.login}`
    try {
      const res = await fetch(url, {
        method: httpMethods.POST,
        headers: defaultHeaders,
        body: JSON.stringify({ email, password }),
        signal: s
      })
      if (!res.ok) throw new Error(errorMessages.loginFailed)
      const data = await res.json() as any
      // Backend returns { success, data: { user, tokens } }
      const access_token = data?.data?.tokens?.accessToken
      const token_type = access_token ? 'bearer' : ''
      return { access_token, token_type }
    } finally {
      const sc = s as unknown as { _clear?: () => void }
      if (sc._clear) sc._clear()
    }
  },
  async register(
    email: string, 
    password: string, 
    role = 'user', 
    firstName = '', 
    lastName = '', 
    phone?: string,
    creci?: string,
    yearsExperience?: number,
    brokerRole?: 'DIRECTOR' | 'AGENT'
  ): Promise<unknown> {
    const s = makeTimeoutSignal(apiConfig.timeouts.default, undefined)
    const url = `${getBaseUrl().replace(/\/$/, '')}${apiConfig.endpoints.auth.register}`
    
    const body: any = { email, password, role, firstName, lastName };
    if (phone) body.phone = phone;
    if (creci) body.creci = creci;
    if (yearsExperience !== undefined) body.yearsExperience = yearsExperience;
    if (brokerRole) body.brokerRole = brokerRole;
    
    logger.apiRequest('POST', url, { email, role, firstName, lastName })
    try {
      const res = await fetch(url, {
        method: httpMethods.POST,
        headers: defaultHeaders,
        body: JSON.stringify(body),
        signal: s
      })
      logger.apiResponse(res.status, url)
      if (!res.ok) {
        const text = await res.text()
        logger.apiError(new Error(text), url, { email, role, firstName, lastName })
        let parsed = text
        try { parsed = JSON.parse(text) } catch {}
        
        // Check if it's an email already exists error
        const errorMessage = typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
        if (errorMessage.includes('User with this email already exists') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('já existe')) {
          throw new EmailExistsError('Email já cadastrado', email)
        }
        
        throw new Error(errorMessage)
      }
      return res.json()
    } catch (error) {
      logger.apiError(error as Error, url, { email, role })
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(errorMessages.cors)
      }
      throw error
    } finally {
      const sc = s as unknown as { _clear?: () => void }
      if (sc._clear) sc._clear()
    }
  },
  async checkEmailExists(email: string): Promise<boolean> {
    const s = makeTimeoutSignal(apiConfig.timeouts.health)
    const url = `${getBaseUrl().replace(/\/$/, '')}${apiConfig.endpoints.users.exists}?email=${encodeURIComponent(email)}`
    try {
      const res = await doFetch<{ exists: boolean }>(url, { method: httpMethods.GET }, s)
      return !!res.exists
    } catch {
      return false
    } finally {
      const sc = s as unknown as { _clear?: () => void }
      if (sc._clear) sc._clear()
    }
  },
  async getMe(): Promise<Record<string, unknown>> {
    const s = makeTimeoutSignal(apiConfig.timeouts.default)
    const url = `${getBaseUrl().replace(/\/$/, '')}${apiConfig.endpoints.auth.me}`
    const headers: Record<string,string> = { 'Content-Type': 'application/json' }
    if ((this as unknown as { _token?: string })._token) headers['Authorization'] = `Bearer ${(this as unknown as { _token?: string })._token}`
    try {
      const res = await fetch(url, { method: httpMethods.GET, headers, signal: s })
      if (!res.ok) throw new Error(`getMe failed ${res.status}`)
      const data = await res.json() as any
      // unwrap { success, data: { user } }
      const user = data?.data?.user ?? data
      // Add name field from firstName and lastName if not present
      if (user && !user.name && (user.firstName || user.lastName)) {
        user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }
      return user as Record<string, unknown>
    } finally {
      const sc = s as unknown as { _clear?: () => void }
      if (sc._clear) sc._clear()
    }
  }
}
