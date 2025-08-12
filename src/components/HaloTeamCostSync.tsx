'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamData {
  id: number
  name: string
  ticket_count: number
  agents: AgentData[]
  level_costs: {
    level_1: { agents: AgentData[], average_cost: number, count: number }
    level_2: { agents: AgentData[], average_cost: number, count: number }
    level_3: { agents: AgentData[], average_cost: number, count: number }
  }
}

interface AgentData {
  id: number
  name: string
  email?: string
  level: number
  cost_per_hour: number
  is_active: boolean
  team_name: string
}

interface SyncResponse {
  success: boolean
  message: string
  data?: {
    processed_analysis: {
      teams: TeamData[]
      global_averages: {
        level_1: { agents: AgentData[], average_cost: number }
        level_2: { agents: AgentData[], average_cost: number }
        level_3: { agents: AgentData[], average_cost: number }
      }
      total_agents: number
      teams_processed: number
    }
    sync_timestamp: string
  }
  error?: string
}

export function HaloTeamCostSync() {
  const [loading, setLoading] = useState(false)
  const [syncData, setSyncData] = useState<SyncResponse['data'] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncTeamCosts = async () => {
    setLoading(true)
    setError(null)
    setSyncData(null)

    try {
      const response = await fetch('/api/halopsa/sync-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data: SyncResponse = await response.json()
      console.log('Team sync response:', data)

      if (data.success && data.data) {
        setSyncData(data.data)
        console.log('Sync completed successfully:', data.data.processed_analysis)
      } else {
        setError(data.error || 'Failed to sync team costs')
      }
    } catch (error) {
      console.error('Error syncing team costs:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-purple-100 text-purple-800'
    }
    const labels = {
      1: 'Junior',
      2: 'Intermediate',
      3: 'Senior'
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        Level {level} ({labels[level as keyof typeof labels]})
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HaloPSA Team & Agent Cost Sync</CardTitle>
        <p className="text-sm text-gray-600">
          Sync teams and agents from HaloPSA to analyze cost structures by skill level
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Button */}
        <button
          onClick={syncTeamCosts}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Syncing Teams & Agents...' : 'Sync Team Costs from HaloPSA'}
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Fetching teams and calculating cost averages...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="font-medium text-red-800">❌ Sync Error</div>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Global Averages */}
        {syncData?.processed_analysis && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">📊 Global Cost Averages</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(syncData.processed_analysis.global_averages).map(([levelKey, levelData]) => {
                  const level = parseInt(levelKey.split('_')[1])
                  return (
                    <div key={levelKey} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        {getLevelBadge(level)}
                        <span className="text-sm text-gray-600">
                          {levelData.agents.length} agents
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(levelData.average_cost)}/hr
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 text-sm text-blue-700">
                <strong>Total:</strong> {syncData.processed_analysis.total_agents} agents across {syncData.processed_analysis.teams_processed} teams
              </div>
            </div>

            {/* Teams Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">👥 Teams Cost Analysis</h3>
              
              <div className="space-y-3">
                {syncData.processed_analysis.teams.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{team.name}</h4>
                        <div className="text-sm text-gray-600">
                          {team.agents.length} agents • {team.ticket_count} tickets
                        </div>
                      </div>
                    </div>

                    {/* Level breakdown for this team */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      {Object.entries(team.level_costs).map(([levelKey, levelData]) => {
                        const level = parseInt(levelKey.split('_')[1])
                        if (levelData.count === 0) return null
                        
                        return (
                          <div key={levelKey} className="bg-gray-50 p-2 rounded">
                            <div className="flex items-center justify-between mb-1">
                              {getLevelBadge(level)}
                              <span className="text-xs text-gray-600">
                                {levelData.count} agents
                              </span>
                            </div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(levelData.average_cost)}/hr
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Agent list for this team */}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        View {team.agents.length} Team Agents
                      </summary>
                      <div className="mt-2 space-y-1">
                        {team.agents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between py-1 px-2 bg-white rounded border-l-2 border-gray-200">
                            <div>
                              <span className="font-medium">{agent.name}</span>
                              {agent.email && (
                                <span className="text-sm text-gray-500 ml-2">({agent.email})</span>
                              )}
                              {!agent.is_active && (
                                <span className="text-xs text-red-600 ml-2">(Inactive)</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {getLevelBadge(agent.level)}
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(agent.cost_per_hour)}/hr
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Info */}
            <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
              <p><strong>Last Sync:</strong> {new Date(syncData.sync_timestamp).toLocaleString()}</p>
              <p><strong>Data Source:</strong> HaloPSA /Team endpoint with includeagentsforteams</p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading && !error && !syncData && (
          <div className="text-center py-8 text-gray-500">
            <p>Click the sync button to fetch team and agent cost data from HaloPSA.</p>
            <p className="text-sm mt-2">This will analyze all teams and calculate average costs by skill level.</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4 p-3 bg-green-50 rounded border border-green-200">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Fetches all teams and their agents from HaloPSA</li>
            <li>Analyzes agent skill levels (1=Junior, 2=Intermediate, 3=Senior)</li>
            <li>Calculates average hourly costs per level within each team</li>
            <li>Provides global averages across all teams for quote calculations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}