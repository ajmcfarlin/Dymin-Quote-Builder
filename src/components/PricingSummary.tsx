'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { QuoteCalculation } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_VARIABLE_COST_TOOLS, calculateToolQuantityFromInfrastructure } from '@/lib/monthlyServices'
import { QuoteAPI, stateToCreateQuoteRequest } from '@/lib/quoteApi'
// Removed unused import

interface PricingSummaryProps {
  calculations?: QuoteCalculation
  monthlyServices?: MonthlyServicesData
  supportDevices?: any[]
  setupServices?: any[]
  onExpandToggle?: (expanded: boolean) => void
  isExpanded?: boolean
  maxHeight?: number | null
  editMode?: boolean
  quoteId?: string
  savedQuoteTotals?: {
    monthlyTotal: number
    originalMonthlyTotal?: number
    contractTotal: number
    setupCosts: number
    upfrontPayment: number
    discountType?: string
    discountValue?: number
    discountedTotal?: number
  }
}

export function PricingSummary({ calculations, monthlyServices, supportDevices, setupServices, onExpandToggle, maxHeight, editMode = false, quoteId, savedQuoteTotals }: PricingSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  

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



  // Generate/Update quote function
  const handleGenerateQuote = async () => {
    if (!calculations?.customer?.companyName.trim()) {
      alert('Please enter a company name before ' + (editMode ? 'updating' : 'generating') + ' the quote.')
      return
    }

    setIsGenerating(true)

    try {
      // Create the quote data
      const quoteState = {
        customer: calculations.customer,
        setupServices: setupServices || [],
        monthlyServices: monthlyServices || { variableCostTools: [] },
        supportDevices: supportDevices || [],
        otherLaborData: { percentage: 5, customItems: [] },
        upfrontPayment: calculations.totals?.upfrontPayment || 0,
        calculations
      }

      if (editMode && quoteId) {
        // Update existing quote
        const updateRequest = {
          id: quoteId,
          ...stateToCreateQuoteRequest(quoteState)
        }
        const updatedQuote = await QuoteAPI.updateQuote(updateRequest)
        
        // Navigate back to the quote view page
        window.location.href = `/dashboard/quotes/${quoteId}`
      } else {
        // Create new quote
        const request = stateToCreateQuoteRequest(quoteState)
        const savedQuote = await QuoteAPI.createQuote(request)
        
        // Navigate to the quotes page to show the saved quote
        window.location.href = '/dashboard/quotes'
      }
    } catch (error) {
      console.error('Failed to ' + (editMode ? 'update' : 'generate') + ' quote:', error)
      alert('Failed to generate quote. Please try again.')
    } finally {
      setIsGenerating(false)
    }
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
    

  // Use saved quote totals if available (edit mode), otherwise use calculated totals
  const safeTotals = savedQuoteTotals ? {
    monthlyTotal: savedQuoteTotals.monthlyTotal,
    toolsSoftware: totals?.toolsSoftware || 0,
    deferredSetupMonthly: totals?.deferredSetupMonthly || 0,
    supportLabor: totals?.supportLabor || 0,
    otherLabor: totals?.otherLabor || 0,
    contractTotal: savedQuoteTotals.contractTotal,
    setupCosts: savedQuoteTotals.setupCosts,
    upfrontPayment: savedQuoteTotals.upfrontPayment,
    discountedTotal: savedQuoteTotals.discountedTotal,
    discountType: savedQuoteTotals.discountType,
    discountValue: savedQuoteTotals.discountValue,
    originalMonthlyTotal: savedQuoteTotals.originalMonthlyTotal
  } : {
    monthlyTotal: totals?.monthlyTotal || 0,
    toolsSoftware: totals?.toolsSoftware || 0,
    deferredSetupMonthly: totals?.deferredSetupMonthly || 0,
    supportLabor: totals?.supportLabor || 0,
    otherLabor: totals?.otherLabor || 0,
    contractTotal: totals?.contractTotal || 0,
    setupCosts: totals?.setupCosts || 0,
    upfrontPayment: totals?.upfrontPayment || 0,
    discountedTotal: totals?.discountedTotal,
    discountType: totals?.discountType,
    discountValue: totals?.discountValue
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


  const cardStyle = isExpanded ? {
    backgroundColor: '#343333',
    maxHeight: '90vh', // High enough to not cut off prematurely, but still constrains
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'all 0.3s ease-in-out'
  } : { backgroundColor: '#343333', transition: 'all 0.3s ease-in-out' }

  const contentStyle = isExpanded ? {
    overflowY: 'auto' as const,
    flex: 1,
    minHeight: 0, // Important for flex child to be scrollable
    transition: 'all 0.3s ease-in-out',
    // Custom scrollbar styling
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#4B5563 #374151'
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
      <CardContent 
        className="space-y-4 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400" 
        style={contentStyle}
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-lg text-white">Monthly Recurring Price</h4>
          
          <div className="space-y-1 text-sm">
            <div className="space-y-1">
              
              {/* Setup Services */}
              <div className="flex justify-between text-sm">
                <span className="text-white">Setup Services:</span>
                <span className="text-white">{formatCurrency(safeTotals.deferredSetupMonthly)}</span>
              </div>
              {isExpanded && setupServices && setupServices.length > 0 && calculations?.customer && (
                <div className="pl-4 space-y-1 text-xs border-l-2 border-gray-600 mb-2">
                  {setupServices.filter(service => service.isActive).map((service, index) => {
                    if (!calculations?.customer) return null
                    
                    // Import the exact calculation function from SetupServiceSelector
                    const { calculateSetupServiceHours } = require('@/lib/setupServiceCalculations')
                    const hours = calculateSetupServiceHours(service.id, service.isActive, calculations.customer)
                    
                    // Use the exact same rate structure as SetupServiceSelector
                    const baseRates = {
                      1: { business: 155, afterhours: 155 },
                      2: { business: 185, afterhours: 275 },
                      3: { business: 275, afterhours: 375 }
                    }
                    const rate = baseRates[service.skillLevel as 1 | 2 | 3]?.[service.factor2 as 'business' | 'afterhours']
                    
                    if (!rate || isNaN(hours)) {
                      return null
                    }
                    
                    let servicePrice = hours * rate
                    
                    // Email Migration includes license costs (same as SetupServiceSelector)
                    if (service.id === 'email-migration') {
                      const licenseCost = 42 * ((calculations.customer.users.full || 0) + (calculations.customer.users.emailOnly || 0))
                      servicePrice += licenseCost
                    }
                    
                    return (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span>{service.name}</span>
                        <span>{formatCurrency(servicePrice)}</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between text-gray-400 text-xs border-t border-gray-600 pt-1">
                    <span>{formatCurrency(safeTotals.setupCosts)} ÷ {calculations?.customer.contractMonths || 36} months:</span>
                    <span>{formatCurrency(safeTotals.deferredSetupMonthly)}</span>
                  </div>
                </div>
              )}
              
              {/* Tools & Licensing */}
              <div className="flex justify-between text-sm">
                <span className="text-white">Tools & Licensing:</span>
                <span className="text-white">{formatCurrency(safeTotals.toolsSoftware || toolsTotal)}</span>
              </div>
              {isExpanded && (
                <div className="pl-4 space-y-1 text-xs border-l-2 border-gray-600 mb-2">
                  {hasActiveMonthlyTools && monthlyServices ? (
                    <>
                      {monthlyServices.variableCostTools.filter(tool => tool.isActive && tool.extendedPrice > 0).map(tool => (
                        <div key={tool.id} className="flex justify-between text-gray-300">
                          <span>{tool.name} ({tool.nodesUnitsSupported} units)</span>
                          <span>{formatCurrency(tool.extendedPrice)}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {getToolsBreakdown().map((tool, index) => (
                        <div key={index} className="flex justify-between text-gray-300">
                          <span>{tool.name} ({tool.quantity} units)</span>
                          <span>{formatCurrency(tool.extendedPrice)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              
              {/* Support Labor */}
              <div className="flex justify-between text-sm">
                <span className="text-white">Support Labor:</span>
                <span className="text-white">{formatCurrency(safeTotals.supportLabor)}</span>
              </div>
              {isExpanded && supportDevices && (
                <div className="pl-4 space-y-1 text-xs border-l-2 border-gray-600 mb-2">
                  {supportDevices.filter(device => device.isActive && device.quantity > 0).map((device, index) => {
                    // Calculate individual device price
                    const priceRates = { 
                      1: { business: 155, afterHours: 155 },
                      2: { business: 185, afterHours: 275 },
                      3: { business: 275, afterHours: 375 }
                    }
                    
                    const skillLevel = device.skillLevel as 1 | 2 | 3
                    
                    const businessHours = device.hours.predictable.onsiteBusiness + device.hours.predictable.remoteBusiness +
                                        device.hours.reactive.onsiteBusiness + device.hours.reactive.remoteBusiness +
                                        device.hours.emergency.onsiteBusiness + device.hours.emergency.remoteBusiness
                    
                    const afterHours = device.hours.predictable.onsiteAfterHours + device.hours.predictable.remoteAfterHours +
                                     device.hours.reactive.onsiteAfterHours + device.hours.reactive.remoteAfterHours +
                                     device.hours.emergency.onsiteAfterHours + device.hours.emergency.remoteAfterHours
                    
                    const price = device.quantity * (
                      businessHours * priceRates[skillLevel].business +
                      afterHours * priceRates[skillLevel].afterHours
                    )
                    
                    return (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span>{device.name} × {device.quantity}</span>
                        <span>{formatCurrency(price)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              
              {/* Other Labor */}
              <div className="flex justify-between text-sm">
                <span className="text-white">Other Labor:</span>
                <span className="text-white">{formatCurrency(safeTotals.otherLabor)}</span>
              </div>
            </div>
          </div>
        </div>



        <div className="border-t border-gray-600 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Monthly Total:</span>
            <span style={{ color: '#15bef0' }}>
              {formatCurrency(
                hasActiveMonthlyTools 
                  ? safeTotals.monthlyTotal 
                  : (safeTotals.monthlyTotal - safeTotals.toolsSoftware + toolsTotal)
              )}
            </span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Total Contract: {formatCurrency(
              (
                hasActiveMonthlyTools 
                  ? safeTotals.monthlyTotal 
                  : (safeTotals.monthlyTotal - safeTotals.toolsSoftware + toolsTotal)
              ) * calculations.customer.contractMonths + (safeTotals.upfrontPayment || 0)
            )} ({calculations.customer.contractMonths} months)
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
            <div className="flex justify-between">
              <span className="text-white">WiFi Access Points:</span>
              <span className="text-white">{calculations.customer.infrastructure.wifiAccessPoints || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Firewalls:</span>
              <span className="text-white">{calculations.customer.infrastructure.firewalls || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Switches:</span>
              <span className="text-white">{calculations.customer.infrastructure.switches || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">UPS:</span>
              <span className="text-white">{calculations.customer.infrastructure.ups || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">NAS:</span>
              <span className="text-white">{calculations.customer.infrastructure.nas || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Mobile Devices:</span>
              <span className="text-white">{calculations.customer.infrastructure.managedMobileDevices || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Email Domains:</span>
              <span className="text-white">{calculations.customer.infrastructure.domainsUsedForEmail || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-600">
          <button 
            onClick={handleGenerateQuote}
            disabled={isGenerating}
            className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 transform ${
              isGenerating 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:opacity-90 cursor-pointer hover:scale-[1.02]'
            }`}
            style={{ backgroundColor: '#15bef0' }}
          >
            {isGenerating 
              ? (editMode ? 'Updating Quote...' : 'Generating Quote...') 
              : (editMode ? 'Update Quote' : 'Generate Quote')
            }
          </button>
        </div>
      </CardContent>
    </Card>
  )
}