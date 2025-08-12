'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { QuoteCalculation } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSetupServiceHours } from '@/lib/setupServiceCalculations'
import { DEFAULT_LABOR_RATES } from '@/lib/calculations'

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
  if (!calculations) {
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

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateServicePrice = (service: any) => {
    if (!calculations?.customer || !service.skillLevel) {
      return service.price || 0
    }
    
    const calculatedHours = calculateSetupServiceHours(service.id, service.isActive, calculations.customer)
    if (calculatedHours && service.skillLevel) {
      const rates = DEFAULT_LABOR_RATES[`level${service.skillLevel}` as keyof typeof DEFAULT_LABOR_RATES]
      const priceRate = service.factor2 === 'afterhours' ? rates.priceAfterHours : rates.priceBusinessHours
      return calculatedHours * priceRate
    }
    return service.price || 0
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
          <h4 className="font-semibold text-lg text-white">One-Time Setup Costs</h4>
          
          {isExpanded && (
            <div className="space-y-1 text-sm pl-2 border-l-2 border-gray-600">
              {calculations.setupServices.filter(service => service.isActive).map(service => (
                <div key={service.id} className="flex justify-between">
                  <span className="text-white">{service.name}:</span>
                  <span className="text-white">{formatCurrency(calculateServicePrice(service))}</span>
                </div>
              ))}
              {calculations.setupServices.filter(service => service.isActive).length === 0 && (
                <div className="text-white text-xs italic">No setup services selected</div>
              )}
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-white font-medium">Total Setup:</span>
            <span className="text-white font-medium">{formatCurrency(totals.setupCosts)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-lg text-white">Monthly Recurring Costs</h4>
          
          {isExpanded && monthlyServices && (
            <div className="space-y-2 text-sm pl-2 border-l-2 border-gray-600">
              {/* Fixed Cost Tools */}
              {monthlyServices.fixedCostTools.filter(tool => tool.isActive).length > 0 && (
                <div>
                  <div className="text-white text-xs font-medium mb-1">Fixed Cost Tools:</div>
                  {monthlyServices.fixedCostTools.filter(tool => tool.isActive).map(tool => (
                    <div key={tool.id} className="flex justify-between ml-2">
                      <span className="text-white">{tool.name}:</span>
                      <span className="text-white">{formatCurrency(tool.extendedPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Variable Cost Tools */}
              {monthlyServices.variableCostTools.filter(tool => tool.isActive).length > 0 && (
                <div>
                  <div className="text-white text-xs font-medium mb-1">Variable Cost Tools:</div>
                  {monthlyServices.variableCostTools.filter(tool => tool.isActive).map(tool => (
                    <div key={tool.id} className="flex justify-between ml-2">
                      <span className="text-white">{tool.name} ({tool.nodesUnitsSupported} units):</span>
                      <span className="text-white">{formatCurrency(tool.extendedPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {monthlyServices.fixedCostTools.filter(tool => tool.isActive).length === 0 && 
               monthlyServices.variableCostTools.filter(tool => tool.isActive).length === 0 && (
                <div className="text-white text-xs italic">No monthly tools selected</div>
              )}
            </div>
          )}
          
          <div className="space-y-1 text-sm">
            {totals.supportLabor > 0 && (
              <div className="flex justify-between">
                <span className="text-white">Support Labor:</span>
                <span className="text-white">{formatCurrency(totals.supportLabor)}</span>
              </div>
            )}
            {totals.toolsSoftware > 0 && (
              <div className="flex justify-between">
                <span className="text-white">Tools & Software:</span>
                <span className="text-white">{formatCurrency(totals.toolsSoftware)}</span>
              </div>
            )}
            {totals.haas > 0 && (
              <div className="flex justify-between">
                <span className="text-white">Hardware as a Service:</span>
                <span className="text-white">{formatCurrency(totals.haas)}</span>
              </div>
            )}
            {totals.warranty > 0 && (
              <div className="flex justify-between">
                <span className="text-white">Warranty & Support:</span>
                <span className="text-white">{formatCurrency(totals.warranty)}</span>
              </div>
            )}
            {totals.monthlyTotal > 0 ? (
              <>
                <hr className="my-2 border-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Monthly Total:</span>
                  <span className="text-white">{formatCurrency(totals.monthlyTotal)}</span>
                </div>
              </>
            ) : (
              <div className="text-white text-sm italic">
                Monthly services will be configured in Step 2
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-600 pt-4">
          {totals.monthlyTotal > 0 ? (
            <>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total Contract Value:</span>
                <span style={{ color: '#15bef0' }}>{formatCurrency(totals.contractTotal)}</span>
              </div>
              <p className="text-sm text-white mt-1">
                {calculations.customer.contractMonths || 36} month contract
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Setup Costs Total:</span>
                <span style={{ color: '#15bef0' }}>{formatCurrency(totals.setupCosts)}</span>
              </div>
              <p className="text-sm text-white mt-1">
                One-time project costs • Monthly costs to be added in Step 2
              </p>
            </>
          )}
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