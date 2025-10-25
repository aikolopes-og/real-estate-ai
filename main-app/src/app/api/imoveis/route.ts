import { NextResponse } from 'next/server'
import { logger } from '../../../utils/logger'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Construir query string para o novo endpoint de busca
    const queryString = searchParams.toString()
    const url = `${API_BASE_URL}/api/search${queryString ? `?${queryString}` : ''}`
    
    console.log('API route: Fetching from search endpoint:', url)
    
    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const responseData = await apiResponse.json()
    console.log('API route: Backend response:', responseData)

    if (!apiResponse.ok) {
      return NextResponse.json(responseData, { status: apiResponse.status })
    }

    // Retornar dados formatados
    return NextResponse.json(responseData)
  } catch (error) {
    logger.error('Imoveis proxy error', { error })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}