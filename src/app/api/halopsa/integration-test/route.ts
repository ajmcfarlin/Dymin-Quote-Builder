import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    console.log(`Testing HaloPSA integration: ${action}`)
    
    if (action === 'get-templates') {
      // Get all templates with their hours and costs
      const templates = await haloPSA.getTemplates()
      
      return NextResponse.json({
        success: true,
        message: 'Templates retrieved successfully',
        data: templates
      })
    }

    if (action === 'get-template-46') {
      // Get specific template 46 with detailed child values
      const template = await haloPSA.getTemplate46Details()
      
      return NextResponse.json({
        success: true,
        message: 'Template 46 details retrieved successfully',
        data: template
      })
    }
    
    if (action === 'get-agents') {
      // Get actual agents/employees for labor rates
      const agents = await haloPSA.getAgents(20)
      
      return NextResponse.json({
        success: true,
        message: 'Agents retrieved successfully',
        data: agents
      })
    }
    
    if (action === 'get-items') {
      // Get items for costs
      const items = await haloPSA.getItems(20)
      
      return NextResponse.json({
        success: true,
        message: 'Items retrieved successfully',
        data: items
      })
    }
    
    if (action === 'create-quote') {
      // Create a test quote
      const quote = await haloPSA.testDirectQuoteCreation()
      
      return NextResponse.json({
        success: true,
        message: 'Quote created successfully',
        data: quote
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action specified'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Integration test error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Integration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}