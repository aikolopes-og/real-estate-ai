import { NextRequest, NextResponse } from 'next/server'
import { logger } from '../../../utils/logger'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    const headers: HeadersInit = {}
    if (authorization) {
      headers['Authorization'] = authorization
    }

    // Backend exposes /api/auth/me
    const apiResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers,
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return NextResponse.json(data, { status: apiResponse.status })
    }

  // Pass-through the wrapped response
  return NextResponse.json(data)
  } catch (error) {
    logger.error('Get user proxy error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}