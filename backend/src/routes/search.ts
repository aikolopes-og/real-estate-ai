/**
 * ROTA DE BUSCA DE IMÓVEIS
 * 
 * Este arquivo define o endpoint REST API para busca de imóveis.
 * Recebe parâmetros via query string, valida com Zod, executa busca
 * no banco de dados e retorna JSON formatado.
 * 
 * ENDPOINT: GET /api/search
 * 
 * QUERY PARAMETERS:
 * - type: string (HOUSE, APARTMENT, etc)
 * - priceMin: number
 * - priceMax: number
 * - city: string
 * - state: string
 * - bedroomsMin: number
 * - bedroomsMax: number
 * - bathroomsMin: number
 * - bathroomsMax: number
 * - areaMin: number
 * - areaMax: number
 * - parkingSpacesMin: number
 * - amenities: string[] (comma-separated)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: string (price, createdAt, views, favorites, area)
 * - sortOrder: string (asc, desc)
 * 
 * EXEMPLO DE USO:
 * GET /api/search?type=Casa&priceMax=500000&city=Goiânia&bedroomsMin=3
 * 
 * RESPOSTA JSON:
 * {
 *   "success": true,
 *   "data": {
 *     "properties": [...],
 *     "pagination": { page, limit, total, pages },
 *     "filters": { ... },
 *     "executionTime": 123
 *   }
 * }
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { optionalAuth } from '../middleware/auth'
import { searchProperties, getAvailablePropertyTypes, getPriceRange, getAvailableCities } from '../services/search'
import logger from '../utils/logger'

const router = Router()

/**
 * SCHEMA DE VALIDAÇÃO COM ZOD
 * 
 * Valida os parâmetros recebidos do cliente antes de processar
 * Garante type safety e previne erros de execução
 */
const searchQuerySchema = z.object({
  // Filtros básicos
  type: z.string().optional(),
  priceMin: z.string().transform(val => parseFloat(val)).optional(),
  priceMax: z.string().transform(val => parseFloat(val)).optional(),
  
  // Localização
  city: z.string().optional(),
  state: z.string().optional(),
  
  // Características
  bedroomsMin: z.string().transform(val => parseInt(val)).optional(),
  bedroomsMax: z.string().transform(val => parseInt(val)).optional(),
  bathroomsMin: z.string().transform(val => parseInt(val)).optional(),
  bathroomsMax: z.string().transform(val => parseInt(val)).optional(),
  areaMin: z.string().transform(val => parseFloat(val)).optional(),
  areaMax: z.string().transform(val => parseFloat(val)).optional(),
  parkingSpacesMin: z.string().transform(val => parseInt(val)).optional(),
  
  // Amenidades (aceita string separada por vírgula)
  amenities: z.string().transform(val => val.split(',').map(s => s.trim())).optional(),
  
  // Paginação
  page: z.string().transform(val => parseInt(val)).default('1'),
  limit: z.string().transform(val => parseInt(val)).default('20'),
  
  // Ordenação
  sortBy: z.enum(['price', 'createdAt', 'views', 'favorites', 'area']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  
  // Status
  status: z.string().optional()
})

/**
 * ENDPOINT PRINCIPAL DE BUSCA
 * 
 * GET /api/search
 * 
 * Fluxo:
 * 1. Recebe query parameters
 * 2. Valida com Zod schema
 * 3. Chama serviço de busca (search.ts)
 * 4. Retorna JSON com resultados
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    logger.info('Requisição de busca recebida', {
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    })
    
    // Validação dos parâmetros
    let validatedParams
    try {
      validatedParams = searchQuerySchema.parse(req.query)
    } catch (validationError: any) {
      logger.warn('Parâmetros de busca inválidos', {
        error: validationError.message,
        query: req.query
      })
      
      return res.status(400).json({
        success: false,
        error: 'Parâmetros de busca inválidos',
        details: validationError.errors
      })
    }
    
    // Executar busca
    const result = await searchProperties(validatedParams)
    
    // Retornar resultado
    return res.status(200).json({
      success: true,
      data: result
    })
    
  } catch (error: any) {
    logger.error('Erro no endpoint de busca', {
      error: error.message,
      stack: error.stack,
      query: req.query
    })
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar busca',
      message: error.message
    })
  }
})

/**
 * ENDPOINT: Obter tipos de imóveis disponíveis
 * 
 * GET /api/search/types
 * 
 * Retorna array com tipos únicos: ["HOUSE", "APARTMENT", ...]
 * Útil para popular dropdowns no frontend
 */
router.get('/types', async (_req: Request, res: Response) => {
  try {
    const types = await getAvailablePropertyTypes()
    
    return res.status(200).json({
      success: true,
      data: { types }
    })
  } catch (error: any) {
    logger.error('Erro ao buscar tipos', { error: error.message })
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar tipos de imóveis'
    })
  }
})

/**
 * ENDPOINT: Obter faixa de preços
 * 
 * GET /api/search/price-range?type=Casa
 * 
 * Query params opcionais:
 *   - type: 'HOUSE', 'APARTMENT', 'Casa', 'Apartamento'
 * 
 * Retorna: { min: 250000, max: 5800000 }
 * Útil para configurar sliders de preço dinâmicos por tipo
 */
router.get('/price-range', async (req: Request, res: Response) => {
  try {
    const { type } = req.query
    
    const range = await getPriceRange(type as string)
    
    return res.status(200).json({
      success: true,
      data: range
    })
  } catch (error: any) {
    logger.error('Erro ao buscar faixa de preços', { error: error.message })
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar faixa de preços'
    })
  }
})

/**
 * ENDPOINT: Obter cidades disponíveis
 * 
 * GET /api/search/cities
 * 
 * Retorna array com cidades únicas: ["Goiânia", "Aparecida de Goiânia", ...]
 */
router.get('/cities', async (_req: Request, res: Response) => {
  try {
    const cities = await getAvailableCities()
    
    return res.status(200).json({
      success: true,
      data: { cities }
    })
  } catch (error: any) {
    logger.error('Erro ao buscar cidades', { error: error.message })
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar cidades'
    })
  }
})

export default router
