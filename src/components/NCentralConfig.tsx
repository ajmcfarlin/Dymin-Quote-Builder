'use client'

import React from 'react'
import { NCentralConfig } from '@/types/monthlyServices'
import { calculateNCentralCostPerDevice } from '@/lib/monthlyServices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface NCentralConfigProps {
  config: NCentralConfig
  onChange: (updates: Partial<NCentralConfig>) => void
}

export function NCentralConfigSection({ config, onChange }: NCentralConfigProps) {
  const updateConfig = (updates: Partial<NCentralConfig>) => {
    // If contract structure is changing, carry over payment values
    if (updates.contractStructure && updates.contractStructure !== config.contractStructure) {
      const currentPaymentValue = config.totalInitialPurchasePrice || config.monthlyLeasePayment || config.monthlySubscriptionPayment || 0
      
      if (updates.contractStructure === 'Purchase') {
        updates.totalInitialPurchasePrice = currentPaymentValue
      } else if (updates.contractStructure === 'Lease') {
        updates.monthlyLeasePayment = currentPaymentValue
      } else if (updates.contractStructure === 'Subscription') {
        updates.monthlySubscriptionPayment = currentPaymentValue
      }
    }
    
    // Calculate the new cost per device when config changes
    const newConfig = { ...config, ...updates }
    const newCostPerDevice = calculateNCentralCostPerDevice(newConfig)
    onChange({ ...updates, costPerDevice: newCostPerDevice })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-600">N-central</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Configuration Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-700 w-48">Contract Structure</td>
                  <td className="py-2 pr-4 w-32">
                    <select
                      value={config.contractStructure}
                      onChange={(e) => updateConfig({ contractStructure: e.target.value as 'Lease' | 'Purchase' | 'Subscription' })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Lease">Lease</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Subscription">Subscription</option>
                    </select>
                  </td>
                  <td className="py-2 pr-4 font-medium text-gray-700 w-32">
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <span className="font-medium text-blue-600">{config.costPerDevice.toFixed(4)}</span>
                    </div>
                  </td>
                  <td className="py-2 font-medium text-gray-700">N-central cost / device / month (calculated)</td>
                </tr>
                
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-700">Licensing Structure</td>
                  <td className="py-2 pr-4">
                    <select
                      value={config.licensingStructure}
                      onChange={(e) => updateConfig({ licensingStructure: e.target.value as 'Device' | 'Customer' })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Device">Device</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </td>
                  <td className="py-2"></td>
                  <td className="py-2"></td>
                </tr>

                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-700">Total Number of Device Licenses Available</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      value={config.totalDeviceLicenses}
                      onChange={(e) => updateConfig({ totalDeviceLicenses: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2"></td>
                  <td className="py-2"></td>
                </tr>

                {config.contractStructure === 'Purchase' && (
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-700">Total Initial N-Central Purchase Price</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={config.totalInitialPurchasePrice}
                          onChange={(e) => updateConfig({ totalInitialPurchasePrice: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </td>
                    <td className="py-2"></td>
                    <td className="py-2"></td>
                  </tr>
                )}

                {config.contractStructure === 'Lease' && (
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-700">Monthly N-Central Lease Payment</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={config.monthlyLeasePayment}
                          onChange={(e) => updateConfig({ monthlyLeasePayment: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </td>
                    <td className="py-2"></td>
                    <td className="py-2"></td>
                  </tr>
                )}

                {config.contractStructure === 'Subscription' && (
                  <tr>
                    <td className="py-2 pr-4 font-medium text-gray-700">Monthly N-Central Subscription Payment</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={config.monthlySubscriptionPayment}
                          onChange={(e) => updateConfig({ monthlySubscriptionPayment: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </td>
                    <td className="py-2"></td>
                    <td className="py-2"></td>
                  </tr>
                )}

                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-700">Lease Length (months)</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      value={config.leaseLength}
                      onChange={(e) => updateConfig({ leaseLength: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2"></td>
                  <td className="py-2"></td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* License Planning Section */}
          <div className="border-t pt-4">
            <h5 className="font-medium mb-3 text-blue-600">License planning for this customer</h5>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Devices Monitored for this Customer</label>
                <input
                  type="number"
                  value={config.devicesMonitored}
                  onChange={(e) => updateConfig({ devicesMonitored: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}