'use client'

import React, { useState } from 'react'
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { SetupService, CustomerInfo } from '@/types/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSetupServiceHours } from '@/lib/setupServiceCalculations'

interface SetupServiceSelectorProps {
  setupServices: SetupService[]
  customer?: CustomerInfo
  upfrontPayment?: number
  onChange: (services: SetupService[]) => void
  onUpfrontPaymentChange?: (amount: number) => void
}

export function SetupServiceSelector({ setupServices, customer, upfrontPayment = 0, onChange, onUpfrontPaymentChange }: SetupServiceSelectorProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select()
    }
  }

  const toggleCardExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId)
    } else {
      newExpanded.add(serviceId)
    }
    setExpandedCards(newExpanded)
  }

  const toggleService = (serviceId: string) => {
    const updatedServices = setupServices.map(service =>
      service.id === serviceId
        ? { ...service, isActive: !service.isActive }
        : service
    )
    onChange(updatedServices)
  }

  const updateServiceSkillLevel = (serviceId: string, skillLevel: 1 | 2 | 3) => {
    const updatedServices = setupServices.map(service =>
      service.id === serviceId
        ? { ...service, skillLevel }
        : service
    )
    onChange(updatedServices)
  }

  const updateServiceFactor1 = (serviceId: string, factor1: 'onsite' | 'remote') => {
    const updatedServices = setupServices.map(service =>
      service.id === serviceId
        ? { ...service, factor1 }
        : service
    )
    onChange(updatedServices)
  }

  const updateServiceFactor2 = (serviceId: string, factor2: 'business' | 'afterhours') => {
    const updatedServices = setupServices.map(service =>
      service.id === serviceId
        ? { ...service, factor2 }
        : service
    )
    onChange(updatedServices)
  }

  // Hours are now calculated automatically, no manual input needed
  const getSkillLevelBadge = (level: 1 | 2 | 3) => {
    const colors = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-red-100 text-red-800'
    }
    const labels = {
      1: 'Level 1 (Junior)',
      2: 'Level 2 (Intermediate)', 
      3: 'Level 3 (Senior)'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
        {labels[level]}
      </span>
    )
  }

  const activeServices = setupServices.filter(service => service.isActive)

  // Calculate totals for active services
  const calculateTotals = () => {
    if (!customer) return { totalHours: 0, totalCost: 0, totalPrice: 0 }

    return activeServices.reduce((totals, service) => {
      const hours = calculateSetupServiceHours(service.id, service.isActive, customer)
      const costRate = service.skillLevel === 1 ? 22 : service.skillLevel === 2 ? 37 : 46
      const priceRate = service.skillLevel === 1 ? 155 : service.skillLevel === 2 ? 185 : 275

      let serviceCost = hours * costRate
      let servicePrice = hours * priceRate

      // Email Migration includes license costs
      if (service.id === 'email-migration') {
        const costLicense = 28 * ((customer.users.full || 0) + (customer.users.emailOnly || 0))
        const priceLicense = 42 * ((customer.users.full || 0) + (customer.users.emailOnly || 0))
        serviceCost += costLicense
        servicePrice += priceLicense
      }

      return {
        totalHours: totals.totalHours + hours,
        totalCost: totals.totalCost + serviceCost,
        totalPrice: totals.totalPrice + servicePrice
      }
    }, { totalHours: 0, totalCost: 0, totalPrice: 0 })
  }

  const totals = calculateTotals()
  const deferredSetupPrice = customer?.contractMonths 
    ? (totals.totalPrice - upfrontPayment) / customer.contractMonths 
    : 0

  return (
    <div className="space-y-6">
      {/* Service Selection Box */}
      <Card>
        <CardHeader>
          <CardTitle>Available Setup Services</CardTitle>
          <p className="text-sm text-gray-600">Select the services needed for this project</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {setupServices.map((service) => (
              <label key={service.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={service.isActive}
                    onChange={() => toggleService(service.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    service.isActive 
                      ? 'border-gray-300 hover:border-gray-400' 
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                  style={service.isActive ? { backgroundColor: '#15bef0', borderColor: '#15bef0' } : {}}>
                    {service.isActive && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{service.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Services Configuration */}
      {activeServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Selected Services Configuration</h3>
          
          {activeServices.map((service) => {
            const isExpanded = expandedCards.has(service.id)
            const servicePrice = customer && service.skillLevel ? 
              (() => {
                const baseRates = {
                  1: { business: 155, afterhours: 155 },
                  2: { business: 185, afterhours: 275 },
                  3: { business: 275, afterhours: 375 }
                }
                const hours = calculateSetupServiceHours(service.id, service.isActive, customer)
                const rate = baseRates[service.skillLevel]?.[service.factor2]
                
                if (!rate || isNaN(hours)) return '0.00'
                
                let totalCost = hours * rate
                
                // Email Migration includes license costs
                if (service.id === 'email-migration') {
                  const licenseCost = 42 * ((customer.users.full || 0) + (customer.users.emailOnly || 0))
                  totalCost += licenseCost
                }
                
                return totalCost.toFixed(2)
              })()
              : '0.00'

            return (
              <Card key={service.id}>
                <CardHeader 
                  className="py-3 md:cursor-auto cursor-pointer"
                  onClick={() => toggleCardExpansion(service.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="md:hidden flex-shrink-0">
                        {isExpanded ? <ChevronDown size={16} style={{ color: '#15bef0' }} /> : <ChevronRight size={16} style={{ color: '#15bef0' }} />}
                      </div>
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <div className="hidden md:block">
                        {getSkillLevelBadge(service.skillLevel)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mobile: Show price when collapsed */}
                      <div className="md:hidden">
                        {!isExpanded && (
                          <span className="text-sm font-semibold text-gray-900">
                            ${servicePrice}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleService(service.id)
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                        title="Remove Service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className={`${!isExpanded ? 'hidden md:block' : 'block'}`}>
                {/* Configuration Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Level
                    </label>
                    <select
                      value={service.skillLevel}
                      onChange={(e) => updateServiceSkillLevel(service.id, parseInt(e.target.value) as 1 | 2 | 3)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>Level 1 - Junior</option>
                      <option value={2}>Level 2 - Intermediate</option>
                      <option value={3}>Level 3 - Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Factor 1
                    </label>
                    <select
                      value={service.factor1}
                      onChange={(e) => updateServiceFactor1(service.id, e.target.value as 'onsite' | 'remote')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="onsite">Onsite</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Factor 2
                    </label>
                    <select
                      value={service.factor2}
                      onChange={(e) => updateServiceFactor2(service.id, e.target.value as 'business' | 'afterhours')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="business">Business Hours</option>
                      <option value="afterhours">After Hours</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours
                    </label>
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                      {customer ? 
                        calculateSetupServiceHours(service.id, service.isActive, customer).toFixed(2)
                        : '0.00'} hrs
                    </div>
                  </div>
                </div>

                {/* Pricing Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Cost Rate
                    </label>
                    <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                      ${service.skillLevel === 1 ? '22' : service.skillLevel === 2 ? '37' : '46'}/hr
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Price Rate
                    </label>
                    <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded">
                      ${(() => {
                        const baseRates = {
                          1: { business: 155, afterhours: 155 },
                          2: { business: 185, afterhours: 275 },
                          3: { business: 275, afterhours: 375 }
                        }
                        return baseRates[service.skillLevel][service.factor2]
                      })()}/hr
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Cost
                    </label>
                    <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                      ${customer && service.skillLevel ? 
                        (() => {
                          const hours = calculateSetupServiceHours(service.id, service.isActive, customer)
                          const costRate = service.skillLevel === 1 ? 22 : service.skillLevel === 2 ? 37 : 46
                          let totalCost = hours * costRate
                          
                          // Email Migration includes license costs
                          if (service.id === 'email-migration') {
                            const licenseCost = 28 * ((customer.users.full || 0) + (customer.users.emailOnly || 0))
                            totalCost += licenseCost
                          }
                          
                          return totalCost.toFixed(2)
                        })()
                        : '0.00'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Price
                    </label>
                    <div className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded border">
                      ${customer && service.skillLevel ? 
                        (() => {
                          const baseRates = {
                            1: { business: 155, afterhours: 155 },
                            2: { business: 185, afterhours: 275 },
                            3: { business: 275, afterhours: 375 }
                          }
                          const hours = calculateSetupServiceHours(service.id, service.isActive, customer)
                          const rate = baseRates[service.skillLevel]?.[service.factor2]
                          
                          if (!rate || isNaN(hours)) {
                            console.log('NaN Error:', { serviceId: service.id, skillLevel: service.skillLevel, factor2: service.factor2, hours, rate })
                            return 'Error'
                          }
                          
                          let totalCost = hours * rate
                          
                          // Email Migration includes license costs
                          if (service.id === 'email-migration') {
                            const licenseCost = 42 * ((customer.users.full || 0) + (customer.users.emailOnly || 0))
                            totalCost += licenseCost
                          }
                          
                          return totalCost.toFixed(2)
                        })()
                        : '0.00'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Setup Services Totals */}
      {activeServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Services Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Hours
                </label>
                <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                  {totals.totalHours.toFixed(2)} hrs
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cost
                </label>
                <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                  ${totals.totalCost.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price
                </label>
                <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                  ${totals.totalPrice.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upfront Payment
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={upfrontPayment}
                  onChange={(e) => onUpfrontPaymentChange?.(parseFloat(e.target.value) || 0)}
                  onFocus={handleNumberInputFocus}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-700">Deferred Setup Price</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${deferredSetupPrice.toFixed(2)}/month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}