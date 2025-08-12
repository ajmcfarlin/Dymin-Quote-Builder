import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/halopsa/pax8details - Fetching Pax8 details...')
    
    const pax8Details = await haloPSA.getPax8Details()
    
    return NextResponse.json({
      success: true,
      message: 'Pax8 details fetched successfully',
      data: pax8Details
    })
  } catch (error) {
    console.error('Pax8Details API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch Pax8 details'
    }, { status: 500 })
  }
}