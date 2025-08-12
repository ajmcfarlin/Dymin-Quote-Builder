'use client'

import React from 'react'
import { FixedCostTool, VariableCostTool, MonthlyServicesData } from '@/types/monthlyServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlyServicesSelectorProps {
  monthlyServices: MonthlyServicesData
  onChange: (services: MonthlyServicesData) => void
}

export function MonthlyServicesSelector({ monthlyServices, onChange }: MonthlyServicesSelectorProps) {
  const toggleFixedTool = (toolId: string) => {
    const updatedTools = monthlyServices.fixedCostTools.map(tool =>
      tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
    )
    onChange({ ...monthlyServices, fixedCostTools: updatedTools })
  }

  const toggleVariableTool = (toolId: string) => {
    const updatedTools = monthlyServices.variableCostTools.map(tool =>
      tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
    )
    onChange({ ...monthlyServices, variableCostTools: updatedTools })
  }

  const updateVariableToolUnits = (toolId: string, units: number) => {
    const updatedTools = monthlyServices.variableCostTools.map(tool =>
      tool.id === toolId ? { 
        ...tool, 
        nodesUnitsSupported: units,
        // TODO: Recalculate extended costs/prices based on formulas
        extendedCost: tool.costPerNodeUnit ? units * tool.costPerNodeUnit : (tool.costPerCustomer || 0),
        extendedPrice: tool.pricePerNodeUnit ? units * tool.pricePerNodeUnit : 0
      } : tool
    )
    onChange({ ...monthlyServices, variableCostTools: updatedTools })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  const activeFixedTools = monthlyServices.fixedCostTools.filter(tool => tool.isActive)
  const activeVariableTools = monthlyServices.variableCostTools.filter(tool => tool.isActive)

  const totalFixedCost = activeFixedTools.reduce((sum, tool) => sum + tool.extendedPrice, 0)
  const totalVariableCost = activeVariableTools.reduce((sum, tool) => sum + tool.extendedPrice, 0)

  return (
    <div className="space-y-6">
      {/* Fixed Cost Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle>Fixed Cost Tools</CardTitle>
          <p className="text-sm text-gray-600">Service management tools with amortized costs across customers</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {monthlyServices.fixedCostTools.map((tool) => (
              <label key={tool.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={tool.isActive}
                    onChange={() => toggleFixedTool(tool.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    tool.isActive 
                      ? 'border-gray-300 hover:border-gray-400' 
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                  style={tool.isActive ? { backgroundColor: '#15bef0', borderColor: '#15bef0' } : {}}>
                    {tool.isActive && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{tool.name}</span>
              </label>
            ))}
          </div>

          {activeFixedTools.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Active Fixed Cost Tools</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalFixedCost)}</div>
                  <div className="text-sm text-gray-600">Total Monthly Fixed Cost</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activeFixedTools.length} tool{activeFixedTools.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variable Cost Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle>Variable Cost Tools</CardTitle>
          <p className="text-sm text-gray-600">Per-device, per-user, or per-customer pricing</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {monthlyServices.variableCostTools.map((tool) => (
              <label key={tool.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={tool.isActive}
                    onChange={() => toggleVariableTool(tool.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    tool.isActive 
                      ? 'border-gray-300 hover:border-gray-400' 
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                  style={tool.isActive ? { backgroundColor: '#15bef0', borderColor: '#15bef0' } : {}}>
                    {tool.isActive && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{tool.name}</span>
              </label>
            ))}
          </div>

          {activeVariableTools.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-4">Active Variable Cost Tools</h4>
              
              <div className="space-y-4 mb-6">
                {activeVariableTools.map((tool) => (
                  <Card key={tool.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Units/Nodes
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tool.nodesUnitsSupported}
                            onChange={(e) => updateVariableToolUnits(tool.id, parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Cost/Unit
                          </label>
                          <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                            {formatCurrency(tool.costPerNodeUnit || tool.costPerCustomer || 0)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Price/Unit
                          </label>
                          <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded">
                            {formatCurrency(tool.pricePerNodeUnit || 0)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Total Cost
                          </label>
                          <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                            {formatCurrency(tool.extendedCost)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Total Price
                          </label>
                          <div className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded border">
                            {formatCurrency(tool.extendedPrice)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Margin
                          </label>
                          <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                            {formatPercent(tool.margin)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalVariableCost)}</div>
                  <div className="text-sm text-gray-600">Total Monthly Variable Cost</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activeVariableTools.length} tool{activeVariableTools.length !== 1 ? 's' : ''} configured
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Summary */}
      {(activeFixedTools.length > 0 || activeVariableTools.length > 0) && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900">{formatCurrency(totalFixedCost + totalVariableCost)}</div>
              <div className="text-lg text-blue-700">Total Monthly Tools & Licensing</div>
              <div className="text-sm text-blue-600 mt-2">
                Fixed: {formatCurrency(totalFixedCost)} + Variable: {formatCurrency(totalVariableCost)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}