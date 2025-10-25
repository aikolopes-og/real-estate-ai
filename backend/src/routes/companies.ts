import { Router, Request, Response } from 'express'
import { prisma } from '../server'
import { authenticate, authorize } from '../middleware/auth'
import { z } from 'zod'
import logger from '../utils/logger'

const router = Router()

// Company creation schema
const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  type: z.enum(['BROKER']),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  description: z.string().optional()
})

// Update company schema
const updateCompanySchema = createCompanySchema.partial().omit({ type: true })

// Get all companies
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      type,
      verified,
      search
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (type) where.type = type
    if (verified !== undefined) where.isVerified = verified === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          _count: {
            select: {
              properties: true
            }
          }
        }
      }),
      prisma.company.count({ where })
    ])

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    logger.error('Get companies failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies'
    })
  }
})

// Get company by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                brokerRole: true
              }
            }
          }
        },
        properties: {
          where: { status: 'AVAILABLE' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            price: true,
            priceType: true,
            images: true,
            city: true,
            state: true
          }
        },
        _count: {
          select: {
            properties: true
          }
        }
      }
    })

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      })
    }

    res.json({
      success: true,
      data: { company }
    })
  } catch (error: any) {
    logger.error('Get company failed', { error: error.message, companyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company'
    })
  }
})

// Create company
router.post('/', authenticate, authorize('BROKER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const validatedData = createCompanySchema.parse(req.body)

    // Check if license number already exists
    const existingCompany = await prisma.company.findUnique({
      where: { licenseNumber: validatedData.licenseNumber }
    })

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        error: 'Company with this license number already exists'
      })
    }

    // Create company and add creator as DIRECTOR
    const company = await prisma.company.create({
      data: {
        ...validatedData,
        members: {
          create: {
            userId: req.user!.userId,
            role: 'DIRECTOR'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    })

    logger.info('Company created', { companyId: company.id, creatorId: req.user!.userId })

    res.status(201).json({
      success: true,
      data: { company }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Create company failed', { error: error.message, userId: req.user?.userId })
    res.status(500).json({
      success: false,
      error: 'Failed to create company'
    })
  }
})

// Update company
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validatedData = updateCompanySchema.parse(req.body)

    // Check if company exists and user is a DIRECTOR
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId: req.user!.userId }
        }
      }
    })

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      })
    }

    // Check if user is DIRECTOR or ADMIN
    const isDirector = existingCompany.members.some(m => m.role === 'DIRECTOR')
    if (!isDirector && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only company directors can update company information'
      })
    }

    const company = await prisma.company.update({
      where: { id },
      data: validatedData,
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    })

    logger.info('Company updated', { companyId: id, userId: req.user!.userId })

    res.json({
      success: true,
      data: { company }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Update company failed', { error: error.message, companyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to update company'
    })
  }
})

// Delete company
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if company exists and user is DIRECTOR
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId: req.user!.userId }
        },
        _count: {
          select: {
            properties: true
          }
        }
      }
    })

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      })
    }

    // Check if user is DIRECTOR or ADMIN
    const isDirector = existingCompany.members.some(m => m.role === 'DIRECTOR')
    if (!isDirector && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only company directors can delete the company'
      })
    }

    if (existingCompany._count.properties > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete company with active properties'
      })
    }

    await prisma.company.delete({
      where: { id }
    })

    logger.info('Company deleted', { companyId: id, userId: req.user!.userId })

    res.json({
      success: true,
      message: 'Company deleted successfully'
    })
  } catch (error: any) {
    logger.error('Delete company failed', { error: error.message, companyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to delete company'
    })
  }
})

// Verify company (Admin only)
router.patch('/:id/verify', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const company = await prisma.company.update({
      where: { id },
      data: { isVerified: true },
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    logger.info('Company verified', { companyId: id, adminId: req.user!.userId })

    res.json({
      success: true,
      data: { company }
    })
  } catch (error: any) {
    logger.error('Verify company failed', { error: error.message, companyId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to verify company'
    })
  }
})

export default router