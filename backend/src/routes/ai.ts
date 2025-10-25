import { Router, Request, Response } from 'express'
import { prisma } from '../server'
import { authenticate, optionalAuth } from '../middleware/auth'
import { z } from 'zod'
import logger from '../utils/logger'

const router = Router()

// Recommendation request schema
const recommendationSchema = z.object({
  userId: z.string().optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  propertyTypes: z.array(z.enum(['APARTMENT', 'HOUSE'])).optional(),
  locations: z.array(z.string()).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(50).default(10)
})

// Get AI-powered property recommendations
router.post('/recommendations', optionalAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = recommendationSchema.parse(req.body)
    const userId = req.user?.userId || validatedData.userId

    // Build recommendation query based on user preferences
    const where: any = {
      status: 'AVAILABLE'
    }

    if (validatedData.priceRange) {
      where.price = {}
      if (validatedData.priceRange.min) where.price.gte = validatedData.priceRange.min
      if (validatedData.priceRange.max) where.price.lte = validatedData.priceRange.max
    }

    if (validatedData.propertyTypes?.length) {
      where.propertyType = { in: validatedData.propertyTypes }
    }

    if (validatedData.locations?.length) {
      where.OR = validatedData.locations.map(location => ({
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } }
        ]
      }))
    }

    if (validatedData.bedrooms !== undefined) {
      where.bedrooms = { gte: validatedData.bedrooms }
    }

    if (validatedData.bathrooms !== undefined) {
      where.bathrooms = { gte: validatedData.bathrooms }
    }

    if (validatedData.amenities?.length) {
      where.amenities = {
        hasSome: validatedData.amenities
      }
    }

    // Get user's viewing history for better recommendations
    let userPreferences: any = {}
    if (userId) {
      const viewHistory = await prisma.propertyView.findMany({
        where: { userId },
        include: { property: true },
        orderBy: { viewedAt: 'desc' },
        take: 50
      })

      if (viewHistory.length > 0) {
        // Analyze user preferences from viewing history
        const viewedProperties = viewHistory.map(v => v.property)
        
        // Calculate average price range
        const prices = viewedProperties.map(p => p.price)
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const priceRange = avgPrice * 0.3 // 30% range around average
        
        if (!validatedData.priceRange) {
          where.price = {
            gte: Math.max(0, avgPrice - priceRange),
            lte: avgPrice + priceRange
          }
        }

        // Most viewed property types
        const typeFrequency: Record<string, number> = {}
        viewedProperties.forEach(p => {
          typeFrequency[p.propertyType] = (typeFrequency[p.propertyType] || 0) + 1
        })
        
        if (!validatedData.propertyTypes?.length) {
          const preferredTypes = Object.entries(typeFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([type]) => type)
          
          if (preferredTypes.length > 0) {
            where.propertyType = { in: preferredTypes }
          }
        }

        // Exclude already viewed properties
        where.id = {
          notIn: viewedProperties.map(p => p.id)
        }
      }
    }

    // Get recommendations
    const recommendations = await prisma.property.findMany({
      where,
      take: validatedData.limit,
      orderBy: [
        { views: 'desc' },
        { favorites: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        company: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })

    // Calculate recommendation scores (simple algorithm)
    const scoredRecommendations = recommendations.map(property => {
      let score = 0
      
      // Base score from popularity
      score += property.views * 0.1
      score += property.favorites * 0.5
      
      // Recency bonus
      const daysSinceCreated = (Date.now() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      score += Math.max(0, 30 - daysSinceCreated) * 0.2
      
      // Price competitiveness (lower prices get higher scores within range)
      if (validatedData.priceRange?.max) {
        const priceRatio = property.price / validatedData.priceRange.max
        score += (1 - priceRatio) * 10
      }

      return {
        ...property,
        recommendationScore: Math.round(score * 100) / 100,
        matchReasons: generateMatchReasons(property, validatedData)
      }
    })

    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

    logger.info('AI recommendations generated', {
      userId,
      criteriaUsed: Object.keys(validatedData),
      resultCount: scoredRecommendations.length
    })

    res.json({
      success: true,
      data: {
        recommendations: scoredRecommendations,
        totalFound: scoredRecommendations.length,
        criteria: validatedData
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

    logger.error('AI recommendations failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    })
  }
})

// Get property market analysis
router.get('/market-analysis/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const property = await prisma.property.findUnique({
      where: { id }
    })

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    // Find similar properties for market analysis
    const similarProperties = await prisma.property.findMany({
      where: {
        id: { not: id },
        propertyType: property.propertyType,
        city: property.city,
        bedrooms: { gte: property.bedrooms - 1, lte: property.bedrooms + 1 },
        bathrooms: { gte: property.bathrooms - 1, lte: property.bathrooms + 1 },
        area: { gte: property.area * 0.8, lte: property.area * 1.2 },
        status: 'AVAILABLE'
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    })

    if (similarProperties.length === 0) {
      return res.json({
        success: true,
        data: {
          analysis: {
            marketPosition: 'UNIQUE',
            averagePrice: property.price,
            priceComparison: 'NO_COMPARISON',
            marketTrend: 'STABLE'
          },
          similarProperties: []
        }
      })
    }

    // Calculate market analysis
    const prices = similarProperties.map(p => p.price)
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    let priceComparison: string
    if (property.price < averagePrice * 0.9) {
      priceComparison = 'BELOW_MARKET'
    } else if (property.price > averagePrice * 1.1) {
      priceComparison = 'ABOVE_MARKET'
    } else {
      priceComparison = 'MARKET_AVERAGE'
    }

    let marketPosition: string
    const priceDiff = (property.price - averagePrice) / averagePrice
    if (Math.abs(priceDiff) < 0.1) {
      marketPosition = 'COMPETITIVE'
    } else if (priceDiff < -0.2) {
      marketPosition = 'BARGAIN'
    } else if (priceDiff > 0.2) {
      marketPosition = 'PREMIUM'
    } else {
      marketPosition = 'FAIR'
    }

    res.json({
      success: true,
      data: {
        analysis: {
          marketPosition,
          averagePrice: Math.round(averagePrice),
          priceComparison,
          priceRange: { min: minPrice, max: maxPrice },
          marketTrend: 'STABLE', // Could be enhanced with historical data
          competitorCount: similarProperties.length
        },
        similarProperties: similarProperties.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area,
          images: p.images.slice(0, 1)
        }))
      }
    })
  } catch (error: any) {
    logger.error('Market analysis failed', { error: error.message, propertyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to generate market analysis'
    })
  }
})

