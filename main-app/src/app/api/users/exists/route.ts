import { NextRequest, NextResponse } from 'next/server'
import { logger } from '../../../../utils/logger'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const apiResponse = await fetch(`${API_BASE_URL}/users/exists?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return NextResponse.json(data, { status: apiResponse.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Email check proxy error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}