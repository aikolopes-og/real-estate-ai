import { Router, Request, Response } from 'express'
import { prisma } from '../server'
import { authenticate, authorize, optionalAuth } from '../middleware/auth'
import { z } from 'zod'
import logger from '../utils/logger'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Property creation schema
const createPropertySchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres'),
  // Apenas APARTMENT e HOUSE por agora
  propertyType: z.enum(['APARTMENT', 'HOUSE']),
  price: z.number().positive('O preço deve ser positivo'),
  priceType: z.enum(['SALE', 'RENT_MONTHLY', 'RENT_DAILY']).default('SALE'),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.number().positive('A área deve ser positiva'),
  parkingSpaces: z.number().int().min(0).default(0),
  address: z.string().min(5, 'Endereço muito curto'),
  city: z.string().min(2, 'Cidade muito curta'),
  state: z.string().min(2, 'Estado muito curto'),
  zipCode: z.string().min(5, 'CEP muito curto'),
  country: z.string().default('Brasil'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Armazenamos strings (caminhos/URLs) — upload gerenciado por endpoint separado
  images: z.array(z.string()).default([]),
  virtualTourUrl: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  companyId: z.string().optional()
})

// Update property schema
const updatePropertySchema = createPropertySchema.partial()

// Multer setup for image uploads
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    cb(null, unique)
  }
})

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
    files: 10 // máximo 10 arquivos
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Apenas imagens JPG, PNG ou WEBP são permitidas'))
    }
  }
})

// Image upload endpoint: recebe arquivos multipart/form-data e retorna URLs públicas
router.post('/upload', authenticate, authorize('BROKER', 'ADMIN'), upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = (req as any).files as Express.Multer.File[]
    if (!files || files.length === 0) return res.status(400).json({ success: false, error: 'No files uploaded' })

    const urls = files.map(f => `/uploads/${f.filename}`)
    return res.status(201).json({ success: true, data: { urls } })
  } catch (error: any) {
    logger.error('Upload failed', { error: error.message })
    return res.status(500).json({ success: false, error: 'Image upload failed' })
  }
})

// Get all properties
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      type,
      priceMin,
      priceMax,
      city,
      state,
      bedrooms,
      bathrooms,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {
      status: 'AVAILABLE'
    }

    if (type) where.propertyType = type
    if (city) where.city = { contains: city as string, mode: 'insensitive' }
    if (state) where.state = { contains: state as string, mode: 'insensitive' }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms as string) }
    if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms as string) }
    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = parseFloat(priceMin as string)
      if (priceMax) where.price.lte = parseFloat(priceMax as string)
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          company: {
            select: {
              name: true,
              phone: true,
              email: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ])

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    logger.error('Get properties failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties'
    })
  }
})

// Get property by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        company: {
          select: {
            name: true,
            phone: true,
            email: true,
            website: true
          }
        }
      }
    })

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    // Track property view
    if (req.user) {
      await prisma.propertyView.create({
        data: {
          propertyId: id,
          userId: req.user.userId
        }
      }).catch(() => {}) // Ignore errors for view tracking
    }

    // Increment view count
    await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    res.json({
      success: true,
      data: { property }
    })
  } catch (error: any) {
    logger.error('Get property failed', { error: error.message, propertyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property'
    })
  }
})

// Create property
router.post('/', authenticate, authorize('BROKER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const validatedData = createPropertySchema.parse(req.body)

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        ownerId: req.user!.userId
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        company: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    logger.info('Property created', { propertyId: property.id, userId: req.user!.userId })

    res.status(201).json({
      success: true,
      data: { property }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Create property failed', { error: error.message, userId: req.user?.userId })
    res.status(500).json({
      success: false,
      error: 'Failed to create property'
    })
  }
})

// Update property
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validatedData = updatePropertySchema.parse(req.body)

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    if (existingProperty.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      })
    }

    const property = await prisma.property.update({
      where: { id },
      data: validatedData,
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        company: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    logger.info('Property updated', { propertyId: id, userId: req.user!.userId })

    res.json({
      success: true,
      data: { property }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Update property failed', { error: error.message, propertyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to update property'
    })
  }
})

// Delete property
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    if (existingProperty.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this property'
      })
    }

    await prisma.property.delete({
      where: { id }
    })

    logger.info('Property deleted', { propertyId: id, userId: req.user!.userId })

    res.json({
      success: true,
      message: 'Property deleted successfully'
    })
  } catch (error: any) {
    logger.error('Delete property failed', { error: error.message, propertyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to delete property'
    })
  }
})

export default router