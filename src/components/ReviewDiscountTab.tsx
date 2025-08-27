'use client'

import React, { useState } from 'react'
import { CustomerInfo, QuoteCalculation } from '@/types/quote'
import { QuoteAPI, stateToCreateQuoteRequest } from '@/lib/quoteApi'
import { useRouter } from 'next/navigation'
import { useQuote } from '@/contexts/QuoteContext'
import { toast } from 'sonner'

interface ReviewDiscountTabProps {
  calculations?: QuoteCalculation
  customer: CustomerInfo
  supportDevices?: any[]
  monthlyServices?: any
  otherLaborData?: any
  setupServices?: any[]
  upfrontPayment: number
  onUpfrontPaymentChange: (payment: number) => void
  editMode?: boolean
  quoteId?: string
}

type DiscountType = 'none' | 'percentage' | 'raw_dollar' | 'margin_override' | 'per_user' | 'override'

export function ReviewDiscountTab({ calculations, customer, supportDevices, monthlyServices, otherLaborData, setupServices, upfrontPayment, onUpfrontPaymentChange, editMode = false, quoteId }: ReviewDiscountTabProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('none')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { initialQuote } = useQuote()

  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select()
    }
  }

  // Load existing discount values in edit mode
  React.useEffect(() => {
    if (editMode && initialQuote) {
      // Check if we have discount data from the saved quote
      if (initialQuote.discountType && initialQuote.discountType !== 'none') {
        setDiscountType(initialQuote.discountType as DiscountType)
        setDiscountValue(initialQuote.discountValue || 0)
      }
    }
  }, [editMode, initialQuote])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  // Calculate discounted total
  const calculateDiscountedTotal = (originalTotal: number) => {
    if (!calculations?.customer) return originalTotal
    
    switch (discountType) {
      case 'percentage':
        return discountValue > 0 ? originalTotal * (1 - discountValue / 100) : originalTotal
      case 'raw_dollar':
        return discountValue > 0 ? originalTotal - discountValue : originalTotal
      case 'margin_override':
        // Set margin to specific percentage - calculate price from estimated cost
        if (discountValue > 0 && calculations?.totals) {
          const estimatedCost = originalTotal * 0.35 // Rough 35% cost estimate
          return estimatedCost / (1 - discountValue / 100)
        }
        return originalTotal
      case 'per_user':
        const fullUsers = calculations.customer.users.full || 0
        if (discountValue > 0 && fullUsers > 0) {
          // Per user discount targets only Support Labor + Deferred Setup, not tools
          const supportAndSetupOriginal = (totals?.supportLabor || 0) + (totals?.deferredSetupMonthly || 0)
          const targetSupportAndSetup = discountValue * fullUsers
          const toolsCosts = (totals?.toolsSoftware || 0) + (totals?.otherLabor || 0)
          const newMonthlyTotal = targetSupportAndSetup + toolsCosts
          
          console.log('Per user discount calculation:', { 
            discountValue, 
            fullUsers, 
            supportAndSetupOriginal,
            targetSupportAndSetup,
            toolsCosts,
            originalTotal,
            newMonthlyTotal,
            pricePerUserBefore: supportAndSetupOriginal / fullUsers,
            pricePerUserAfter: targetSupportAndSetup / fullUsers
          })
          return newMonthlyTotal
        }
        return originalTotal
      case 'override':
        return discountValue > 0 ? discountValue : originalTotal
      default:
        return originalTotal
    }
  }

  // Calculate total labor hours from support devices
  const calculateLaborHours = () => {
    if (!supportDevices) return { level1: 0, level2: 0, level3: 0 }
    
    const hours = { level1: 0, level2: 0, level3: 0 }
    
    supportDevices.filter(device => device.isActive && device.quantity > 0).forEach(device => {
      const deviceHours = device.hours
      if (deviceHours) {
        const totalHours = (
          (deviceHours.predictable?.onsiteBusiness || 0) +
          (deviceHours.predictable?.remoteBusiness || 0) +
          (deviceHours.predictable?.onsiteAfterHours || 0) +
          (deviceHours.predictable?.remoteAfterHours || 0) +
          (deviceHours.reactive?.onsiteBusiness || 0) +
          (deviceHours.reactive?.remoteBusiness || 0) +
          (deviceHours.reactive?.onsiteAfterHours || 0) +
          (deviceHours.reactive?.remoteAfterHours || 0) +
          (deviceHours.emergency?.onsiteBusiness || 0) +
          (deviceHours.emergency?.remoteBusiness || 0) +
          (deviceHours.emergency?.onsiteAfterHours || 0) +
          (deviceHours.emergency?.remoteAfterHours || 0)
        ) * device.quantity

        if (device.skillLevel === 1) hours.level1 += totalHours
        else if (device.skillLevel === 2) hours.level2 += totalHours
        else if (device.skillLevel === 3) hours.level3 += totalHours
      }
    })
    
    return hours
  }

  const totals = calculations?.totals
  const laborHours = calculateLaborHours()
  const originalTotal = totals?.monthlyTotal || 0
  const discountedTotal = calculateDiscountedTotal(originalTotal)
  const fullUsers = customer.users.full || 0
  const totalUsers = fullUsers + (customer.users.emailOnly || 0)
  
  // For per user discount, use only full users for calculations and display
  const usersForPricing = discountType === 'per_user' ? fullUsers : totalUsers
  
  // Calculate proportional discounts for each component
  const hasDiscount = discountType !== 'none' && discountValue > 0
  const totalDiscountAmount = hasDiscount ? originalTotal - discountedTotal : 0
  
  const calculateDiscountedComponent = (componentPrice: number, componentType?: string) => {
    if (!hasDiscount || originalTotal === 0) return componentPrice
    
    // For per_user discount, handle support labor and setup differently
    if (discountType === 'per_user') {
      if (componentType === 'supportLabor' || componentType === 'deferredSetup') {
        // These components are adjusted to hit the target per-user price
        const supportAndSetupOriginal = (totals?.supportLabor || 0) + (totals?.deferredSetupMonthly || 0)
        const targetSupportAndSetup = discountValue * fullUsers
        if (supportAndSetupOriginal > 0) {
          return componentPrice * (targetSupportAndSetup / supportAndSetupOriginal)
        }
      }
      // Tools and other components remain unchanged for per_user discount
      return componentPrice
    }
    
    const weighting = componentPrice / originalTotal
    const componentDiscount = totalDiscountAmount * weighting
    return componentPrice - componentDiscount
  }
  
  const discountedTools = calculateDiscountedComponent(totals?.toolsSoftware || 0, 'tools')
  const discountedSupportLabor = calculateDiscountedComponent(totals?.supportLabor || 0, 'supportLabor')
  const discountedOtherLabor = calculateDiscountedComponent(totals?.otherLabor || 0, 'otherLabor')
  const discountedSetup = calculateDiscountedComponent(totals?.deferredSetupMonthly || 0, 'deferredSetup')

  // Calculate actual margins based on cost vs price data
  const calculateMargins = () => {
    if (!calculations?.totals) return { tools: 0, labor: 0, services: 0, overall: 0 }
    
    // Use discounted prices if discount is active, otherwise use original prices
    const toolsPrice = hasDiscount ? discountedTools : (totals?.toolsSoftware || 0)
    const supportLaborPrice = hasDiscount ? discountedSupportLabor : (totals?.supportLabor || 0)
    const otherLaborPrice = hasDiscount ? discountedOtherLabor : (totals?.otherLabor || 0)
    
    // Calculate costs (these never change)
    const toolsCost = (totals?.toolsSoftware || 0) * 0.5
    const supportLaborCost = (totals?.supportLabor || 0) * 0.25
    const otherLaborCost = (totals?.otherLabor || 0) * 0.25
    
    // Calculate margins: (Price - Cost) / Price * 100
    const toolsMargin = toolsPrice > 0 ? ((toolsPrice - toolsCost) / toolsPrice) * 100 : 0
    
    // Combined labor margin
    const totalLaborPrice = supportLaborPrice + otherLaborPrice
    const totalLaborCost = supportLaborCost + otherLaborCost
    const laborMargin = totalLaborPrice > 0 ? ((totalLaborPrice - totalLaborCost) / totalLaborPrice) * 100 : 0
    
    // Overall services margin
    const totalServicesPrice = toolsPrice + supportLaborPrice + otherLaborPrice
    const totalServicesCost = toolsCost + supportLaborCost + otherLaborCost
    const servicesMargin = totalServicesPrice > 0 ? ((totalServicesPrice - totalServicesCost) / totalServicesPrice) * 100 : 0
    
    return {
      tools: toolsMargin,
      labor: laborMargin, 
      services: servicesMargin,
      overall: servicesMargin
    }
  }

  const margins = calculateMargins()

  // Generate/Update quote function
  const handleGenerateQuote = async () => {
    if (!customer?.companyName?.trim()) {
      toast.error('Please enter a company name before ' + (editMode ? 'updating' : 'generating') + ' the quote.')
      return
    }

    setIsGenerating(true)
    
    try {
      // Build quote state object similar to QuoteContext
      const quoteState = {
        customer,
        setupServices: setupServices || [],
        monthlyServices: monthlyServices || { variableCostTools: [] },
        supportDevices: supportDevices || [],
        otherLaborData: otherLaborData || { percentage: 5, customItems: [] },
        upfrontPayment,
        calculations
      }
      
      // Debug logging
      console.log('Saving quote with data:', {
        toolsLength: quoteState.monthlyServices?.variableCostTools?.length,
        sampleTool: quoteState.monthlyServices?.variableCostTools?.[0],
        monthlyServices: quoteState.monthlyServices
      })

      const discountInfo = discountType !== 'none' && discountValue > 0 ? {
        discountType,
        discountValue,
        discountedTotal
      } : undefined

      if (editMode && quoteId) {
        // Update existing quote
        const updateRequest = {
          id: quoteId,
          ...stateToCreateQuoteRequest(quoteState, discountInfo)
        }
        const updatedQuote = await QuoteAPI.updateQuote(updateRequest)
        
        toast.success('Quote updated successfully!')
        // Force a full page reload to refresh server-side data
        window.location.href = `/dashboard/quotes/${updatedQuote.id}`
      } else {
        // Create new quote
        const request = stateToCreateQuoteRequest(quoteState, discountInfo)
        const savedQuote = await QuoteAPI.createQuote(request)
        
        toast.success('Quote generated successfully!')
        router.push(`/dashboard/quotes/${savedQuote.id}`)
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      toast.error('Failed to ' + (editMode ? 'update' : 'generate') + ' quote. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Discount Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discounting Calculations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <select 
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Discount</option>
              <option value="percentage">Percentage Discount</option>
              <option value="raw_dollar">Raw Dollar Discount</option>
              <option value="margin_override">Margin Override</option>
              <option value="per_user">Price Per User</option>
              <option value="override">Total Price Override</option>
            </select>
          </div>

          {discountType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {discountType === 'percentage' && 'Discount Percentage'}
                {discountType === 'raw_dollar' && 'Discount Amount ($)'}
                {discountType === 'margin_override' && 'Target Margin (%)'}
                {discountType === 'per_user' && 'Price Per User ($)'}
                {discountType === 'override' && 'Override Amount ($)'}
              </label>
              <input
                type="number"
                min="0"
                step={(['percentage', 'margin_override'].includes(discountType)) ? '0.1' : '0.01'}
                max={(['percentage', 'margin_override'].includes(discountType)) ? '100' : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                onFocus={handleNumberInputFocus}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  discountType === 'percentage' ? '10.0' :
                  discountType === 'raw_dollar' ? '500.00' :
                  discountType === 'margin_override' ? '25.0' :
                  discountType === 'per_user' ? '150.00' :
                  '3500.00'
                }
              />
            </div>
          )}
        </div>

        {/* Discount Summary */}
        {discountType !== 'none' && discountValue > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-6 text-right">
            <div>
              <div className="text-sm text-gray-700">Raw Dollar Discount</div>
              <div className="text-lg font-semibold text-gray-900">
                {(() => {
                  const discountAmount = originalTotal - discountedTotal;
                  const sign = discountAmount >= 0 ? '-' : '+';
                  const amount = Math.abs(discountAmount);
                  return `${sign}${formatCurrency(amount)}`;
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Discounted Amount</div>
              <div className="text-lg font-semibold" style={{ color: '#15bef0' }}>
                {formatCurrency(discountedTotal)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pricing Summary</h3>
        </div>
        
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:divide-x lg:divide-gray-200">
            
            {/* Left Column */}
            <div className="space-y-6 lg:pr-8">
              {/* Pricing Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Pricing Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Tools</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through">{formatCurrency(totals?.toolsSoftware || 0)}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency(discountedTools)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency(totals?.toolsSoftware || 0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Support Labor</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through">{formatCurrency(totals?.supportLabor || 0)}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency(discountedSupportLabor)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency(totals?.supportLabor || 0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Other Labor</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through">{formatCurrency(totals?.otherLabor || 0)}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency(discountedOtherLabor)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency(totals?.otherLabor || 0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Deferred Setup (Monthly)</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through">{formatCurrency(totals?.deferredSetupMonthly || 0)}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency(discountedSetup)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency(totals?.deferredSetupMonthly || 0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-3 font-semibold text-lg border-t-2 border-gray-300">
                    <span className="text-gray-900">Total Monthly Price</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-semibold text-gray-500 line-through">{formatCurrency(originalTotal)}</span>
                          <br />
                          <span style={{ color: '#15bef0' }}>{formatCurrency(discountedTotal)}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#15bef0' }}>{formatCurrency(originalTotal)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-User Statistics */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Monthly Per-User Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Support Price per User</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through text-xs">{formatCurrency((totals?.supportLabor || 0) / Math.max(1, fullUsers))}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency(discountedSupportLabor / Math.max(1, fullUsers))}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency((totals?.supportLabor || 0) / Math.max(1, fullUsers))}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Deferred Monthly Setup Price per User</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through text-xs">{formatCurrency((totals?.deferredSetupMonthly || 0) / Math.max(1, fullUsers))}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency(discountedSetup / Math.max(1, fullUsers))}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency((totals?.deferredSetupMonthly || 0) / Math.max(1, fullUsers))}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-2 font-medium border-t pt-2">
                    <span className="text-gray-900">Total Monthly Price per User</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="font-medium text-gray-500 line-through text-xs">{formatCurrency(((totals?.supportLabor || 0) + (totals?.deferredSetupMonthly || 0)) / Math.max(1, fullUsers))}</span>
                          <br />
                          <span className="font-medium text-gray-900">{formatCurrency((discountedSupportLabor + discountedSetup) / Math.max(1, fullUsers))}</span>
                        </div>
                      ) : (
                        <span className="text-gray-900">{formatCurrency(((totals?.supportLabor || 0) + (totals?.deferredSetupMonthly || 0)) / Math.max(1, fullUsers))}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost vs Price Table */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Monthly Services Costs</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Service</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Cost</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-4 text-gray-900 font-medium">Tools</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">{formatCurrency((totals?.toolsSoftware || 0) * 0.5)}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-xs">{formatCurrency(totals?.toolsSoftware || 0)}</span>
                              <br />
                              <span>{formatCurrency(discountedTools)}</span>
                            </div>
                          ) : (
                            formatCurrency(totals?.toolsSoftware || 0)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900 font-medium">Support Labor</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">{formatCurrency((totals?.supportLabor || 0) * 0.25)}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-xs">{formatCurrency(totals?.supportLabor || 0)}</span>
                              <br />
                              <span>{formatCurrency(discountedSupportLabor)}</span>
                            </div>
                          ) : (
                            formatCurrency(totals?.supportLabor || 0)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900 font-medium">Other Labor</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">{formatCurrency((totals?.otherLabor || 0) * 0.25)}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-xs">{formatCurrency(totals?.otherLabor || 0)}</span>
                              <br />
                              <span>{formatCurrency(discountedOtherLabor)}</span>
                            </div>
                          ) : (
                            formatCurrency(totals?.otherLabor || 0)
                          )}
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-bold">
                        <td className="py-3 px-4 text-gray-900">Total Services</td>
                        <td className="text-right py-3 px-4 text-gray-900">{formatCurrency((totals?.toolsSoftware || 0) * 0.5 + (totals?.supportLabor || 0) * 0.25 + (totals?.otherLabor || 0) * 0.25)}</td>
                        <td className="text-right py-3 px-4 text-gray-900">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-xs">{formatCurrency((totals?.toolsSoftware || 0) + (totals?.supportLabor || 0) + (totals?.otherLabor || 0))}</span>
                              <br />
                              <span>{formatCurrency(discountedTools + discountedSupportLabor + discountedOtherLabor)}</span>
                            </div>
                          ) : (
                            formatCurrency((totals?.toolsSoftware || 0) + (totals?.supportLabor || 0) + (totals?.otherLabor || 0))
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:pl-8">
              {/* Profitability */}
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Profitability</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Overall Margin on Tools</span>
                    <span className="font-medium text-gray-900">{formatPercent(margins.tools)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Overall Margin on Labor</span>
                    <span className="font-medium text-gray-900">{formatPercent(margins.labor)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Overall Services Margin</span>
                    <span className="font-medium text-gray-900">{formatPercent(margins.services)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold border-t pt-2">
                    <span className="text-gray-900">Overall Contract Margin</span>
                    <span className="text-gray-900">{formatPercent(margins.overall)}</span>
                  </div>
                </div>
              </div>

              {/* Hardware Metrics */}
              {(laborHours.level1 + laborHours.level2 + laborHours.level3) > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 text-lg mb-4">Labor Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-700">Total Monthly Support Labor</span>
                      <span className="font-medium text-gray-900">{(laborHours.level1 + laborHours.level2 + laborHours.level3).toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-700">Total Monthly Project Labor</span>
                      <span className="font-medium text-gray-900">0.0 hours</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-700">Emergency Budgeted Amount</span>
                      <span className="font-medium text-gray-900">{formatCurrency(0)}</span>
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      {laborHours.level1 > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Level 1 Junior - Total Hours</span>
                          <span className="font-medium text-gray-900">{laborHours.level1.toFixed(2)} hours/month</span>
                        </div>
                      )}
                      {laborHours.level2 > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Level 2 Int - Total Hours</span>
                          <span className="font-medium text-gray-900">{laborHours.level2.toFixed(2)} hours/month</span>
                        </div>
                      )}
                      {laborHours.level3 > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Level 3 Sr - Total Hours</span>
                          <span className="font-medium text-gray-900">{laborHours.level3.toFixed(2)} hours/month</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contract Summary */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Contract Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700 font-medium">Monthly Total</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="text-xl font-bold text-gray-500 line-through">{formatCurrency(originalTotal)}</span>
                          <br />
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(discountedTotal)}</span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(originalTotal)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700 font-medium">Contract Length</span>
                    <span className="text-xl font-bold text-gray-900">{customer.contractMonths} months</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-xl border-t-2 border-gray-300">
                    <span className="text-gray-900">Total Contract Value</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <div>
                          <span className="text-xl font-bold text-gray-500 line-through">{formatCurrency(originalTotal * customer.contractMonths)}</span>
                          <br />
                          <span style={{ color: '#15bef0' }}>{formatCurrency(discountedTotal * customer.contractMonths)}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#15bef0' }}>{formatCurrency(originalTotal * customer.contractMonths)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Generate Quote Button */}
                  <div className="pt-4">
                    <button 
                      onClick={handleGenerateQuote}
                      disabled={isGenerating}
                      className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 ${
                        isGenerating 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:opacity-90 cursor-pointer'
                      }`}
                      style={{ backgroundColor: '#15bef0' }}
                    >
                      {isGenerating 
                        ? (editMode ? 'Updating Quote...' : 'Generating Quote...') 
                        : (editMode ? 'Update Quote' : 'Generate Quote')
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}