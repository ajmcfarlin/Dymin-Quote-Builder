'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Ticket {
  id: number
  summary: string
  client_name: string
  status_name: string
  date_occurred: string
  child_ids?: number[]
  [key: string]: any
}

interface TicketResponse {
  success: boolean
  message: string
  data?: any
  tickets?: Ticket[]
  totalCount?: number
  error?: string
}

export function HaloPSATicketExplorer() {
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [ticketDetails, setTicketDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async (options: {
    count?: number
    includeChildIds?: boolean
    openOnly?: boolean
    search?: string
  } = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.count) params.append('count', options.count.toString())
      if (options.includeChildIds) params.append('includeChildIds', 'true')
      if (options.openOnly) params.append('openOnly', 'true')
      if (options.search) params.append('search', options.search)

      const response = await fetch(`/api/halopsa/tickets?${params.toString()}`)
      const data: TicketResponse = await response.json()

      if (data.success) {
        setTickets(data.tickets || [])
        console.log('Fetched tickets:', data)
      } else {
        setError(data.error || 'Failed to fetch tickets')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketDetails = async (ticketId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/halopsa/tickets/${ticketId}?includeDetails=true&includeLastAction=true`)
      const data: TicketResponse = await response.json()

      if (data.success) {
        setTicketDetails(data.data)
        setSelectedTicket(ticketId)
        console.log('Fetched ticket details:', data.data)
      } else {
        setError(data.error || 'Failed to fetch ticket details')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HaloPSA Ticket Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchTickets({ count: 10, includeChildIds: true })}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Loading...' : 'Get Recent Tickets'}
            </button>
            
            <button
              onClick={() => fetchTickets({ count: 10, openOnly: true, includeChildIds: true })}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Get Open Tickets Only
            </button>

            <button
              onClick={() => fetchTickets({ count: 20, includeChildIds: true })}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Get More Tickets (20)
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="font-medium text-red-800">❌ Error</div>
              <p className="text-sm mt-1 text-red-700">{error}</p>
            </div>
          )}

          {/* Tickets List */}
          {tickets.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Tickets ({tickets.length})</h3>
              <div className="max-h-64 overflow-y-auto border rounded">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => fetchTicketDetails(ticket.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">#{ticket.id} - {ticket.summary || 'No summary'}</div>
                        <div className="text-sm text-gray-600">
                          Client: {ticket.client_name || 'N/A'} | Status: {ticket.status_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Date: {formatDate(ticket.date_occurred)}
                          {ticket.child_ids && ticket.child_ids.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {ticket.child_ids.length} child tickets
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Click for details
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details */}
      {ticketDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Ticket #{selectedTicket} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Summary:</strong> {ticketDetails.summary || 'N/A'}
                </div>
                <div>
                  <strong>Client:</strong> {ticketDetails.client_name || 'N/A'}
                </div>
                <div>
                  <strong>Status:</strong> {ticketDetails.status_name || 'N/A'}
                </div>
                <div>
                  <strong>Priority:</strong> {ticketDetails.priority_name || 'N/A'}
                </div>
                <div>
                  <strong>Assigned Agent:</strong> {ticketDetails.agent_name || 'Unassigned'}
                </div>
                <div>
                  <strong>Request Type:</strong> {ticketDetails.requesttype_name || 'N/A'}
                </div>
              </div>

              {/* Child Tickets */}
              {ticketDetails.child_ids && ticketDetails.child_ids.length > 0 && (
                <div>
                  <strong>Child Tickets:</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ticketDetails.child_ids.map((childId: number) => (
                      <button
                        key={childId}
                        onClick={() => fetchTicketDetails(childId)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm"
                      >
                        #{childId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              {ticketDetails.details && (
                <div>
                  <strong>Details:</strong>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                    {ticketDetails.details}
                  </div>
                </div>
              )}

              {/* Raw Data (Expandable) */}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Raw Ticket Data (Click to expand)</summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(ticketDetails, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}