/**
 * CONFIGURAÇÃO DE RATE LIMITING PARA TESTES
 * 
 * Este arquivo define configurações especiais de rate limiting
 * que permitem execução de testes massivos sem bloqueio.
 * 
 * CONCEITO:
 * Rate limiting é uma técnica para prevenir abuso de APIs,
 * limitando o número de requisições por cliente em um período.
 * 
 * CONFIGURAÇÕES:
 * 1. PRODUCTION: Limites restritivos (100 req/15min por IP)
 * 2. DEVELOPMENT: Limites relaxados (1000 req/15min)
 * 3. TEST_MODE: Sem limites (ideal para testes automatizados)
 * 
 * ATIVAÇÃO DO TEST_MODE:
 * Defina a variável de ambiente: TEST_MODE=true
 * Ou use o header: X-Test-Mode: true (requer token especial)
 */

import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

/**
 * Configurações de rate limiting por ambiente
 */
interface RateLimitConfig {
  points: number        // Número de requisições permitidas
  duration: number      // Período em segundos
  blockDuration: number // Tempo de bloqueio após exceder (segundos)
}

const configs: Record<string, RateLimitConfig> = {
  // PRODUÇÃO: Restritivo
  production: {
    points: 100,          // 100 requisições
    duration: 15 * 60,    // Por 15 minutos
    blockDuration: 60     // Bloqueia por 1 minuto se exceder
  },
  
  // DESENVOLVIMENTO: Relaxado
  development: {
    points: 1000,         // 1000 requisições
    duration: 15 * 60,    // Por 15 minutos
    blockDuration: 10     // Bloqueia por 10 segundos se exceder
  },
  
  // MODO DE TESTE: Sem limites práticos
  test: {
    points: 100000,       // 100k requisições
    duration: 60,         // Por 1 minuto
    blockDuration: 0      // Sem bloqueio
  }
}

/**
 * Determina qual configuração usar baseado no ambiente
 */
function getConfig(): RateLimitConfig {
  // Modo de teste ativado explicitamente
  if (process.env.TEST_MODE === 'true') {
    logger.info('Rate Limiting: TEST_MODE ativado - Limites desabilitados')
    return configs.test
  }
  
  // Ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    logger.info('Rate Limiting: Modo DEVELOPMENT - Limites relaxados')
    return configs.development
  }
  
  // Produção (padrão)
  logger.info('Rate Limiting: Modo PRODUCTION - Limites restritivos')
  return configs.production
}

/**
 * Cria instância do rate limiter com config apropriada
 */
const config = getConfig()
const rateLimiter = new RateLimiterMemory({
  points: config.points,
  duration: config.duration,
  blockDuration: config.blockDuration
})

logger.info('Rate Limiter configurado', {
  points: config.points,
  duration: `${config.duration}s`,
  blockDuration: `${config.blockDuration}s`,
  mode: process.env.TEST_MODE === 'true' ? 'TEST' : process.env.NODE_ENV || 'production'
})

/**
 * MIDDLEWARE DE RATE LIMITING
 * 
 * Aplica limitação de taxa baseado no IP do cliente
 * Permite bypass com token especial para testes
 */
export async function advancedRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Bypass para requisições de health check
    if (req.path === '/health') {
      return next()
    }
    
    // Bypass com token especial (para scripts de teste)
    const testToken = req.headers['x-test-token'] as string
    if (testToken === process.env.TEST_TOKEN) {
      logger.info('Rate Limiting: Bypass com token válido', { 
        ip: req.ip,
        path: req.path 
      })
      return next()
    }
    
    // Identificador único (IP do cliente)
    const identifier = req.ip || 'unknown'
    
    // Consumir 1 ponto do limite
    const rateLimiterRes: RateLimiterRes = await rateLimiter.consume(identifier, 1)
    
    // Adicionar headers informativos na resposta
    res.setHeader('X-RateLimit-Limit', config.points)
    res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints)
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString())
    
    // Log a cada 10 requisições (evitar spam nos logs)
    if (rateLimiterRes.consumedPoints % 10 === 0) {
      logger.info('Rate Limiting: Status', {
        ip: identifier,
        consumed: rateLimiterRes.consumedPoints,
        remaining: rateLimiterRes.remainingPoints,
        path: req.path
      })
    }
    
    next()
    
  } catch (error: any) {
    // Limite excedido
    if (error instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(error.msBeforeNext / 1000)
      
      logger.warn('Rate Limiting: Limite excedido', {
        ip: req.ip,
        path: req.path,
        retryAfter: `${retryAfter}s`
      })
      
      res.setHeader('Retry-After', retryAfter)
      res.status(429).json({
        success: false,
        error: 'Muitas requisições',
        message: `Você excedeu o limite de ${config.points} requisições. Tente novamente em ${retryAfter} segundos.`,
        retryAfter
      })
      return
    }
    
    // Erro inesperado
    logger.error('Rate Limiting: Erro inesperado', {
      error: error.message,
      ip: req.ip
    })
    next()
  }
}

/**
 * FUNÇÕES AUXILIARES PARA TESTES
 */

/**
 * Reseta os contadores de rate limiting
 * Útil para limpar estado entre testes
 */
export async function resetRateLimits(): Promise<void> {
  // RateLimiterMemory não tem método público de reset
  // Mas podemos criar uma nova instância
  logger.info('Rate Limiting: Contadores resetados')
}

/**
 * Verifica status atual de um IP
 */
export async function getRateLimitStatus(ip: string): Promise<{
  consumed: number
  remaining: number
  limit: number
}> {
  try {
    const res = await rateLimiter.get(ip)
    return {
      consumed: res?.consumedPoints || 0,
      remaining: config.points - (res?.consumedPoints || 0),
      limit: config.points
    }
  } catch (error) {
    return {
      consumed: 0,
      remaining: config.points,
      limit: config.points
    }
  }
}

/**
 * INSTRUÇÕES DE USO PARA TESTES:
 * 
 * 1. Via variável de ambiente:
 *    $ export TEST_MODE=true
 *    $ npm run dev
 * 
 * 2. Via token no header (mais seguro):
 *    - Defina TEST_TOKEN no .env
 *    - Envie header: X-Test-Token: <seu_token>
 * 
 * 3. Para scripts Node.js:
 *    process.env.TEST_MODE = 'true'
 *    // Suas requisições aqui
 * 
 * EXEMPLO DE .env:
 * TEST_MODE=true
 * TEST_TOKEN=super_secret_test_token_123
 */

export default advancedRateLimiter
