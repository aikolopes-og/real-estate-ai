// API Configuration
// Central source of truth for all API endpoints and settings

// Environment-based configuration
export const env = {
  API_BASE_URL: process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001',
  ML_API_URL: process.env.ML_API_URL || process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:4102',
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'
}

// API endpoints configuration
export const apiConfig = {
  // Base URLs
  baseUrl: () => {
    // Use backend API directly for stability
    return env.API_BASE_URL
  },
  
  mlApiUrl: env.ML_API_URL,
  
  // Timeout settings
  timeouts: {
    default: 8000,
    upload: 30000,
    download: 30000,
    health: 5000,
    listings: 10000
  },

  // Retry settings
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  },

  // Endpoints
  endpoints: {
    // Authentication
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me'
    },
    
    // Properties/Imoveis
    properties: {
      list: '/imoveis',
      detail: (id: string | number) => `/imoveis/${id}`,
      search: '/imoveis/search',
      favorites: '/imoveis/favorites'
    },
    
    // Users
    users: {
      profile: '/api/users/profile',
      exists: '/api/users/exists',
      update: '/api/users/update'
    },
    
    // ML/AI
    ml: {
      recommend: '/recommend',
      analyze: '/analyze',
      predict: '/predict'
    },
    
    // System
    system: {
      health: '/health',
      status: '/status'
    }
  }
}

// HTTP methods
export const httpMethods = {
  GET: 'GET',
  POST: 'POST', 
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const

// Response status codes
export const statusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// Content types
export const contentTypes = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain'
} as const

// Request headers configuration
export const defaultHeaders = {
  'Content-Type': contentTypes.JSON,
  'Accept': contentTypes.JSON
}

// Error messages
export const errorMessages = {
  network: 'Erro de conexão. Verifique sua internet.',
  timeout: 'Timeout da requisição. Tente novamente.',
  unauthorized: 'Acesso não autorizado. Faça login novamente.',
  forbidden: 'Acesso negado.',
  notFound: 'Recurso não encontrado.',
  serverError: 'Erro interno do servidor. Tente novamente mais tarde.',
  unknown: 'Erro desconhecido. Tente novamente.',
  validation: 'Dados inválidos. Verifique os campos.',
  cors: 'Erro de CORS. Verifique se o servidor permite requisições.',
  emailExists: 'Este email já está cadastrado.',
  loginFailed: 'Email ou senha incorretos.'
}

// Cache configuration
export const cacheConfig = {
  ttl: {
    short: 5 * 60 * 1000,      // 5 minutes
    medium: 30 * 60 * 1000,    // 30 minutes
    long: 24 * 60 * 60 * 1000  // 24 hours
  },
  keys: {
    properties: 'properties',
    user: 'user',
    recommendations: 'recommendations'
  }
}

// Feature flags
export const features = {
  enableMLRecommendations: true,
  enablePropertyFavorites: true,
  enableUserProfile: true,
  enableAnalytics: env.NODE_ENV === 'production',
  enableDebugMode: env.NODE_ENV === 'development'
}

// Pagination defaults
export const pagination = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100
}

// File upload configuration
export const upload = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 10
}