'use client'

import React from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_DEVICES, LocalSupportDevice } from '@/lib/defaultSupportDevices'

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

// DEFAULT_DEVICES is now imported from @/lib/defaultSupportDevices

export { DEFAULT_DEVICES }

export function SupportLaborSelector({ devices = DEFAULT_DEVICES, onChange }: SupportLaborSelectorProps) {
  // This component no longer needs to initialize devices - QuoteWizard handles that
  // useEffect and useSupportDevices removed to prevent conflicts with parent auto-calculation
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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

  const activeDevices = devices.filter(device => device.isActive)

  return (
    <div className="space-y-6">
      {/* Device Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Support Devices</CardTitle>
          <p className="text-sm text-gray-600">Select devices and infrastructure that require ongoing support</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {devices.map((device) => (
              <label key={device.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={device.isActive}
                    onChange={() => toggleDevice(device.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    device.isActive 
                      ? 'border-gray-300 hover:border-gray-400' 
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                  style={device.isActive ? { backgroundColor: '#15bef0', borderColor: '#15bef0' } : {}}>
                    {device.isActive && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{device.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Devices Configuration */}
      {activeDevices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Configure Selected Support Devices</h3>
          
          {activeDevices.map((device) => {
            const deviceCosts = calculateDeviceCost(device)
            return (
              <Card key={device.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      {getSkillLevelBadge(device.skillLevel)}
                    </div>
                    <button
                      onClick={() => toggleDevice(device.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                      title="Remove Device"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      {/* Make auto-calculated devices non-editable */}
                      {(device.name === 'MS InTune Mgmt' || device.name === 'Proactive Users' || device.name === 'Co-Managed Users') ? (
                        <span className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded border inline-block">
                          {device.quantity}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={device.quantity}
                          onChange={(e) => updateDeviceQuantity(device.id, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>Level 1 - Junior</option>
                        <option value={2}>Level 2 - Intermediate</option>
                        <option value={3}>Level 3 - Senior</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Hours/Month
                      </label>
                      <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                        {deviceCosts.totalHours.toFixed(2)} hrs per device
                      </div>
                    </div>
                  </div>

                  {/* Hours Breakdown */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Hours Breakdown (per device):</h6>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="font-medium text-green-700 mb-1">Predictable Maintenance</div>
                        <div>Onsite Business: {device.hours.predictable.onsiteBusiness}</div>
                        <div>Remote Business: {device.hours.predictable.remoteBusiness}</div>
                        <div>Onsite After Hours: {device.hours.predictable.onsiteAfterHours}</div>
                        <div>Remote After Hours: {device.hours.predictable.remoteAfterHours}</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700 mb-1">Reactive Maintenance</div>
                        <div>Onsite Business: {device.hours.reactive.onsiteBusiness}</div>
                        <div>Remote Business: {device.hours.reactive.remoteBusiness}</div>
                        <div>Onsite After Hours: {device.hours.reactive.onsiteAfterHours}</div>
                        <div>Remote After Hours: {device.hours.reactive.remoteAfterHours}</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-700 mb-1">Emergency Service</div>
                        <div>Onsite Business: {device.hours.emergency.onsiteBusiness}</div>
                        <div>Remote Business: {device.hours.emergency.remoteBusiness}</div>
                        <div>Onsite After Hours: {device.hours.emergency.onsiteAfterHours}</div>
                        <div>Remote After Hours: {device.hours.emergency.remoteAfterHours}</div>
                      </div>
                    </div>
                  </div>

                  {/* Cost/Price Breakdown by Service Type */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Cost & Price Breakdown (Qty: {device.quantity}):</h6>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="font-medium text-green-700 mb-1">Predictable ({deviceCosts.breakdown.predictable.hours.toFixed(2)} hrs)</div>
                        <div>Cost: {formatCurrency(deviceCosts.breakdown.predictable.cost)}</div>
                        <div>Price: {formatCurrency(deviceCosts.breakdown.predictable.price)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-700 mb-1">Reactive ({deviceCosts.breakdown.reactive.hours.toFixed(2)} hrs)</div>
                        <div>Cost: {formatCurrency(deviceCosts.breakdown.reactive.cost)}</div>
                        <div>Price: {formatCurrency(deviceCosts.breakdown.reactive.price)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-700 mb-1">Emergency ({deviceCosts.breakdown.emergency.hours.toFixed(2)} hrs)</div>
                        <div>Cost: {formatCurrency(deviceCosts.breakdown.emergency.cost)}</div>
                        <div>Price: {formatCurrency(deviceCosts.breakdown.emergency.price)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Total Monthly Cost
                      </label>
                      <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded">
                        {formatCurrency(deviceCosts.cost)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Total Monthly Price
                      </label>
                      <div className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded border">
                        {formatCurrency(deviceCosts.price)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}