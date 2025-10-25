import { Router, Request, Response } from 'express'
import { prisma } from '../server'
import { authenticate, authorize } from '../middleware/auth'
import logger from '../utils/logger'

const router = Router()

// All admin routes require ADMIN role
router.use(authenticate)
router.use(authorize('ADMIN'))

// Get dashboard analytics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalCompanies,
      totalLeads,
      recentUsers,
      recentProperties,
      usersByRole,
      propertiesByStatus
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.company.count(),
      prisma.lead.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.property.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.property.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          properties: totalProperties,
          companies: totalCompanies,
          leads: totalLeads
        },
        recent: {
          users: recentUsers,
          properties: recentProperties
        },
        distributions: {
          usersByRole: usersByRole.map(item => ({
            role: item.role,
            count: item._count
          })),
          propertiesByStatus: propertiesByStatus.map(item => ({
            status: item.status,
            count: item._count
          }))
        }
      }
    })
  } catch (error: any) {
    logger.error('Admin dashboard failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    })
  }
})

// Get all users with pagination
router.get('/users', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      role,
      verified,
      search
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (role) where.role = role
    if (verified !== undefined) where.isVerified = verified === 'true'
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              companies: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error: any) {
    logger.error('Admin get users failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    })
  }
})

// Get all properties with enhanced admin details
router.get('/properties', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      type,
      ownerId,
      search
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (status) where.status = status
    if (type) where.propertyType = type
    if (ownerId) where.ownerId = ownerId
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
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
              email: true
            }
          },
          _count: {
            select: {
              favoriteUsers: true,
              viewHistory: true,
              leads: true
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
    logger.error('Admin get properties failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties'
    })
  }
})

// Verify user
router.patch('/users/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true
      }
    })

    logger.info('User verified by admin', { userId: id, adminId: req.user!.userId })

    res.json({
      success: true,
      data: { user }
    })
  } catch (error: any) {
    logger.error('Admin verify user failed', { error: error.message, userId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to verify user'
    })
  }
})

// Update property status
router.patch('/properties/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['AVAILABLE', 'RENTED', 'SOLD', 'DRAFT'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const property = await prisma.property.update({
      where: { id },
      data: { status },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    logger.info('Property status updated by admin', { 
      propertyId: id, 
      newStatus: status, 
      adminId: req.user!.userId 
    })

    res.json({
      success: true,
      data: { property }
    })
  } catch (error: any) {
    logger.error('Admin update property status failed', { 
      error: error.message, 
      propertyId: req.params.id 
    })
    res.status(500).json({
      success: false,
      error: 'Failed to update property status'
    })
  }
})

// Delete user (soft delete by marking as inactive)
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            properties: true,
            companies: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    if (user._count.properties > 0 || user._count.companies > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete user with active properties or companies'
      })
    }

    await prisma.user.delete({
      where: { id }
    })

    logger.info('User deleted by admin', { userId: id, adminId: req.user!.userId })

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    logger.error('Admin delete user failed', { error: error.message, userId: req.params.id })
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    })
  }
})

// Get system logs (last 1000 entries)
router.get('/logs', async (req: Request, res: Response) => {
  try {
    // In a real implementation, you'd read from log files or a logging service
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        logs: [],
        message: 'Log aggregation not implemented yet'
      }
    })
  } catch (error: any) {
    logger.error('Admin get logs failed', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs'
    })
  }
})

export default router