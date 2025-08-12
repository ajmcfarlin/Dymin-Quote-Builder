'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  success: boolean
  message: string
  clientCount?: number
  sampleClient?: any
  error?: string
}

export function HaloPSATest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/halopsa/test')
      const data: TestResult = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HaloPSA API Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          onClick={testConnection}
          disabled={testing}
          className={`px-4 py-2 rounded-lg font-medium ${
            testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? 'Testing...' : 'Test HaloPSA Connection'}
        </button>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Success' : '❌ Failed'}
            </div>
            <p className={`text-sm mt-1 ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>
            
            {result.success && result.clientCount !== undefined && (
              <div className="mt-2 text-sm text-green-700">
                <p>Found {result.clientCount} clients in HaloPSA</p>
                {result.sampleClient && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Sample client data</summary>
                    <pre className="mt-1 p-2 bg-green-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result.sampleClient, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            {result.error && (
              <p className="text-sm mt-2 text-red-600 font-mono">
                Error: {result.error}
              </p>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p className="font-medium">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file with your HaloPSA credentials</li>
            <li>Set <code className="bg-gray-100 px-1 rounded">HALOPSA_BASE_URL</code> to your HaloPSA instance URL</li>
            <li>Add your <code className="bg-gray-100 px-1 rounded">HALOPSA_CLIENT_ID</code> and <code className="bg-gray-100 px-1 rounded">HALOPSA_CLIENT_SECRET</code></li>
            <li>If using hosted solution, add <code className="bg-gray-100 px-1 rounded">HALOPSA_TENANT_ID</code></li>
            <li>Click the test button to verify the connection</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}