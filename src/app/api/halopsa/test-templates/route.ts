import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function POST(request: NextRequest) {
  try {
    const { action, templateId, templateIds } = await request.json()
    
    console.log(`Testing HaloPSA template approach: ${action}`)
    
    if (action === 'test-basic-creation') {
      // Test creating a basic ticket first to verify format
      const result = await haloPSA.testBasicTicketCreation()
      
      return NextResponse.json({
        success: true,
        message: 'Basic ticket creation test completed',
        data: result
      })
    }

    if (action === 'test-template-46') {
      // Test creating a ticket with template ID 46 from the URL
      const result = await haloPSA.testTemplate46Creation()
      
      return NextResponse.json({
        success: true,
        message: 'Template 46 creation test completed',
        data: result
      })
    }

    if (action === 'test-child-template-46-only') {
      // Test creating a ticket with ONLY child_template_id 46
      const result = await haloPSA.testChildTemplate46Only()
      
      return NextResponse.json({
        success: true,
        message: 'Child template 46 only test completed',
        data: result
      })
    }

    if (action === 'test-direct-quote') {
      // Test creating a quote without a ticket_id
      const result = await haloPSA.testDirectQuoteCreation()
      
      return NextResponse.json({
        success: true,
        message: 'Direct quote creation test completed',
        data: result
      })
    }
    
    if (action === 'test-single-template') {
      // Test creating a ticket with a specific template ID
      const result = await haloPSA.testTemplateCreation(templateId)
      
      return NextResponse.json({
        success: true,
        message: `Template test completed for ID ${templateId}`,
        data: result
      })
    }
    
    if (action === 'test-multiple-templates') {
      // Test multiple template IDs to see which ones exist
      const results = []
      
      for (const id of templateIds || [1, 2, 3, 4, 5]) {
        try {
          const result = await haloPSA.testTemplateCreation(id)
          results.push({
            template_id: id,
            success: true,
            data: result
          })
        } catch (error) {
          results.push({
            template_id: id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Multiple template test completed',
        results: results
      })
    }
    
    if (action === 'test-template-analysis') {
      // Test template ticket creation and analyze what gets populated
      const result = await haloPSA.testTemplateTicketAnalysis(templateId || 1)
      
      return NextResponse.json({
        success: true,
        message: 'Template ticket analysis completed',
        data: result
      })
    }

    if (action === 'discover-templates') {
      // Try to find any existing tickets with template IDs to discover valid template numbers
      const ticketsWithTemplates = await haloPSA.getTickets({ 
        count: 50, 
        includeDetails: true 
      })
      
      const templateIds = new Set()
      const childTemplateIds = new Set()
      
      if (ticketsWithTemplates.tickets) {
        ticketsWithTemplates.tickets.forEach((ticket: any) => {
          if (ticket.template_id && ticket.template_id > 0) {
            templateIds.add(ticket.template_id)
          }
          if (ticket.child_template_id && ticket.child_template_id > 0) {
            childTemplateIds.add(ticket.child_template_id)
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Template discovery completed',
        data: {
          discovered_template_ids: Array.from(templateIds),
          discovered_child_template_ids: Array.from(childTemplateIds),
          total_tickets_analyzed: ticketsWithTemplates.tickets?.length || 0
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action specified'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Template testing error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}