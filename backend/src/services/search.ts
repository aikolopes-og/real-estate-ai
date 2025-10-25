/**
 * SERVIÇO DE BUSCA ROBUSTA DE IMÓVEIS
 * 
 * Este serviço implementa um sistema de busca otimizado usando Prisma ORM
 * com queries SQL eficientes, utilizando WHERE clauses, JOINs e índices
 * para garantir performance mesmo com grandes volumes de dados.
 * 
 * TECNOLOGIAS:
 * - Prisma ORM: Abstração type-safe sobre SQL
 * - PostgreSQL: Banco de dados relacional com índices otimizados
 * - TypeScript: Type safety em toda a aplicação
 * 
 * OTIMIZAÇÕES IMPLEMENTADAS:
 * 1. Queries parametrizadas para evitar SQL Injection
 * 2. Uso de índices no banco (id, price, propertyType, city, status)
 * 3. Paginação para evitar sobrecarga
 * 4. Filtros compostos com AND/OR lógicos
 * 5. Ordenação flexível (preço, data, relevância)
 * 6. Include seletivo (apenas dados necessários dos relacionamentos)
 */

import { prisma } from '../server'
import logger from '../utils/logger'

/**
 * Interface para parâmetros de busca
 * Define todos os filtros possíveis que o cliente pode enviar
 */
export interface SearchParams {
  // Filtros básicos
  type?: string                    // Tipo: 'HOUSE', 'APARTMENT', etc
  priceMin?: number                // Preço mínimo em reais
  priceMax?: number                // Preço máximo em reais
  
  // Filtros de localização
  city?: string                    // Cidade (case-insensitive)
  state?: string                   // Estado (UF)
  
  // Filtros de características
  bedroomsMin?: number             // Mínimo de quartos
  bedroomsMax?: number             // Máximo de quartos
  bathroomsMin?: number            // Mínimo de banheiros
  bathroomsMax?: number            // Máximo de banheiros
  areaMin?: number                 // Área mínima em m²
  areaMax?: number                 // Área máxima em m²
  parkingSpacesMin?: number        // Mínimo de vagas
  
  // Filtros de amenidades
  amenities?: string[]             // Lista de amenidades requeridas
  
  // Paginação
  page?: number                    // Página atual (padrão: 1)
  limit?: number                   // Itens por página (padrão: 20)
  
  // Ordenação
  sortBy?: 'price' | 'createdAt' | 'views' | 'favorites' | 'area'
  sortOrder?: 'asc' | 'desc'       // Ordem: ascendente ou descendente
  
  // Outros
  status?: string                  // Status: 'AVAILABLE', 'SOLD', etc
}

/**
 * Interface para resultado da busca
 * Retorna os imóveis encontrados + metadados de paginação
 */
export interface SearchResult {
  properties: any[]                // Array de imóveis encontrados
  pagination: {
    page: number                   // Página atual
    limit: number                  // Itens por página
    total: number                  // Total de resultados encontrados
    pages: number                  // Total de páginas
  }
  filters: SearchParams            // Filtros aplicados (para debug/logs)
  executionTime: number            // Tempo de execução em ms
}

/**
 * FUNÇÃO PRINCIPAL DE BUSCA
 * 
 * Esta função constrói dinamicamente uma query Prisma baseada nos filtros
 * recebidos, executa a busca no banco de dados PostgreSQL e retorna os
 * resultados formatados em JSON.
 * 
 * FLUXO:
 * 1. Recebe parâmetros do cliente (filtros)
 * 2. Valida e normaliza os parâmetros
 * 3. Constrói objeto WHERE do Prisma (traduzido para SQL pelo ORM)
 * 4. Executa query com JOIN nas tabelas relacionadas (owner, company)
 * 5. Conta total de resultados (para paginação)
 * 6. Retorna JSON estruturado com dados + metadados
 * 
 * @param params - Parâmetros de busca (filtros, paginação, ordenação)
 * @returns Promise<SearchResult> - Resultado da busca com metadados
 */
