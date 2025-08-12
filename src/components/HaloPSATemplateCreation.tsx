'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TemplateTestResult {
  template_id: number
  success: boolean
  data?: any
  error?: string
}

export function HaloPSATemplateCreation() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const discoverTemplates = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('Discovering template IDs from existing tickets...')
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'discover-templates' })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.data)
        console.log('Template discovery results:', data.data)
      } else {
        setError(data.error || 'Failed to discover templates')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testTemplateCreation = async (templateIds: number[]) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing template creation with IDs:', templateIds)
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-multiple-templates',
          templateIds: templateIds
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          creation_test_results: data.results
        }))
        console.log('Template creation test results:', data.results)
      } else {
        setError(data.error || 'Failed to test template creation')
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
      console.log('Testing template 46 creation...')
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-template-46'
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          template_46_result: data.data
        }))
        console.log('Template 46 creation result:', data.data)
      } else {
        setError(data.error || 'Failed to test template 46')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testChildTemplate46Only = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing child template 46 only...')
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-child-template-46-only'
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          child_template_46_result: data.data
        }))
        console.log('Child template 46 only result:', data.data)
      } else {
        setError(data.error || 'Failed to test child template 46 only')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testDirectQuote = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing direct quote creation without ticket...')
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-direct-quote'
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          direct_quote_result: data.data
        }))
        console.log('Direct quote creation result:', data.data)
      } else {
        setError(data.error || 'Failed to test direct quote creation')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testBasicCreation = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing basic ticket creation (no template)...')
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-basic-creation'
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          basic_creation_result: data.data
        }))
        console.log('Basic ticket creation result:', data.data)
      } else {
        setError(data.error || 'Failed to test basic creation')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testTemplateAnalysis = async () => {
    const templateId = 1
    
    setLoading(true)
    setError(null)

    try {
      console.log('Testing template analysis with template:', templateId)
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-template-analysis',
          templateId: templateId
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          analysis_result: data.data
        }))
        console.log('Template analysis result:', data.data)
      } else {
        setError(data.error || 'Failed to test template analysis')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testSingleTemplate = async () => {
    const templateId = 1 // Start with template ID 1
    
    setLoading(true)
    setError(null)

    try {
      console.log('Testing single template creation with ID:', templateId)
      
      const response = await fetch('/api/halopsa/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-single-template',
          templateId: templateId
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(prev => ({
          ...prev,
          single_test_result: data.data
        }))
        console.log('Single template test result:', data.data)
      } else {
        setError(data.error || 'Failed to test single template')
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
        <CardTitle>HaloPSA Template Creation Testing</CardTitle>
        <p className="text-sm text-gray-600">
          Test the template system through ticket creation API - this could be the missing piece!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={discoverTemplates}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : 'Discover Template IDs'}
          </button>
          
          <button
            onClick={testBasicCreation}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {loading ? 'Loading...' : 'Test Basic Creation'}
          </button>

          <button
            onClick={testTemplate46}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? 'Loading...' : 'Test Template 46'}
          </button>

          <button
            onClick={testChildTemplate46Only}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }`}
          >
            {loading ? 'Loading...' : 'Child Template 46 Only'}
          </button>

          <button
            onClick={testDirectQuote}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {loading ? 'Loading...' : 'Test Direct Quote'}
          </button>
          
          <button
            onClick={testTemplateAnalysis}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {loading ? 'Loading...' : 'Analyze Template Fields'}
          </button>

          <button
            onClick={testSingleTemplate}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Loading...' : 'Test Template Creation'}
          </button>
          
          {results?.discovered_template_ids?.length > 0 && (
            <button
              onClick={() => testTemplateCreation(results.discovered_template_ids)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? 'Loading...' : 'Test Discovered Templates'}
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Testing templates...</p>
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
        {results && (
          <div className="space-y-4">
            {/* Template Discovery Results */}
            {results.discovered_template_ids && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🎯 Template Discovery Results</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Template IDs found:</strong> 
                    {results.discovered_template_ids.length > 0 
                      ? ` ${results.discovered_template_ids.join(', ')}`
                      : ' None found'
                    }
                  </div>
                  <div>
                    <strong>Child Template IDs found:</strong> 
                    {results.discovered_child_template_ids.length > 0 
                      ? ` ${results.discovered_child_template_ids.join(', ')}`
                      : ' None found'
                    }
                  </div>
                  <div>
                    <strong>Tickets analyzed:</strong> {results.total_tickets_analyzed}
                  </div>
                </div>
              </div>
            )}

            {/* Basic Creation Test Result */}
            {results.basic_creation_result && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">🎫 Basic Ticket Creation Test</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-700">
                    View Created Ticket Data (No Template)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.basic_creation_result, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Template 46 Test Result */}
            {results.template_46_result && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">🎯 Template 46 Test (Both IDs)</h3>
                <div className="text-sm mb-2">
                  Testing template_id: 46 AND child_template_id: 46
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-red-700">
                    View Template 46 Ticket Data (Look for populated fields!)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.template_46_result, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Child Template 46 Only Test Result */}
            {results.child_template_46_result && (
              <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                <h3 className="font-semibold text-pink-800 mb-2">👶 Child Template 46 Only Test</h3>
                <div className="text-sm mb-2">
                  Testing ONLY child_template_id: 46 (no template_id)
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-pink-700">
                    View Child Template Only Ticket Data
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.child_template_46_result, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Direct Quote Test Result */}
            {results.direct_quote_result && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">💰 Direct Quote Test (No Ticket)</h3>
                <div className="text-sm mb-2">
                  Testing quote creation without ticket_id - normal workflow?
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-yellow-700">
                    View Direct Quote Data
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.direct_quote_result, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Template Analysis Result */}
            {results.analysis_result && (
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">
                  🔍 Template Field Analysis
                  {results.analysis_result.analysis_success ? ' ✅' : ' ❌'}
                </h3>
                
                {results.analysis_result.analysis_success ? (
                  <div className="space-y-3">
                    <div className="text-sm grid grid-cols-2 gap-4">
                      <div>
                        <strong>Template ID:</strong> {results.analysis_result.template_id}<br/>
                        <strong>Ticket ID:</strong> {results.analysis_result.ticket_id}<br/>
                        <strong>Has Estimate:</strong> {results.analysis_result.has_estimate ? '✅ Yes' : '❌ No'}<br/>
                        <strong>Workflow ID:</strong> {results.analysis_result.workflow_id || 'None'}
                      </div>
                      <div>
                        <strong>Template Analysis:</strong><br/>
                        • Template ID Set: {results.analysis_result.template_analysis.template_id_set ? '✅' : '❌'}<br/>
                        • Estimate Populated: {results.analysis_result.template_analysis.estimate_populated ? '✅' : '❌'}<br/>
                        • Workflow Assigned: {results.analysis_result.template_analysis.workflow_assigned ? '✅' : '❌'}<br/>
                        • Custom Fields: {results.analysis_result.template_analysis.custom_fields_count}
                      </div>
                    </div>
                    
                    {Object.keys(results.analysis_result.time_related_fields).length > 0 && (
                      <div className="p-2 bg-green-100 rounded">
                        <strong className="text-green-800">⏱️ Time-Related Fields Found:</strong>
                        <pre className="text-xs mt-1">
                          {JSON.stringify(results.analysis_result.time_related_fields, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {Object.keys(results.analysis_result.template_fields).length > 0 && (
                      <div className="p-2 bg-blue-100 rounded">
                        <strong className="text-blue-800">📋 Template Fields Found:</strong>
                        <pre className="text-xs mt-1">
                          {JSON.stringify(results.analysis_result.template_fields, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-orange-700">
                        View Full Ticket Data
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                        {JSON.stringify(results.analysis_result.ticket_details, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="text-sm text-red-700">
                    Error: {results.analysis_result.error}
                  </div>
                )}
              </div>
            )}

            {/* Single Template Test Result */}
            {results.single_test_result && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Single Template Test</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-700">
                    View Created Ticket Data (With Template)
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64 border">
                    {JSON.stringify(results.single_test_result, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Multiple Template Creation Results */}
            {results.creation_test_results && (
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">🧪 Template Creation Tests</h3>
                <div className="space-y-2">
                  {results.creation_test_results.map((result: TemplateTestResult) => (
                    <div 
                      key={result.template_id} 
                      className={`p-2 rounded text-sm ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="font-medium">
                        Template ID {result.template_id}: {result.success ? '✅ Success' : '❌ Failed'}
                      </div>
                      {result.success && result.data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer">View created ticket</summary>
                          <pre className="mt-1 p-1 bg-white rounded text-xs overflow-auto max-h-32 border">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {!result.success && result.error && (
                        <div className="text-xs mt-1">Error: {result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p><strong>Strategy:</strong> If template_id is accepted in ticket creation, templates must exist!</p>
          <p><strong>Step 1:</strong> Discover existing template IDs from ticket data</p>
          <p><strong>Step 2:</strong> Test creating tickets with those template IDs</p>
          <p><strong>Expected:</strong> Template should auto-populate fields like estimate, workflow_id, etc.</p>
        </div>
      </CardContent>
    </Card>
  )
}