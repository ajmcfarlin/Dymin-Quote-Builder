import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/halopsa/sync-service-hours - Starting service hours sync...')
    
    const syncResult = await haloPSA.syncServiceHours()
    
    return NextResponse.json({
      success: true,
      message: 'Service hours sync completed successfully',
      data: syncResult
    })
  } catch (error) {
    console.error('Service hours sync API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to sync service hours'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/halopsa/sync-service-hours - Getting templates...')
    
    // Get templates only (no sync to database)
    const templatesResult = await haloPSA.getTemplates()
    
    return NextResponse.json({
      success: true,
      message: 'Templates retrieved successfully',
      data: templatesResult
    })
  } catch (error) {
    console.error('Get templates API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to get templates'
    }, { status: 500 })
  }
}