export async function searchProperties(params: SearchParams): Promise<SearchResult> {
  const startTime = Date.now()
  
  try {
    // ========================================
    // PASSO 1: NORMALIZAÇÃO DOS PARÂMETROS
    // ========================================
    
    // Paginação com valores padrão
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(100, Math.max(1, params.limit || 20)) // Max 100 por página
    const skip = (page - 1) * limit
    
    // Ordenação com valores padrão
    const sortBy = params.sortBy || 'createdAt'
    const sortOrder = params.sortOrder || 'desc'
    
    logger.info('Iniciando busca de imóveis', {
      filters: params,
      page,
      limit,
      sortBy,
      sortOrder
    })
    
    // ========================================
    // PASSO 2: CONSTRUÇÃO DO WHERE CLAUSE
    // ========================================
    
    /**
     * O objeto 'where' será traduzido pelo Prisma para SQL
     * Exemplo: { price: { gte: 100000, lte: 500000 } }
     * Vira: WHERE price >= 100000 AND price <= 500000
     */
    const where: any = {
      // Apenas imóveis disponíveis por padrão
      status: params.status || 'AVAILABLE'
    }
    
    // FILTRO: Tipo de imóvel (Casa, Apartamento, etc)
    if (params.type) {
      // Normaliza o tipo recebido
      const typeUpper = params.type.toUpperCase()
      
      // Mapeia português -> inglês
      const typeMapping: Record<string, string> = {
        'CASA': 'HOUSE',
        'APARTAMENTO': 'APARTMENT',
        'TERRENO': 'LAND',
        'COMERCIAL': 'COMMERCIAL',
        'CONDOMINIO': 'CONDO',
        'CONDOMÍNIO': 'CONDO'
      }
      
      const mappedType = typeMapping[typeUpper] || typeUpper
      where.propertyType = mappedType
      
      logger.info('Filtro de tipo aplicado', { original: params.type, mapped: mappedType })
    }
    
    // FILTRO: Faixa de preço (principal filtro problemático)
    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      where.price = {}
      
      // Preço mínimo (>=)
      if (params.priceMin !== undefined && params.priceMin > 0) {
        where.price.gte = params.priceMin
        logger.info('Filtro de preço mínimo aplicado', { priceMin: params.priceMin })
      }
      
      // Preço máximo (<=)
      if (params.priceMax !== undefined && params.priceMax > 0) {
        where.price.lte = params.priceMax
        logger.info('Filtro de preço máximo aplicado', { priceMax: params.priceMax })
      }
    }
    
    // FILTRO: Cidade (busca case-insensitive com ILIKE)
    if (params.city) {
      where.city = {
        contains: params.city,
        mode: 'insensitive' // Ignora maiúsculas/minúsculas
      }
      logger.info('Filtro de cidade aplicado', { city: params.city })
    }
    
    // FILTRO: Estado
    if (params.state) {
      where.state = {
        contains: params.state,
        mode: 'insensitive'
      }
      logger.info('Filtro de estado aplicado', { state: params.state })
    }
    
    // FILTRO: Quartos (mínimo e máximo)
    if (params.bedroomsMin !== undefined || params.bedroomsMax !== undefined) {
      where.bedrooms = {}
      if (params.bedroomsMin !== undefined) where.bedrooms.gte = params.bedroomsMin
      if (params.bedroomsMax !== undefined) where.bedrooms.lte = params.bedroomsMax
      logger.info('Filtro de quartos aplicado', { min: params.bedroomsMin, max: params.bedroomsMax })
    }
    
    // FILTRO: Banheiros
    if (params.bathroomsMin !== undefined || params.bathroomsMax !== undefined) {
      where.bathrooms = {}
      if (params.bathroomsMin !== undefined) where.bathrooms.gte = params.bathroomsMin
      if (params.bathroomsMax !== undefined) where.bathrooms.lte = params.bathroomsMax
      logger.info('Filtro de banheiros aplicado', { min: params.bathroomsMin, max: params.bathroomsMax })
    }
    
    // FILTRO: Área em m²
    if (params.areaMin !== undefined || params.areaMax !== undefined) {
      where.area = {}
      if (params.areaMin !== undefined) where.area.gte = params.areaMin
      if (params.areaMax !== undefined) where.area.lte = params.areaMax
      logger.info('Filtro de área aplicado', { min: params.areaMin, max: params.areaMax })
    }
    
    // FILTRO: Vagas de garagem
    if (params.parkingSpacesMin !== undefined) {
      where.parkingSpaces = { gte: params.parkingSpacesMin }
      logger.info('Filtro de vagas aplicado', { min: params.parkingSpacesMin })
    }
    
    // FILTRO: Amenidades (deve ter TODAS as amenidades listadas)
    if (params.amenities && params.amenities.length > 0) {
      // hasEvery: verifica se o array contém todos os elementos
      where.amenities = {
        hasEvery: params.amenities
      }
      logger.info('Filtro de amenidades aplicado', { amenities: params.amenities })
    }
    
    // ========================================
    // PASSO 3: EXECUÇÃO DA QUERY
    // ========================================
    
    /**
     * Executamos 2 queries em paralelo para otimizar:
     * 1. findMany: busca os imóveis com paginação e joins
     * 2. count: conta total de resultados (para calcular páginas)
     * 
     * O Prisma traduz isso para SQL otimizado:
     * 
     * SELECT p.*, u.firstName, u.lastName, c.name
     * FROM properties p
     * LEFT JOIN users u ON p.ownerId = u.id
     * LEFT JOIN companies c ON p.companyId = c.id
     * WHERE p.status = 'AVAILABLE'
     *   AND p.price >= ? AND p.price <= ?
     *   AND p.propertyType = ?
     * ORDER BY p.createdAt DESC
     * LIMIT ? OFFSET ?
     */
    const [properties, total] = await Promise.all([
      // Query 1: Buscar imóveis
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        
        // JOINs: incluir dados relacionados
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              website: true
            }
          }
        }
      }),
      
      // Query 2: Contar total de resultados
      prisma.property.count({ where })
    ])
    
    // ========================================
    // PASSO 4: FORMATAÇÃO DO RESULTADO
    // ========================================
    
    const executionTime = Date.now() - startTime
    const totalPages = Math.ceil(total / limit)
    
    logger.info('Busca concluída com sucesso', {
      found: properties.length,
      total,
      page,
      pages: totalPages,
      executionTime: `${executionTime}ms`
    })
    
    // Retorna resultado estruturado em JSON
    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      },
      filters: params,
      executionTime
    }
    
  } catch (error: any) {
    const executionTime = Date.now() - startTime
    
    logger.error('Erro na busca de imóveis', {
      error: error.message,
      stack: error.stack,
      params,
      executionTime: `${executionTime}ms`
    })
    
    throw new Error(`Falha na busca: ${error.message}`)
  }
}

