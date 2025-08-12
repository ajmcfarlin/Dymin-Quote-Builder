import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id)
    
    if (isNaN(ticketId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid ticket ID'
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    
    const options = {
      includeDetails: searchParams.get('includeDetails') === 'true',
      includeLastAction: searchParams.get('includeLastAction') === 'true'
    }

    console.log(`Fetching ticket ${ticketId} with options:`, options)
    
    const ticket = await haloPSA.getTicket(ticketId, options)
    
    return NextResponse.json({
      success: true,
      message: `Retrieved ticket ${ticketId}`,
      data: ticket
    })
  } catch (error) {
    console.error('Ticket detail API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch ticket details',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}