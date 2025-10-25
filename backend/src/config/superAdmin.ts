/**
 * Super Admin Configuration
 * 
 * Este arquivo contém configurações especiais para testes e desenvolvimento
 * que permitem bypass de limitações do sistema.
 * 
 * ⚠️ IMPORTANTE: Este arquivo deve ser usado apenas em ambiente de desenvolvimento
 * e para testes autorizados. Nunca comitar credenciais reais.
 * 
 * @version 1.0.0
 * @date 2025-10-25
 */

export interface SuperAdminConfig {
  enabled: boolean
  apiKeys: string[]
  ipWhitelist: string[]
  rateLimitBypass: boolean
  maxRequestsPerTest: number
}

/**
 * Configuração de Super Admin
 * 
 * Esta configuração permite:
 * - Bypass do rate limiter para testes de performance
 * - Execução de múltiplas requisições sem restrições
 * - Acesso privilegiado para debugging
 */
export const superAdminConfig: SuperAdminConfig = {
  // Habilitar super admin mode (apenas para desenvolvimento/teste)
  enabled: process.env.NODE_ENV !== 'production',
  
  // API Keys autorizadas para super admin
  // Formato: X-Super-Admin-Key: <key>
  apiKeys: [
    'SUPER_ADMIN_KEY_2025_DEV_ONLY',
    process.env.SUPER_ADMIN_KEY || ''
  ].filter(Boolean),
  
  // IPs autorizados (localhost por padrão)
  ipWhitelist: [
    '127.0.0.1',
    '::1',
    'localhost',
    '::ffff:127.0.0.1'
  ],
  
  // Permitir bypass do rate limiter
  rateLimitBypass: true,
  
  // Máximo de requisições permitidas por teste
  maxRequestsPerTest: 1000
}

/**
 * Verifica se uma requisição possui privilégios de super admin
 * 
 * @param apiKey API key fornecida no header
 * @param ip IP da requisição
 * @returns true se for super admin autorizado
 */
export function isSuperAdmin(apiKey: string | undefined, ip: string | undefined): boolean {
  if (!superAdminConfig.enabled) {
    return false
  }
  
  // Verificar API key
  const hasValidKey = !!(apiKey && superAdminConfig.apiKeys.includes(apiKey))
  
  // Verificar IP whitelist
  const hasValidIP = !!(ip && superAdminConfig.ipWhitelist.includes(ip))
  
  return hasValidKey || hasValidIP
}

/**
 * Middleware para verificar super admin
 * Adiciona flag req.isSuperAdmin se for autorizado
 */
export function checkSuperAdmin(req: any, res: any, next: any) {
  const apiKey = req.headers['x-super-admin-key'] as string
  const ip = req.ip || req.connection.remoteAddress
  
  req.isSuperAdmin = isSuperAdmin(apiKey, ip)
  
  if (req.isSuperAdmin) {
    console.log(`[SUPER ADMIN] Acesso autorizado de ${ip} com key: ${apiKey ? '***' + apiKey.slice(-4) : 'N/A'}`)
  }
  
  next()
}

export default superAdminConfig
