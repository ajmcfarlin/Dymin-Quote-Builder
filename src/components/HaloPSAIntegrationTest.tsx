'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ApiResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export function HaloPSAIntegrationTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  const [error, setError] = useState<string | null>(null)

  const testTemplates = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing templates endpoint...')
      
      const response = await fetch('/api/halopsa/integration-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-templates' })
      })

      const data = await response.json()

      if (data.success) {
        setResults((prev: any) => ({
          ...prev,
          templates: data.data
        }))
        console.log('Templates result:', data.data)
      } else {
        setError(data.error || 'Failed to get templates')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testTemplate46 = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing template 46 details...')
      
      const response = await fetch('/api/halopsa/integration-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-template-46' })
      })

      const data = await response.json()

      if (data.success) {
        setResults((prev: any) => ({
          ...prev,
          template46: data.data
        }))
        console.log('Template 46 result:', data.data)
      } else {
        setError(data.error || 'Failed to get template 46')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testAgents = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing agents endpoint...')
      
      const response = await fetch('/api/halopsa/integration-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-agents' })
      })

      const data = await response.json()

      if (data.success) {
        setResults((prev: any) => ({
          ...prev,
          agents: data.data
        }))
        console.log('Agents result:', data.data)
      } else {
        setError(data.error || 'Failed to get agents')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testItems = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing items endpoint...')
      
      const response = await fetch('/api/halopsa/integration-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-items' })
      })

      const data = await response.json()

      if (data.success) {
        setResults((prev: any) => ({
          ...prev,
          items: data.data
        }))
        console.log('Items result:', data.data)
      } else {
        setError(data.error || 'Failed to get items')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testQuoteCreation = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing quote creation...')
      
      const response = await fetch('/api/halopsa/integration-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-quote' })
      })

      const data = await response.json()

      if (data.success) {
        setResults((prev: any) => ({
          ...prev,
          quote: data.data
        }))
        console.log('Quote creation result:', data.data)
      } else {
        setError(data.error || 'Failed to create quote')
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
        <CardTitle>HaloPSA Integration Test</CardTitle>
        <p className="text-sm text-gray-600">
          Test the core endpoints needed for the quote calculator
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={testTemplates}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : 'Get Templates'}
          </button>

          <button
            onClick={testTemplate46}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            {loading ? 'Loading...' : 'Get Template 46 Details'}
          </button>
          
          <button
            onClick={testAgents}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Loading...' : 'Get Agents'}
          </button>
          
          <button
            onClick={testItems}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Loading...' : 'Get Items'}
          </button>

          <button
            onClick={testQuoteCreation}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {loading ? 'Loading...' : 'Create Quote'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Testing endpoint...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="font-medium text-red-800">❌ Error</div>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {/* Templates */}
            {results.templates && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Templates</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-700">
                    View Templates (with hours and costs!)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.templates, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Template 46 Details */}
            {results.template46 && (
              <div className="p-4 rounded-lg bg-blue-100 border border-blue-300">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 Template 46 Details</h3>
                <div className="text-sm mb-2 text-blue-800">
                  Detailed child template data including costs and time estimates
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-800">
                    View Template 46 Child Values (the 0.39 hours!)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.template46, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Agents */}
            {results.agents && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">👥 Agents</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-700">
                    View Agents (labor rates)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.agents, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Items */}
            {results.items && (
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">🛠️ Items</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-purple-700">
                    View Items (costs)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.items, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Quote Creation */}
            {results.quote && (
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">💰 Quote Created</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-orange-700">
                    View Created Quote
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.quote, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p><strong>Integration Test:</strong> Verify all core endpoints work for the quote calculator</p>
          <p><strong>Templates:</strong> Get template hours and costs directly from HaloPSA</p>
          <p><strong>Agents:</strong> Get labor rates for calculations</p>
          <p><strong>Items:</strong> Get item costs for quotes</p>
          <p><strong>Quotes:</strong> Create quotes directly in HaloPSA</p>
        </div>
      </CardContent>
    </Card>
  )
}