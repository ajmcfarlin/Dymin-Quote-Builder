'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Simple tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}
interface SupportDevice {
  id: string
  name: string
  isActive: boolean
  quantity: number
  skillLevel: 1 | 2 | 3
  hours: {
    predictable: {
      onsiteBusiness: number
      remoteBusiness: number
      onsiteAfterHours: number
      remoteAfterHours: number
    }
    reactive: {
      onsiteBusiness: number
      remoteBusiness: number
      onsiteAfterHours: number
      remoteAfterHours: number
    }
    emergency: {
      onsiteBusiness: number
      remoteBusiness: number
      onsiteAfterHours: number
      remoteAfterHours: number
    }
  }
}

interface SupportLaborSelectorProps {
  devices: SupportDevice[]
  onChange: (devices: SupportDevice[]) => void
  customer?: any
  setupServices?: any[]
}

// Support device configuration is now handled in QuoteContext

export function SupportLaborSelector({ devices = [], onChange }: SupportLaborSelectorProps) {
  // Auto-calculation and device initialization is now handled in QuoteContext
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set())
  const [expandedMobileCards, setExpandedMobileCards] = useState<Set<string>>(new Set())
  
  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select()
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Get tooltip for predefined quantities
  const getQuantityTooltip = (deviceId: string): string => {
    switch (deviceId) {
      case 'ms-intune-mgmt':
        return 'Calculated from InTune onboarding setup service selection (1 when active)'
      case 'proactive-users':
        return 'Calculated from full users count for Managed Services contracts'
      case 'co-managed-users':
        return 'Calculated from full users count for Co-Managed Services contracts'
      case 'domain-controllers':
        return 'Number of domain controllers requiring support'
      case 'terminal-server':
        return 'Number of terminal servers requiring support'
      case 'azure-cloud-server':
        return 'Number of Azure cloud servers requiring support'
      case 'application-server':
        return 'Number of application servers requiring support'
      case 'co-managed-server':
        return 'Number of co-managed servers requiring support'
      case 'essential-users':
        return 'Number of essential users requiring basic support'
      default:
        return 'Manual quantity adjustment'
    }
  }

  // Check if quantity is auto-calculated
  const isAutoCalculated = (deviceId: string): boolean => {
    return ['ms-intune-mgmt', 'proactive-users', 'co-managed-users'].includes(deviceId)
  }
  
  const toggleDeviceExpansion = (deviceId: string) => {
    const newExpanded = new Set(expandedDevices)
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId)
    } else {
      newExpanded.add(deviceId)
    }
    setExpandedDevices(newExpanded)
  }

  const toggleMobileCardExpansion = (deviceId: string) => {
    const newExpanded = new Set(expandedMobileCards)
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId)
    } else {
      newExpanded.add(deviceId)
    }
    setExpandedMobileCards(newExpanded)
  }

  const toggleDevice = (deviceId: string) => {
    const updatedDevices = devices.map(device =>
      device.id === deviceId
        ? { ...device, isActive: !device.isActive }
        : device
    )
    onChange(updatedDevices)
  }

  const updateDeviceQuantity = (deviceId: string, quantity: number) => {
    const updatedDevices = devices.map(device =>
      device.id === deviceId
        ? { ...device, quantity }
        : device
    )
    onChange(updatedDevices)
  }

  const updateDeviceSkillLevel = (deviceId: string, skillLevel: 1 | 2 | 3) => {
    const updatedDevices = devices.map(device =>
      device.id === deviceId
        ? { ...device, skillLevel }
        : device
    )
    onChange(updatedDevices)
  }


  const calculateDeviceCost = (device: SupportDevice) => {
    const costRates = { 1: 22, 2: 37, 3: 46 }
    const priceRates = { 
      1: { business: 155, afterHours: 155 },
      2: { business: 185, afterHours: 275 },
      3: { business: 275, afterHours: 375 }
    }
    
    const calculateServiceTypeCost = (hours: any) => {
      // Cost is always the same rate regardless of time
      const cost = device.quantity * (
        (hours.onsiteBusiness + hours.remoteBusiness + hours.onsiteAfterHours + hours.remoteAfterHours) * costRates[device.skillLevel]
      )
      
      // Price varies by business vs after hours
      const businessHoursPrice = device.quantity * (
        (hours.onsiteBusiness + hours.remoteBusiness) * priceRates[device.skillLevel].business
      )
      const afterHoursPrice = device.quantity * (
        (hours.onsiteAfterHours + hours.remoteAfterHours) * priceRates[device.skillLevel].afterHours
      )
      const price = businessHoursPrice + afterHoursPrice
      
      const totalHours = hours.onsiteBusiness + hours.remoteBusiness + hours.onsiteAfterHours + hours.remoteAfterHours
      
      return { cost, price, hours: totalHours }
    }

    const predictable = calculateServiceTypeCost(device.hours.predictable)
    const reactive = calculateServiceTypeCost(device.hours.reactive)
    const emergency = calculateServiceTypeCost(device.hours.emergency)
    
    const totalHours = predictable.hours + reactive.hours + emergency.hours
    const totalCost = predictable.cost + reactive.cost + emergency.cost
    const totalPrice = predictable.price + reactive.price + emergency.price

    return { 
      cost: totalCost, 
      price: totalPrice, 
      totalHours,
      breakdown: {
        predictable: { hours: predictable.hours, cost: predictable.cost, price: predictable.price },
        reactive: { hours: reactive.hours, cost: reactive.cost, price: reactive.price },
        emergency: { hours: emergency.hours, cost: emergency.cost, price: emergency.price }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Support Labor Services - Table Style like Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Support Labor Services</CardTitle>
          <p className="text-sm text-gray-600">Configure devices and infrastructure requiring ongoing support</p>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Labor Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours/Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => {
                  const deviceCosts = calculateDeviceCost(device)
                  const isExpanded = expandedDevices.has(device.id)
                  const autoQuantity = isAutoCalculated(device.id)
                  
                  return (
                    <React.Fragment key={device.id}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          // Don't expand if clicking on form elements
                          if ((e.target as HTMLElement).tagName === 'INPUT' || 
                              (e.target as HTMLElement).tagName === 'SELECT' ||
                              (e.target as HTMLElement).tagName === 'BUTTON') {
                            return
                          }
                          toggleDeviceExpansion(device.id)
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDeviceExpansion(device.id)
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{device.name}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {autoQuantity ? (
                              <span className="w-20 px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded border inline-block text-center">
                                {device.quantity}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                value={device.quantity}
                                onChange={(e) => updateDeviceQuantity(device.id, parseInt(e.target.value) || 0)}
                                onFocus={handleNumberInputFocus}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )}
                            <Tooltip content={getQuantityTooltip(device.id)}>
                              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Info size={14} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <select
                            value={device.skillLevel}
                            onChange={(e) => updateDeviceSkillLevel(device.id, parseInt(e.target.value) as 1 | 2 | 3)}
                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={1}>Level 1</option>
                            <option value={2}>Level 2</option>
                            <option value={3}>Level 3</option>
                          </select>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {deviceCosts.totalHours.toFixed(2)} hrs
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(deviceCosts.price)}
                          </span>
                        </td>
                        
                      </tr>
                      
                      {/* Expandable Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Hours Breakdown */}
                              <div className="p-4 bg-white rounded-lg border">
                                <h5 className="text-sm font-medium text-gray-900 mb-3">Hours Breakdown (per device)</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-700">Predictable Maintenance</div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Onsite Business: {device.hours.predictable.onsiteBusiness}</div>
                                      <div>Remote Business: {device.hours.predictable.remoteBusiness}</div>
                                      <div>Onsite After Hours: {device.hours.predictable.onsiteAfterHours}</div>
                                      <div>Remote After Hours: {device.hours.predictable.remoteAfterHours}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-700">Reactive Maintenance</div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Onsite Business: {device.hours.reactive.onsiteBusiness}</div>
                                      <div>Remote Business: {device.hours.reactive.remoteBusiness}</div>
                                      <div>Onsite After Hours: {device.hours.reactive.onsiteAfterHours}</div>
                                      <div>Remote After Hours: {device.hours.reactive.remoteAfterHours}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-700">Emergency Service</div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Onsite Business: {device.hours.emergency.onsiteBusiness}</div>
                                      <div>Remote Business: {device.hours.emergency.remoteBusiness}</div>
                                      <div>Onsite After Hours: {device.hours.emergency.onsiteAfterHours}</div>
                                      <div>Remote After Hours: {device.hours.emergency.remoteAfterHours}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Cost Breakdown */}
                              <div className="p-4 bg-white rounded-lg border">
                                <h5 className="text-sm font-medium text-gray-900 mb-3">Cost & Price Breakdown (Total for {device.quantity} devices)</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-700">Predictable ({deviceCosts.breakdown.predictable.hours.toFixed(2)} hrs)</div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Cost: {formatCurrency(deviceCosts.breakdown.predictable.cost)}</div>
                                      <div>Price: {formatCurrency(deviceCosts.breakdown.predictable.price)}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-700">Reactive ({deviceCosts.breakdown.reactive.hours.toFixed(2)} hrs)</div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Cost: {formatCurrency(deviceCosts.breakdown.reactive.cost)}</div>
                                      <div>Price: {formatCurrency(deviceCosts.breakdown.reactive.price)}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-700">Emergency ({deviceCosts.breakdown.emergency.hours.toFixed(2)} hrs)</div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Cost: {formatCurrency(deviceCosts.breakdown.emergency.cost)}</div>
                                      <div>Price: {formatCurrency(deviceCosts.breakdown.emergency.price)}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200">
                                  <div>
                                    <div className="text-xs text-gray-600">Total Monthly Cost</div>
                                    <div className="font-medium text-gray-900">{formatCurrency(deviceCosts.cost)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-600">Total Monthly Price</div>
                                    <div className="font-medium text-gray-900">{formatCurrency(deviceCosts.price)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {devices.map((device) => {
              const deviceCosts = calculateDeviceCost(device)
              const isExpanded = expandedMobileCards.has(device.id)
              const autoQuantity = isAutoCalculated(device.id)
              
              return (
                <Card key={device.id} className="border border-gray-200">
                  <CardHeader 
                    className="py-3 cursor-pointer"
                    onClick={() => toggleMobileCardExpansion(device.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {isExpanded ? <ChevronDown size={16} style={{ color: '#15bef0' }} /> : <ChevronRight size={16} style={{ color: '#15bef0' }} />}
                        </div>
                        <CardTitle className="text-sm">{device.name}</CardTitle>
                        <Tooltip content={getQuantityTooltip(device.id)}>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Info size={14} />
                          </button>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isExpanded && (
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(deviceCosts.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Configuration Section */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            {autoQuantity ? (
                              <div className="w-full px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded border text-center">
                                {device.quantity}
                              </div>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                value={device.quantity}
                                onChange={(e) => updateDeviceQuantity(device.id, parseInt(e.target.value) || 0)}
                                onFocus={handleNumberInputFocus}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Labor Level
                            </label>
                            <select
                              value={device.skillLevel}
                              onChange={(e) => updateDeviceSkillLevel(device.id, parseInt(e.target.value) as 1 | 2 | 3)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                            >
                              <option value={1}>Level 1</option>
                              <option value={2}>Level 2</option>
                              <option value={3}>Level 3</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Hours/Month
                            </label>
                            <div className="w-full px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded border">
                              {deviceCosts.totalHours.toFixed(2)} hrs
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monthly Price
                            </label>
                            <div className="w-full px-2 py-1 text-sm font-semibold text-gray-900 bg-gray-100 rounded border">
                              {formatCurrency(deviceCosts.price)}
                            </div>
                          </div>
                        </div>

                        {/* Hours Breakdown */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Hours Breakdown (per device)</h5>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Predictable Maintenance</div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>Onsite Business: {device.hours.predictable.onsiteBusiness}</div>
                                <div>Remote Business: {device.hours.predictable.remoteBusiness}</div>
                                <div>Onsite After Hours: {device.hours.predictable.onsiteAfterHours}</div>
                                <div>Remote After Hours: {device.hours.predictable.remoteAfterHours}</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Reactive Maintenance</div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>Onsite Business: {device.hours.reactive.onsiteBusiness}</div>
                                <div>Remote Business: {device.hours.reactive.remoteBusiness}</div>
                                <div>Onsite After Hours: {device.hours.reactive.onsiteAfterHours}</div>
                                <div>Remote After Hours: {device.hours.reactive.remoteAfterHours}</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Emergency Service</div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>Onsite Business: {device.hours.emergency.onsiteBusiness}</div>
                                <div>Remote Business: {device.hours.emergency.remoteBusiness}</div>
                                <div>Onsite After Hours: {device.hours.emergency.onsiteAfterHours}</div>
                                <div>Remote After Hours: {device.hours.emergency.remoteAfterHours}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Cost & Price Breakdown</h5>
                          <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <div className="font-medium text-gray-700">Predictable</div>
                                <div className="text-xs text-gray-600">
                                  <div>Cost: {formatCurrency(deviceCosts.breakdown.predictable.cost)}</div>
                                  <div>Price: {formatCurrency(deviceCosts.breakdown.predictable.price)}</div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-700">Reactive</div>
                                <div className="text-xs text-gray-600">
                                  <div>Cost: {formatCurrency(deviceCosts.breakdown.reactive.cost)}</div>
                                  <div>Price: {formatCurrency(deviceCosts.breakdown.reactive.price)}</div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-700">Emergency</div>
                                <div className="text-xs text-gray-600">
                                  <div>Cost: {formatCurrency(deviceCosts.breakdown.emergency.cost)}</div>
                                  <div>Price: {formatCurrency(deviceCosts.breakdown.emergency.price)}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-300">
                              <div>
                                <div className="text-xs text-gray-600">Total Monthly Cost</div>
                                <div className="font-medium text-gray-900">{formatCurrency(deviceCosts.cost)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600">Total Monthly Price</div>
                                <div className="font-medium text-gray-900">{formatCurrency(deviceCosts.price)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}