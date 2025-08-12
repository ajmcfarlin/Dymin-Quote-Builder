'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TemplateExplorerResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export function HaloPSATemplateExplorer() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{[key: string]: any}>({})
  const [error, setError] = useState<string | null>(null)

  const exploreEndpoint = async (endpoint: string, label: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Exploring ${endpoint}...`)
      
      // Direct API call to our HaloPSA client
      const response = await fetch('/api/halopsa/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          [label]: data.data
        }))
        console.log(`${label} data:`, data.data)
      } else {
        setError(data.error || `Failed to fetch ${label}`)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const findHoursInData = (data: any, path: string = ''): string[] => {
    const hoursFields: string[] = []
    
    if (!data || typeof data !== 'object') return hoursFields

    const searchInObject = (obj: any, currentPath: string) => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          searchInObject(item, `${currentPath}[${index}]`)
        })
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key
          const value = obj[key]
          
          // Check if field name suggests it contains hours/time
          if (key.toLowerCase().includes('hour') || 
              key.toLowerCase().includes('time') || 
              key.toLowerCase().includes('duration') ||
              key.toLowerCase().includes('estimate') ||
              key.toLowerCase().includes('sla')) {
            hoursFields.push(`${newPath}: ${JSON.stringify(value)}`)
          }
          
          // Recurse into nested objects
          if (typeof value === 'object' && value !== null) {
            const nestedHours = findHoursInData(value, newPath)
            hoursFields.push(...nestedHours)
          }
        })
      }
    }

    searchInObject(data, path)
    return hoursFields
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HaloPSA Template & Hours Explorer</CardTitle>
        <p className="text-sm text-gray-600">
          Explore different HaloPSA endpoints to find where template hours are stored
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exploration Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => exploreEndpoint('/RequestType', 'Request Types')}
            disabled={loading}
            className={`px-3 py-2 text-sm rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Request Types
          </button>
          
          <button
            onClick={() => exploreEndpoint('/TicketType', 'Ticket Types')}
            disabled={loading}
            className={`px-3 py-2 text-sm rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Ticket Types
          </button>

          <button
            onClick={() => exploreEndpoint('/Workflow', 'Workflows')}
            disabled={loading}
            className={`px-3 py-2 text-sm rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Workflows
          </button>

          <button
            onClick={() => exploreEndpoint('/SLA', 'SLAs')}
            disabled={loading}
            className={`px-3 py-2 text-sm rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            SLAs
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Exploring HaloPSA endpoints...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="font-medium text-red-800">❌ Error</div>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Exploration Results</h3>
            
            {Object.entries(results).map(([label, data]) => {
              const hoursFields = findHoursInData(data)
              
              return (
                <div key={label} className="border rounded-lg p-4">
                  <h4 className="font-medium text-base mb-2">{label}</h4>
                  
                  {/* Hours/Time Fields Found */}
                  {hoursFields.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-green-800 mb-2">
                        🎯 Potential Hours/Time Fields Found:
                      </div>
                      <div className="bg-green-50 p-3 rounded text-sm">
                        {hoursFields.map((field, index) => (
                          <div key={index} className="font-mono text-xs mb-1">
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="text-sm text-gray-600 mb-2">
                    {Array.isArray(data) ? `Found ${data.length} items` : 'Single object'}
                    {hoursFields.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {hoursFields.length} time-related fields
                      </span>
                    )}
                  </div>

                  {/* Raw Data (Expandable) */}
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">
                      Raw Data (Click to expand)
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </details>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4">
          <p><strong>Goal:</strong> Find where HaloPSA stores template hours for child templates</p>
          <p><strong>Looking for:</strong> Fields containing time estimates, duration, hours, or SLA times</p>
        </div>
      </CardContent>
    </Card>
  )
}