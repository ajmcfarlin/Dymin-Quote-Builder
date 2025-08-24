'use client'

import React, { useState } from 'react'
import { CustomerInfo, QuoteCalculation } from '@/types/quote'

interface ReviewDiscountTabProps {
  calculations?: QuoteCalculation
  customer: CustomerInfo
  supportDevices?: any[]
  upfrontPayment: number
  onUpfrontPaymentChange: (amount: number) => void
}

type DiscountType = 'none' | 'percentage' | 'raw_dollar' | 'margin_override' | 'per_user' | 'override'

export function ReviewDiscountTab({ calculations, customer, supportDevices, upfrontPayment, onUpfrontPaymentChange }: ReviewDiscountTabProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('none')
  const [discountValue, setDiscountValue] = useState<number>(0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  // Calculate actual margins based on data
  const calculateMargins = () => {
    if (!calculations?.totals) return { tools: 0, labor: 0, services: 0, overall: 0 }
    
    // Rough margin calculations - you can adjust these based on actual cost data
    const toolsMargin = 50.0 // Typical tools margin
    const laborMargin = 75.0 // Typical labor margin (price vs cost)
    const servicesMargin = (toolsMargin + laborMargin) / 2 // Average
    const overallMargin = servicesMargin
    
    return {
      tools: toolsMargin,
      labor: laborMargin, 
      services: servicesMargin,
      overall: overallMargin
    }
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
        const totalUsers = (calculations.customer.users.full || 0) + (calculations.customer.users.emailOnly || 0)
        return discountValue > 0 && totalUsers > 0 ? discountValue * totalUsers : originalTotal
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
  const margins = calculateMargins()
  const laborHours = calculateLaborHours()
  const originalTotal = totals?.monthlyTotal || 0
  const discountedTotal = calculateDiscountedTotal(originalTotal)
  const totalUsers = (customer.users.full || 0) + (customer.users.emailOnly || 0)

  return (
    <div className="rounded-lg shadow-sm border border-gray-600 p-6" style={{ backgroundColor: '#343333' }}>
      <h2 className="text-xl font-semibold text-white mb-6">Review & Finalize Quote</h2>
      
      {/* Discount Controls - Full Width at Top */}
      <div className="mb-8 bg-gray-700 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Apply Discount</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discount Type</label>
            <select 
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Final Pricing Summary */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
            {discountType !== 'none' && discountValue > 0 && (
              <div>
                <div className="text-gray-400 text-sm">Original Monthly</div>
                <div className="text-gray-400 line-through text-lg">{formatCurrency(originalTotal)}</div>
              </div>
            )}
            <div>
              <div className="text-white text-sm font-medium">Monthly Total</div>
              <div className="text-2xl font-bold" style={{ color: '#15bef0' }}>
                {formatCurrency(discountType !== 'none' && discountValue > 0 ? discountedTotal : originalTotal)}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm">Total Contract</div>
              <div className="text-white text-lg font-semibold">
                {formatCurrency((discountType !== 'none' && discountValue > 0 ? discountedTotal : originalTotal) * customer.contractMonths + upfrontPayment)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Quote Summary */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">Quote Breakdown</h3>
          
          {/* Pricing Breakdown */}
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-300">Tools & Licensing</span>
              <span className="text-white">{formatCurrency(totals?.toolsSoftware || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Support Labor</span>
              <span className="text-white">{formatCurrency(totals?.supportLabor || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Other Labor</span>
              <span className="text-white">{formatCurrency(totals?.otherLabor || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Setup Services (Monthly)</span>
              <span className="text-white">{formatCurrency(totals?.deferredSetupMonthly || 0)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-600 pt-2 font-semibold">
              <span className="text-white">Monthly Total</span>
              <span style={{ color: '#15bef0' }}>{formatCurrency(originalTotal)}</span>
            </div>
          </div>

          {/* Contract Information */}
          <div className="space-y-3 text-sm mb-6">
            <h4 className="font-medium text-white border-b border-gray-600 pb-2">Contract Details</h4>
            <div className="flex justify-between">
              <span className="text-gray-300">Contract Type</span>
              <span className="text-white">{customer.contractType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Contract Length</span>
              <span className="text-white">{customer.contractMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Users</span>
              <span className="text-white">{totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Monthly per User</span>
              <span className="text-white">{formatCurrency(originalTotal / Math.max(1, totalUsers))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Full Users</span>
              <span className="text-white">{customer.users.full || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Email Only Users</span>
              <span className="text-white">{customer.users.emailOnly || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cost per Full User</span>
              <span className="text-white">{formatCurrency(originalTotal / Math.max(1, customer.users.full || 1))}</span>
            </div>
          </div>

          {/* Per-User Analysis */}
          <div className="space-y-3 text-sm mb-6">
            <h4 className="font-medium text-white border-b border-gray-600 pb-2">Per-User Analysis</h4>
            <div className="flex justify-between">
              <span className="text-gray-300">Revenue per User</span>
              <span className="text-white">{formatCurrency(originalTotal / Math.max(1, totalUsers))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Annual per User</span>
              <span className="text-white">{formatCurrency((originalTotal * 12) / Math.max(1, totalUsers))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Contract per User</span>
              <span className="text-white">{formatCurrency((originalTotal * customer.contractMonths) / Math.max(1, totalUsers))}</span>
            </div>
            {laborHours.level1 + laborHours.level2 + laborHours.level3 > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Labor Hours per User</span>
                <span className="text-white">{((laborHours.level1 + laborHours.level2 + laborHours.level3) / Math.max(1, totalUsers)).toFixed(1)}h</span>
              </div>
            )}
          </div>

          {/* Labor Hours Analysis */}
          {(laborHours.level1 + laborHours.level2 + laborHours.level3) > 0 && (
            <div className="space-y-3 text-sm mb-6">
              <h4 className="font-medium text-white border-b border-gray-600 pb-2">Labor Hours Breakdown</h4>
              {laborHours.level1 > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Level 1 Hours</span>
                  <span className="text-white">{laborHours.level1.toFixed(1)}h</span>
                </div>
              )}
              {laborHours.level2 > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Level 2 Hours</span>
                  <span className="text-white">{laborHours.level2.toFixed(1)}h</span>
                </div>
              )}
              {laborHours.level3 > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Level 3 Hours</span>
                  <span className="text-white">{laborHours.level3.toFixed(1)}h</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t border-gray-600 pt-2">
                <span className="text-white">Total Labor Hours</span>
                <span className="text-white">{(laborHours.level1 + laborHours.level2 + laborHours.level3).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Cost per Hour</span>
                <span className="text-white">{formatCurrency(((totals?.supportLabor || 0) * 0.25) / Math.max(1, laborHours.level1 + laborHours.level2 + laborHours.level3))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Price per Hour</span>
                <span className="text-white">{formatCurrency((totals?.supportLabor || 0) / Math.max(1, laborHours.level1 + laborHours.level2 + laborHours.level3))}</span>
              </div>
            </div>
          )}

          {/* Setup Services */}
          {(totals?.setupCosts || 0) > 0 && (
            <div className="space-y-3 text-sm">
              <h4 className="font-medium text-white border-b border-gray-600 pb-2">Setup Services</h4>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Setup Costs</span>
                <span className="text-white">{formatCurrency(totals?.setupCosts || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Added to Monthly</span>
                <span className="text-white">{formatCurrency(totals?.deferredSetupMonthly || 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Financial Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">Financial Analysis</h3>
          
          {/* Profit Margin Analysis */}
          <div className="space-y-3 text-sm mb-6">
            <h4 className="font-medium text-white border-b border-gray-600 pb-2">Profit Analysis</h4>
            <div className="flex justify-between">
              <span className="text-gray-300">Tools Margin</span>
              <span className="text-white">{formatPercent(margins.tools)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Labor Margin</span>
              <span className="text-white">{formatPercent(margins.labor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Overall Margin</span>
              <span className="text-white">{formatPercent(margins.overall)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Est. Monthly Cost</span>
              <span className="text-white">{formatCurrency(originalTotal * 0.35)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Est. Monthly Profit</span>
              <span className="text-white">{formatCurrency(originalTotal * 0.65)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Annual Profit</span>
              <span className="text-white">{formatCurrency(originalTotal * 0.65 * 12)}</span>
            </div>
          </div>
          

          {/* Cost vs Price Breakdown */}
          <div className="space-y-3 text-sm border-t border-gray-600 pt-4 mb-6">
            <h4 className="font-medium text-white mb-3">Monthly Cost vs Price</h4>
            <div className="flex justify-between">
              <span className="text-gray-300">Tools Cost (est.)</span>
              <span className="text-white">{formatCurrency((totals?.toolsSoftware || 0) * 0.5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tools Price</span>
              <span className="text-white">{formatCurrency(totals?.toolsSoftware || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Labor Cost (est.)</span>
              <span className="text-white">{formatCurrency((totals?.supportLabor || 0) * 0.25)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Labor Price</span>
              <span className="text-white">{formatCurrency(totals?.supportLabor || 0)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-600 pt-2">
              <span className="text-gray-300">Total Est. Cost</span>
              <span className="text-white">{formatCurrency(originalTotal * 0.35)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Price</span>
              <span className="text-white">{formatCurrency(originalTotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-white">Net Profit</span>
              <span style={{ color: '#15bef0' }}>{formatCurrency(originalTotal * 0.65)}</span>
            </div>
          </div>

          {/* Upfront Payment */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Upfront Payment</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={upfrontPayment}
              onChange={(e) => onUpfrontPaymentChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            <div className="text-xs text-gray-400 mt-1">
              Total setup costs: {formatCurrency(totals?.setupCosts || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}