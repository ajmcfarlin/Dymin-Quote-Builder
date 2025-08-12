import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const options = {
      count: searchParams.get('count') ? parseInt(searchParams.get('count')!) : 10,
      includeDetails: searchParams.get('includeDetails') === 'true',
      includeChildIds: searchParams.get('includeChildIds') === 'true',
      clientId: searchParams.get('clientId') ? parseInt(searchParams.get('clientId')!) : undefined,
      openOnly: searchParams.get('openOnly') === 'true',
      search: searchParams.get('search') || undefined
    }

    console.log('Fetching tickets with options:', options)
    
    const ticketsResponse = await haloPSA.getTickets(options)
    
    return NextResponse.json({
      success: true,
      message: `Retrieved ${ticketsResponse.record_count || ticketsResponse.tickets?.length || 0} tickets`,
      data: ticketsResponse,
      totalCount: ticketsResponse.record_count,
      tickets: ticketsResponse.tickets || []
    })
  } catch (error) {
    console.error('Tickets API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}