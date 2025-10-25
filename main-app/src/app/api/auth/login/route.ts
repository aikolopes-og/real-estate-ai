import { NextRequest, NextResponse } from 'next/server'
import { logger } from '../../../../utils/logger'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    // Accept either formData (from older clients) or JSON
    let body: any
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    }

    const apiResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return NextResponse.json(data, { status: apiResponse.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Login proxy error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}