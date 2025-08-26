'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Template {
  id: number
  name: string
  [key: string]: any
}

interface TemplateResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export function HaloPSASimpleTemplates() {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchTicketTemplates = async () => {
    setLoading(true)
    setError(null)
    setTemplates([])

    try {
      console.log('Fetching tickets to explore nested template/preset data...')
      
      // Try different approaches to find template data
      const responses = await Promise.all([
        // Get tickets with full details to see nested template data
        fetch('/api/halopsa/tickets?count=10&includeDetails=true&includeChildIds=true'),
        // Try to get a specific ticket with maximum detail
        fetch('/api/halopsa/tickets?count=5&includeDetails=true&ticketidonly=false')
      ])

      const [ticketsResponse, detailedResponse] = await Promise.all(
        responses.map(r => r.json())
      )

      console.log('Tickets response:', ticketsResponse)
      console.log('Detailed response:', detailedResponse)

      // Use the first successful response
      const data = ticketsResponse.success ? ticketsResponse : detailedResponse

      if (data.success) {
        console.log('Raw API response:', data)
        console.log('Total tickets returned:', data.tickets?.length || 0)
        
        // Let's see what all tickets look like first
        const allTickets = data.tickets || []
        console.log('All tickets:', allTickets)
        
        // Check if any tickets have child_ids at all
        const ticketsWithChildrenCheck = allTickets.map((ticket: any) => ({
          id: ticket.id,
          summary: ticket.summary,
          child_ids: ticket.child_ids,
          hasChildren: !!(ticket.child_ids && ticket.child_ids.length > 0)
        }))
        console.log('Child IDs check for all tickets:', ticketsWithChildrenCheck)
        
        // Filter tickets that have child IDs (these might be template-based)
        const ticketsWithChildren = allTickets.filter((ticket: any) => 
          ticket.child_ids && ticket.child_ids.length > 0
        )
        
        console.log('Filtered tickets with children:', ticketsWithChildren)

        // Look for template/preset data in all tickets
        const templateData = allTickets.slice(0, 10).map((ticket: any) => {
          // Search for template-related fields in the ticket
          const templateFields: { key: string; value: any }[] = []
          
          // Common template field names to look for
          const templateKeywords = [
            'template', 'preset', 'workflow', 'process', 'requesttype', 
            'category', 'type', 'sla', 'priority', 'time', 'hour', 'duration'
          ]
          
          // Extract potentially relevant fields
          Object.keys(ticket || {}).forEach(key => {
            const lowerKey = key.toLowerCase()
            if (templateKeywords.some(keyword => lowerKey.includes(keyword))) {
              templateFields.push({ key, value: ticket[key] })
            }
          })

          return {
            id: ticket.id,
            name: ticket.summary || `Ticket #${ticket.id}`,
            requesttype_name: ticket.requesttype_name,
            requesttype_id: ticket.requesttype_id,
            child_count: ticket.child_ids ? ticket.child_ids.length : 0,
            child_ids: ticket.child_ids || [],
            client_name: ticket.client_name,
            status_name: ticket.status_name,
            template_fields: templateFields,
            raw_ticket: ticket,
            debug_note: 'Exploring for nested template/preset data'
          }
        })

        setTemplates(templateData)
        console.log('Ticket template analysis:', templateData)
      } else {
        setError(data.error || 'Failed to fetch tickets')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketTypes = async () => {
    setLoading(true)
    setError(null)
    setTemplates([])

    try {
      console.log('Fetching ticket types (these might be the actual templates)...')
      
      const response = await fetch('/api/halopsa/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: '/TicketType', options: { showcounts: true, showinactive: true } })
      })

      const data: TemplateResponse = await response.json()

      if (data.success) {
        console.log('Raw ticket types response:', data)
        
        // Handle ticket types array
        let ticketTypes = []
        if (Array.isArray(data.data)) {
          ticketTypes = data.data
        } else if (data.data && Array.isArray(data.data.tickettypes)) {
          ticketTypes = data.data.tickettypes
        } else {
          console.log('Unexpected ticket types structure:', data.data)
          ticketTypes = []
        }

        const templateData = ticketTypes.map((ticketType: any) => ({
          id: ticketType.id,
          name: ticketType.name || `Ticket Type #${ticketType.id}`,
          description: ticketType.description,
          is_active: ticketType.is_active,
          ticket_count: ticketType.ticket_count,
          raw_ticket: ticketType,
          debug_note: 'Ticket Type (potential template definition)'
        }))

        setTemplates(templateData)
        console.log('Found ticket types:', templateData)
      } else {
        setError(data.error || 'Failed to fetch ticket types')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    setTemplates([])

    try {
      console.log('Fetching items (service catalog items)...')
      
      const response = await fetch('/api/halopsa/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: '/Item' })
      })

      const data: TemplateResponse = await response.json()

      if (data.success) {
        console.log('Raw items response:', data)
        
        // Handle items array
        let items = []
        if (Array.isArray(data.data)) {
          items = data.data
        } else if (data.data && Array.isArray(data.data.items)) {
          items = data.data.items
        } else {
          console.log('Unexpected items structure:', data.data)
          items = []
        }

        const templateData = items.map((item: any) => ({
          id: item.id,
          name: item.name || `Item #${item.id}`,
          description: item.description,
          internal_reference: item.internal_reference,
          external_reference: item.external_reference,
          item_group: item.item_group,
          price: item.price,
          cost: item.cost,
          raw_ticket: item,
          debug_note: 'Service catalog item (might contain time estimates)'
        }))

        setTemplates(templateData)
        console.log('Found service items:', templateData)
      } else {
        setError(data.error || 'Failed to fetch items')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkflows = async () => {
    setLoading(true)
    setError(null)
    setTemplates([])

    try {
      console.log('Fetching workflows (might contain process templates with hours)...')
      
      const response = await fetch('/api/halopsa/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: '/Workflow' })
      })

      const data: TemplateResponse = await response.json()

      if (data.success) {
        console.log('Raw workflows response:', data)
        
        let workflows = []
        if (Array.isArray(data.data)) {
          workflows = data.data
        } else if (data.data && Array.isArray(data.data.workflows)) {
          workflows = data.data.workflows
        } else {
          console.log('Unexpected workflows structure:', data.data)
          workflows = []
        }

        const templateData = workflows.map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name || `Workflow #${workflow.id}`,
          description: workflow.description,
          steps: workflow.steps,
          raw_ticket: workflow,
          debug_note: 'Workflow (might contain process steps with time estimates)'
        }))

        setTemplates(templateData)
        console.log('Found workflows:', templateData)
      } else {
        setError(data.error || 'Failed to fetch workflows')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplateImprints = async () => {
    setLoading(true)
    setError(null)
    setTemplates([])

    try {
      console.log('Looking for template imprints in ticket data...')
      
      // Get tickets with full details including custom fields
      const ticketsResponse = await fetch('/api/halopsa/tickets?count=30&includeDetails=true')
      const ticketsData = await ticketsResponse.json()

      if (ticketsData.success) {
        console.log('Raw tickets for template analysis:', ticketsData.tickets)
        
        // Analyze tickets for template patterns
        const templateAnalysis = ticketsData.tickets?.map((ticket: any) => {
          const templateImprint = {
            id: ticket.id,
            summary: ticket.summary,
            template_id: ticket.template_id,
            child_template_id: ticket.child_template_id,
            
            // Look for time/hour fields
            time_fields: {} as { [key: string]: any },
            
            // Look for custom fields (potential template data)
            custom_fields: ticket.customfields || {},
            
            // Template-populated standard fields
            standard_fields: {
              priority_id: ticket.priority_id,
              tickettype_id: ticket.tickettype_id,
              category_1: ticket.category_1,
              category_2: ticket.category_2,
              category_3: ticket.category_3,
              category_4: ticket.category_4,
              estimate: ticket.estimate,
              timetaken: ticket.timetaken,
              workflow_id: ticket.workflow_id,
              workflow_step: ticket.workflow_step,
              sla_id: ticket.sla_id
            },
            
            // Project/parent-child relationships
            parent_id: ticket.parent_id,
            child_count: ticket.child_count,
            child_ids: ticket.child_ticket_ids,
            
            // Look for template indicators
            template_indicators: [] as string[]
          }

          // Search for time-related data in all fields
          Object.keys(ticket).forEach(key => {
            const lowerKey = key.toLowerCase()
            const value = ticket[key]
            
            if ((lowerKey.includes('time') || lowerKey.includes('hour') || 
                 lowerKey.includes('estimate') || lowerKey.includes('duration')) && 
                value !== null && value !== undefined && value !== 0) {
              templateImprint.time_fields[key] = value
            }
          })

          // Check if this ticket was likely created from a template
          if (ticket.template_id > 0 || ticket.child_template_id > 0 ||
              ticket.workflow_id > 0 || ticket.parent_id > 0 ||
              (ticket.customfields && Object.keys(ticket.customfields).length > 0)) {
            templateImprint.template_indicators.push('Has template/workflow indicators')
          }

          return templateImprint
        }) || []

        // Filter for tickets that show template patterns
        const templatedTickets = templateAnalysis.filter((ticket: any) => 
          ticket.template_id > 0 || 
          ticket.child_template_id > 0 ||
          ticket.workflow_id > 0 ||
          Object.keys(ticket.time_fields).length > 0 ||
          Object.keys(ticket.custom_fields).length > 0 ||
          ticket.template_indicators.length > 0
        )

        console.log('Template imprint analysis:', templatedTickets)

        if (templatedTickets.length > 0) {
          const templateData = templatedTickets.map((ticket: any) => ({
            id: ticket.id,
            name: `${ticket.summary || `Ticket #${ticket.id}`}`,
            template_id: ticket.template_id,
            child_template_id: ticket.child_template_id,
            time_fields_count: Object.keys(ticket.time_fields).length,
            custom_fields_count: Object.keys(ticket.custom_fields).length,
            raw_ticket: ticket,
            debug_note: `Template imprint found - ${ticket.template_indicators.join(', ')}`
          }))
          
          setTemplates(templateData)
        } else {
          setTemplates([{
            id: 0,
            name: 'No template imprints found',
            debug_note: 'No tickets found with template IDs, custom fields, or time estimates',
            raw_ticket: { total_tickets_analyzed: templateAnalysis.length }
          }])
        }
      } else {
        setError('Failed to fetch tickets for template analysis')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HaloPSA Template Hours - Final Verification</CardTitle>
        <p className="text-sm text-gray-600">
          Exhaustive test of all possible endpoints that might contain template hours
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fetch Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchTicketTemplates}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : 'Explore Ticket Data'}
          </button>
          
          <button
            onClick={fetchTicketTypes}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Loading...' : 'Get Ticket Types'}
          </button>
          
          <button
            onClick={fetchWorkflows}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Loading...' : 'Get Workflows'}
          </button>

          <button
            onClick={fetchTemplateImprints}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {loading ? 'Loading...' : 'Find Template Imprints'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Fetching templates...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="font-medium text-red-800">❌ Error</div>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Templates List */}
        {templates.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Analyzed {templates.length} Tickets for Template Data</h3>
            
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        #{template.id} - {template.name || 'Unnamed Template'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {/* Show key fields for tickets with children */}
                        {template.requesttype_name && <div>Request Type: {template.requesttype_name}</div>}
                        {template.client_name && <div>Client: {template.client_name}</div>}
                        {template.status_name && <div>Status: {template.status_name}</div>}
                        {template.child_count && (
                          <div className="text-blue-600 font-medium">
                            🎯 Child Templates: {template.child_count}
                          </div>
                        )}
                        {template.child_ids && template.child_ids.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Child IDs: {template.child_ids.join(', ')}
                          </div>
                        )}
                        {template.template_id && (
                          <div className="text-xs text-blue-600 font-medium">
                            📋 Template ID: {template.template_id}
                          </div>
                        )}
                        {template.child_template_id && (
                          <div className="text-xs text-purple-600 font-medium">
                            👶 Child Template ID: {template.child_template_id}
                          </div>
                        )}
                        {template.time_fields_count > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            ⏱️ Time fields found: {template.time_fields_count}
                          </div>
                        )}
                        {template.custom_fields_count > 0 && (
                          <div className="text-xs text-orange-600 font-medium">
                            🔧 Custom fields: {template.custom_fields_count}
                          </div>
                        )}
                        {template.debug_note && (
                          <div className="text-xs text-orange-600 font-medium">
                            🐛 {template.debug_note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Raw Data */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600">
                      View Raw Ticket Data (Look for Hours/Time Fields)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(template.raw_ticket || template, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Templates Found */}
        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No parent tickets loaded yet. Click "Find Tickets with Child Templates" to start.</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p><strong>Goal:</strong> Find tickets with child templates that contain hours/time estimates</p>
          <p><strong>Strategy:</strong> Using the Tickets API with <code>includechildids=true</code> to find parent tickets with children</p>
          <p><strong>Look for:</strong> Fields containing "time", "hour", "duration", "estimate" in the raw ticket data</p>
        </div>
      </CardContent>
    </Card>
  )
}