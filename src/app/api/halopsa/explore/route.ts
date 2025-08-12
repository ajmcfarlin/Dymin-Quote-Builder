import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function POST(request: NextRequest) {
  try {
    const { endpoint, options } = await request.json()
    
    if (!endpoint) {
      return NextResponse.json({
        success: false,
        message: 'Endpoint is required'
      }, { status: 400 })
    }

    console.log(`Exploring HaloPSA endpoint: ${endpoint}`, options)
    
    let data
    switch (endpoint) {
      case '/RequestType':
        data = await haloPSA.getRequestTypes()
        break
      case '/TicketType':
        data = await haloPSA.getTicketTypes(options || {})
        break
      case '/Workflow':
        data = await haloPSA.getWorkflows()
        break
      case '/SLA':
        data = await haloPSA.getSLAs()
        break
      case '/Item':
        data = await haloPSA.getItems()
        break
      default:
        // Try generic API call for other endpoints
        data = await haloPSA.makeApiRequest(endpoint)
        break
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully retrieved data from ${endpoint}`,
      data: data
    })
  } catch (error) {
    console.error('Template exploration error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to explore endpoint',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}