import { NextResponse } from 'next/server'
import { logger } from '../../../utils/logger'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function GET() {
  try {
    const apiResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return NextResponse.json(data, { status: apiResponse.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Health check proxy error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}