/**
 * FUNÇÃO AUXILIAR: Buscar tipos de imóveis disponíveis
 * 
 * Retorna lista de tipos únicos que existem no banco
 * Útil para popular filtros no frontend
 */
export async function getAvailablePropertyTypes(): Promise<string[]> {
  try {
    const types = await prisma.property.findMany({
      where: { status: 'AVAILABLE' },
      select: { propertyType: true },
      distinct: ['propertyType']
    })
    
    return types.map(t => t.propertyType)
  } catch (error: any) {
    logger.error('Erro ao buscar tipos de imóveis', { error: error.message })
    return []
  }
}

/**
 * FUNÇÃO AUXILIAR: Buscar faixas de preço
 * 
 * Retorna preço mínimo e máximo disponíveis no banco
 * Útil para configurar sliders no frontend
 * 
 * @param propertyType - Filtro opcional por tipo (HOUSE, APARTMENT)
 */
export async function getPriceRange(propertyType?: string): Promise<{ min: number; max: number }> {
  try {
    // Construir filtro dinâmico
    const where: any = { status: 'AVAILABLE' }
    
    // Se tipo foi especificado, filtrar por ele
    if (propertyType) {
      const typeUpper = propertyType.toUpperCase()
      if (typeUpper === 'HOUSE' || typeUpper === 'APARTMENT' || 
          typeUpper === 'CASA' || typeUpper === 'APARTAMENTO') {
        where.propertyType = typeUpper === 'CASA' ? 'HOUSE' : 
                            typeUpper === 'APARTAMENTO' ? 'APARTMENT' : 
                            typeUpper
      }
    }
    
    const result = await prisma.property.aggregate({
      where,
      _min: { price: true },
      _max: { price: true }
    })
    
    return {
      min: result._min.price || 0,
      max: result._max.price || 1000000
    }
  } catch (error: any) {
    logger.error('Erro ao buscar faixa de preços', { error: error.message })
    return { min: 0, max: 1000000 }
  }
}

/**
 * FUNÇÃO AUXILIAR: Buscar cidades disponíveis
 * 
 * Retorna lista de cidades únicas com imóveis disponíveis
 */
export async function getAvailableCities(): Promise<string[]> {
  try {
    const cities = await prisma.property.findMany({
      where: { status: 'AVAILABLE' },
      select: { city: true },
      distinct: ['city']
    })
    
    return cities.map(c => c.city).sort()
  } catch (error: any) {
    logger.error('Erro ao buscar cidades', { error: error.message })
    return []
  }
}
