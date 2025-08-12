import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/halopsa/sync-teams - Starting team/agent sync...')
    
    const syncResult = await haloPSA.syncTeamAgentCosts()
    
    return NextResponse.json({
      success: true,
      message: 'Team and agent sync completed successfully',
      data: syncResult
    })
  } catch (error) {
    console.error('Team sync API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to sync teams and agents'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/halopsa/sync-teams - Getting teams with agents...')
    
    // Get teams with their agents
    const teamsResult = await haloPSA.getTeamsWithAgents({
      includeAllTeams: true,
      includeTicketCounts: true
    })
    
    return NextResponse.json({
      success: true,
      message: 'Teams with agents retrieved successfully',
      data: teamsResult
    })
  } catch (error) {
    console.error('Get teams API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to get teams with agents'
    }, { status: 500 })
  }
}