// Helper function to generate match reasons
function generateMatchReasons(property: any, criteria: any): string[] {
  const reasons: string[] = []

  if (criteria.priceRange && property.price >= (criteria.priceRange.min || 0) && property.price <= (criteria.priceRange.max || Infinity)) {
    reasons.push('Within your price range')
  }

  if (criteria.propertyTypes?.includes(property.propertyType)) {
    reasons.push(`Matches your preferred ${property.propertyType.toLowerCase()} type`)
  }

  if (criteria.bedrooms && property.bedrooms >= criteria.bedrooms) {
    reasons.push(`Has ${property.bedrooms} bedrooms as requested`)
  }

  if (criteria.bathrooms && property.bathrooms >= criteria.bathrooms) {
    reasons.push(`Has ${property.bathrooms} bathrooms as requested`)
  }

  if (criteria.amenities?.some((amenity: string) => property.amenities.includes(amenity))) {
    const matchingAmenities = criteria.amenities.filter((amenity: string) => property.amenities.includes(amenity))
    reasons.push(`Includes desired amenities: ${matchingAmenities.join(', ')}`)
  }

  if (property.views > 100) {
    reasons.push('Popular property with high interest')
  }

  if (property.favorites > 10) {
    reasons.push('Highly favorited by other users')
  }

  return reasons
}

export default router