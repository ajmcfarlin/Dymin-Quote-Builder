'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TemplateData {
  halo_id: number
  name: string
  description?: string
  level1_hours: number
  level2_hours: number
  level3_hours: number
  total_hours: number
  category: string
  template_type: string
}

interface SyncResponse {
  success: boolean
  message: string
  data?: {
    processed_analysis: {
      templates: TemplateData[]
      total_templates: number
      templates_with_hours: number
    }
    database_result: {
      templates_saved: number
      sync_log_id: string
      errors: string[]
    }
    sync_timestamp: string
  }
  error?: string
}

export function HaloServiceHoursSync() {
  const [loading, setLoading] = useState(false)
  const [syncData, setSyncData] = useState<SyncResponse['data'] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncServiceHours = async () => {
    setLoading(true)
    setError(null)
    setSyncData(null)

    try {
      const response = await fetch('/api/halopsa/sync-service-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data: SyncResponse = await response.json()
      console.log('Service hours sync response:', data)

      if (data.success && data.data) {
        setSyncData(data.data)
        console.log('Sync completed successfully:', data.data.processed_analysis)
      } else {
        setError(data.error || 'Failed to sync service hours')
      }
    } catch (error) {
      console.error('Error syncing service hours:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatHours = (hours: number) => {
    return hours.toFixed(1) + 'h'
  }

  const getLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-purple-100 text-purple-800'
    }
    const labels = {
      1: 'L1',
      2: 'L2', 
      3: 'L3'
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'General': 'bg-gray-100 text-gray-800',
      'Setup': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-green-100 text-green-800',
      'Project': 'bg-purple-100 text-purple-800',
      'Support': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HaloPSA Service Hours Sync</CardTitle>
        <p className="text-sm text-gray-600">
          Sync service templates and hour estimates from HaloPSA for quote calculations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Button */}
        <button
          onClick={syncServiceHours}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? 'Syncing Service Hours...' : 'Sync Service Hours from HaloPSA'}
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-gray-600">Fetching templates and calculating service hours...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="font-medium text-red-800">❌ Sync Error</div>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Sync Summary */}
        {syncData?.processed_analysis && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">📊 Sync Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-2xl font-bold text-green-600">
                    {syncData.processed_analysis.total_templates}
                  </div>
                  <div className="text-sm text-gray-600">Total Templates</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-2xl font-bold text-blue-600">
                    {syncData.processed_analysis.templates_with_hours}
                  </div>
                  <div className="text-sm text-gray-600">With Hour Estimates</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-2xl font-bold text-purple-600">
                    {syncData.database_result?.templates_saved || 0}
                  </div>
                  <div className="text-sm text-gray-600">Saved to Database</div>
                </div>
              </div>
            </div>

            {/* Templates List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">🛠️ Service Templates</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {syncData.processed_analysis.templates
                  .filter(template => template.total_hours > 0)
                  .map((template) => (
                  <div key={template.halo_id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                          <span className="text-sm text-gray-500">#{template.halo_id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatHours(template.total_hours)}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>

                    {/* Hour breakdown by skill level */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          {getLevelBadge(1)}
                          <span className="text-sm text-gray-600">Junior</span>
                        </div>
                        <div className="font-semibold text-green-800">
                          {formatHours(template.level1_hours)}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          {getLevelBadge(2)}
                          <span className="text-sm text-gray-600">Intermediate</span>
                        </div>
                        <div className="font-semibold text-blue-800">
                          {formatHours(template.level2_hours)}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-2 rounded border border-purple-200">
                        <div className="flex items-center justify-between mb-1">
                          {getLevelBadge(3)}
                          <span className="text-sm text-gray-600">Senior</span>
                        </div>
                        <div className="font-semibold text-purple-800">
                          {formatHours(template.level3_hours)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Templates without hours */}
              {syncData.processed_analysis.templates.filter(t => t.total_hours === 0).length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    View {syncData.processed_analysis.templates.filter(t => t.total_hours === 0).length} templates without hour estimates
                  </summary>
                  <div className="mt-2 space-y-1">
                    {syncData.processed_analysis.templates
                      .filter(template => template.total_hours === 0)
                      .map((template) => (
                      <div key={template.halo_id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                        <span className="text-sm">{template.name}</span>
                        <span className="text-xs text-gray-500">#{template.halo_id}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Database Errors */}
            {syncData.database_result?.errors && syncData.database_result.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <h4 className="font-medium text-yellow-800">⚠️ Database Warnings</h4>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  {syncData.database_result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sync Info */}
            <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
              <p><strong>Last Sync:</strong> {new Date(syncData.sync_timestamp).toLocaleString()}</p>
              <p><strong>Data Source:</strong> HaloPSA /Template endpoint</p>
              <p><strong>Sync Log ID:</strong> {syncData.database_result?.sync_log_id}</p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading && !error && !syncData && (
          <div className="text-center py-8 text-gray-500">
            <p>Click the sync button to fetch service templates and hour estimates from HaloPSA.</p>
            <p className="text-sm mt-2">This will analyze templates and save service hours to the database.</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Fetches all templates from HaloPSA with hour estimates</li>
            <li>Extracts hours from fields like estimate, duration, hours</li>
            <li>Distributes hours across skill levels (L1, L2, L3) based on complexity</li>
            <li>Saves to database for quote calculator integration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}