'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { QuoteCalculation } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_VARIABLE_COST_TOOLS, calculateToolQuantityFromInfrastructure } from '@/lib/monthlyServices'

interface PricingSummaryProps {
  calculations?: QuoteCalculation
  monthlyServices?: MonthlyServicesData
  onExpandToggle?: (expanded: boolean) => void
  isExpanded?: boolean
  maxHeight?: number | null
}

export function PricingSummary({ calculations, monthlyServices, onExpandToggle, maxHeight }: PricingSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpandToggle?.(newExpanded)
  }

  // Calculate tools costs from infrastructure data even when no monthlyServices data
  const calculateToolsCostsFromInfrastructure = () => {
    if (!calculations?.customer) return 0
    
    const toolsWithQuantities = DEFAULT_VARIABLE_COST_TOOLS.map(tool => {
      const quantity = calculateToolQuantityFromInfrastructure(
        tool.id, 
        calculations.customer.infrastructure, 
        calculations.customer.users
      )
      
      return {
        ...tool,
        quantity,
        extendedPrice: quantity * (tool.pricePerNodeUnit || 0)
      }
    })
    
    return toolsWithQuantities
      .filter(tool => tool.extendedPrice > 0)
      .reduce((sum, tool) => sum + tool.extendedPrice, 0)
  }

  // Get detailed tools breakdown for expanded view
  const getToolsBreakdown = () => {
    if (!calculations?.customer) return []
    
    return DEFAULT_VARIABLE_COST_TOOLS.map(tool => {
      const quantity = calculateToolQuantityFromInfrastructure(
        tool.id, 
        calculations.customer.infrastructure, 
        calculations.customer.users
      )
      
      return {
        name: tool.name,
        quantity,
        pricePerUnit: tool.pricePerNodeUnit || 0,
        extendedPrice: quantity * (tool.pricePerNodeUnit || 0)
      }
    }).filter(tool => tool.extendedPrice > 0)
  }
  // Don't early return if we have no calculations - we'll show tools calculation if possible
  const hasCustomerData = calculations?.customer?.companyName || calculations?.customer?.infrastructure || calculations?.customer?.users
  
  
  if (!calculations || !hasCustomerData) {
    const cardStyle = isExpanded && maxHeight ? {
      backgroundColor: '#343333',
      maxHeight: `${maxHeight}px`,
      display: 'flex',
      flexDirection: 'column' as const
    } : { backgroundColor: '#343333' }

    return (
      <Card style={cardStyle} className="border-gray-600">
        <CardHeader className="flex-shrink-0">
          <div className="space-y-2">
            <button
              onClick={toggleExpanded}
              className="text-white hover:opacity-70 transition-all duration-200 text-2xl p-1 cursor-pointer inline-flex items-center gap-2"
              title={isExpanded ? "Collapse" : "Expand"}
            >
  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              <span className="text-sm font-medium">Details</span>
            </button>
            <CardTitle className="text-white text-xl">Quote Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-white">Enter customer information to see pricing</p>
        </CardContent>
      </Card>
    )
  }

  const { totals } = calculations

  // Calculate tools total - use monthlyServices if it has meaningful data, otherwise calculate from infrastructure
  const hasActiveMonthlyTools = monthlyServices?.variableCostTools.some(tool => tool.isActive && tool.extendedPrice > 0)
  
  const toolsTotal = hasActiveMonthlyTools && monthlyServices
    ? monthlyServices.variableCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0)
        .reduce((sum, tool) => sum + tool.extendedPrice, 0)
    : calculateToolsCostsFromInfrastructure()
    

  // Ensure totals has safe defaults
  const safeTotals = {
    monthlyTotal: totals?.monthlyTotal || 0,
    toolsSoftware: totals?.toolsSoftware || 0,
    deferredSetupMonthly: totals?.deferredSetupMonthly || 0,
    supportLabor: totals?.supportLabor || 0,
    otherLabor: totals?.otherLabor || 0,
    contractTotal: totals?.contractTotal || 0,
    setupCosts: totals?.setupCosts || 0,
    upfrontPayment: totals?.upfrontPayment || 0
  }

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }


  const cardStyle = isExpanded && maxHeight ? {
    backgroundColor: '#343333',
    maxHeight: `${maxHeight}px`,
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'all 0.3s ease-in-out'
  } : { backgroundColor: '#343333', transition: 'all 0.3s ease-in-out' }

  const contentStyle = isExpanded && maxHeight ? {
    overflowY: 'auto' as const,
    flex: 1,
    transition: 'all 0.3s ease-in-out'
  } : { transition: 'all 0.3s ease-in-out' }

  return (
    <Card style={cardStyle} className="border-gray-600">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={toggleExpanded}
            className="hover:opacity-80 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 px-3 py-2 mb-4 rounded-lg border border-gray-500 hover:border-gray-400"
            style={{ backgroundColor: 'white' }}
            title={isExpanded ? "Collapse" : "Expand"}
          >
{isExpanded ? <Minimize2 size={20} style={{ color: '#0891b2' }} /> : <Maximize2 size={20} style={{ color: '#0891b2' }} />}
          </button>
        </div>
        <CardTitle className="text-white text-xl">Quote Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1" style={contentStyle}>
        <div className="space-y-2">
          <h4 className="font-semibold text-lg text-white">Monthly Recurring Price</h4>
          
          {isExpanded && (
            <div className="space-y-2 text-sm pl-2 border-l-2 border-gray-600">
              {hasActiveMonthlyTools && monthlyServices ? (
                <>
                  {/* Fixed Cost Tools */}
                  {monthlyServices.fixedCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).length > 0 && (
                    <div>
                      <div className="text-white text-xs font-medium mb-1">Fixed Cost Tools:</div>
                      {monthlyServices.fixedCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).map(tool => (
                        <div key={tool.id} className="flex justify-between ml-2">
                          <span className="text-white">{tool.name}:</span>
                          <span className="text-white">{formatCurrency(tool.extendedPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Variable Cost Tools */}
                  {monthlyServices.variableCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).length > 0 && (
                    <div>
                      <div className="text-white text-xs font-medium mb-1">Variable Cost Tools:</div>
                      {monthlyServices.variableCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).map(tool => (
                        <div key={tool.id} className="flex justify-between ml-2">
                          <span className="text-white">{tool.name} ({tool.nodesUnitsSupported} units):</span>
                          <span className="text-white">{formatCurrency(tool.extendedPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {monthlyServices.fixedCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).length === 0 && 
                   monthlyServices.variableCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).length === 0 && (
                    <div className="text-white text-xs italic">No monthly tools configured</div>
                  )}
                </>
              ) : (
                <>
                  {/* Show calculated tools from infrastructure data */}
                  {getToolsBreakdown().length > 0 && (
                    <div>
                      <div className="text-white text-xs font-medium mb-1">Tools & Licensing (from infrastructure):</div>
                      {getToolsBreakdown().map((tool, index) => (
                        <div key={index} className="flex justify-between ml-2">
                          <span className="text-white">{tool.name} ({tool.quantity} units):</span>
                          <span className="text-white">{formatCurrency(tool.extendedPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {getToolsBreakdown().length === 0 && (
                    <div className="text-white text-xs italic">Configure infrastructure to see tools pricing</div>
                  )}
                </>
              )}
            </div>
          )}
          
          <div className="space-y-1 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white">Setup Services:</span>
                <span className="text-white">{formatCurrency(safeTotals.deferredSetupMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white">Tools & Licensing:</span>
                <span className="text-white">{formatCurrency(safeTotals.toolsSoftware || toolsTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white">Support Labor:</span>
                <span className="text-white">{formatCurrency(safeTotals.supportLabor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white">Other Labor:</span>
                <span className="text-white">{formatCurrency(safeTotals.otherLabor)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-gray-600">
                <span className="text-white">Monthly Total:</span>
                <span className="text-white">{formatCurrency(
                  hasActiveMonthlyTools 
                    ? safeTotals.monthlyTotal 
                    : (safeTotals.monthlyTotal - safeTotals.toolsSoftware + toolsTotal)
                )}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Total Contract Value:</span>
            <span style={{ color: '#15bef0' }}>
              {formatCurrency(
                hasActiveMonthlyTools 
                  ? safeTotals.contractTotal 
                  : ((safeTotals.monthlyTotal - safeTotals.toolsSoftware + toolsTotal) * calculations.customer.contractMonths + (safeTotals.upfrontPayment || 0))
              )}
            </span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Monthly: {formatCurrency(
              hasActiveMonthlyTools 
                ? safeTotals.monthlyTotal 
                : (safeTotals.monthlyTotal - safeTotals.toolsSoftware + toolsTotal)
            )} × {calculations.customer.contractMonths} months
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-md">
          <h5 className="font-medium mb-2 text-white">Contract Details</h5>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-white">Customer:</span>
              <span className="text-white">{calculations.customer.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Contract Type:</span>
              <span className="text-white">{calculations.customer.contractType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Users (Full/Email):</span>
              <span className="text-white">{calculations.customer.users.full || 0}/{calculations.customer.users.emailOnly || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Workstations:</span>
              <span className="text-white">{calculations.customer.infrastructure.workstations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Servers:</span>
              <span className="text-white">{calculations.customer.infrastructure.servers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Printers:</span>
              <span className="text-white">{calculations.customer.infrastructure.printers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Phone Extensions:</span>
              <span className="text-white">{calculations.customer.infrastructure.phoneExtensions || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-600">
          <button 
            className="w-full px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
            style={{ backgroundColor: '#15bef0' }}
          >
            Generate Quote
          </button>
        </div>
      </CardContent>
    </Card>
  )
}