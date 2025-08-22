'use client'

import React, { useEffect, useState } from 'react'
import { Info, Plus, Trash2 } from 'lucide-react'
import { MonthlyServicesData, VariableCostTool } from '@/types/monthlyServices'
import { CustomerInfo } from '@/types/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlyServicesSelectorProps {
  monthlyServices: MonthlyServicesData
  customer: CustomerInfo
  onChange: (services: MonthlyServicesData) => void
}

export function MonthlyServicesSelector({ monthlyServices, customer, onChange }: MonthlyServicesSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCost, setNewItemCost] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  // List of optional tools that can be manually edited
  const optionalToolIds = ['4181', '3410', '3522', '3415', '4164', '3914']
  
  // Check if a tool is optional (manually editable)
  const isOptionalTool = (toolId: string): boolean => {
    return optionalToolIds.includes(toolId) || toolId.startsWith('custom_')
  }

  // Check if a tool is custom (can be deleted)
  const isCustomTool = (toolId: string): boolean => {
    return toolId.startsWith('custom_')
  }

  // Get tooltip text explaining how quantity is calculated
  const getQuantityTooltip = (toolId: string): string => {
    switch (toolId) {
      case '3433': return 'Calculated from infrastructure: workstations count'
      case '3427': return 'Calculated from infrastructure: servers count'
      case '3425': return 'Calculated from infrastructure: WiFi access points count'
      case '3421': return 'Calculated from infrastructure: firewalls count'
      case '3426': return 'Calculated from infrastructure: printers count'
      case '3423': return 'Calculated from infrastructure: switches count'
      case '3428': return 'Calculated from infrastructure: UPS count'
      case '3414': return 'Calculated from infrastructure: workstations + servers'
      case '3516': return 'Calculated from users: full users + email only users'
      case '3464': return 'Calculated from infrastructure: servers count'
      case '3506': return 'Calculated from infrastructure: workstations + servers'
      case '3586': return 'Calculated from users: full users + email only users'
      case '3420': return 'Calculated from infrastructure: NAS count'
      case '3810': return 'Calculated from infrastructure: managed mobile devices count'
      case '3418': return 'Fixed quantity: always 1 per environment'
      case '3413': return 'Calculated from infrastructure: domains used for email'
      case '3412': return 'Calculated from infrastructure: domains used for email'
      case '4181': case '3410': case '3522': case '3415': case '4164': case '3914':
        return 'Optional service: quantity can be manually set as needed'
      default: 
        if (toolId.startsWith('custom_')) {
          return 'Custom item: quantity can be manually set as needed'
        }
        return 'Quantity calculation not defined'
    }
  }

  // Calculate quantities based on infrastructure data
  const calculateQuantityForTool = (tool: VariableCostTool): number => {
    const infra = customer.infrastructure
    const users = customer.users
    
    switch (tool.id) {
      case '3433': // Managed Workstation
        return infra.workstations
      case '3427': // Managed Server
        return infra.servers
      case '3425': // Managed Network WiFi Access Point
        return infra.wifiAccessPoints
      case '3421': // Managed Network Firewall
        return infra.firewalls
      case '3426': // Managed Printer
        return infra.printers
      case '3423': // Managed Network Switch
        return infra.switches
      case '3428': // Managed UPS
        return infra.ups
      case '3414': // Huntress (workstations and servers)
        return infra.workstations + infra.servers
      case '3516': // Huntress 365 (full and email only users)
        return users.full + users.emailOnly
      case '3464': // NinjaBackup (servers)
        return infra.servers
      case '3506': // ThreatLocker (workstations and servers)
        return infra.workstations + infra.servers
      case '3586': // SaaS Backup (full and email only users)
        return users.full + users.emailOnly
      case '3420': // Managed NAS
        return infra.nas
      case '3810': // Managed Mobile Device
        return infra.managedMobileDevices
      case '3418': // Longard (always 1)
        return 1
      case '3413': // Domain (domains used for email)
        return infra.domainsUsedForEmail
      case '3412': // DNS (domains used for email)
        return infra.domainsUsedForEmail
      case '4181': // IT Password (optional, default 0)
      case '3410': // Duo (optional, default 0)
      case '3522': // Infima (optional, default 0)
      case '3415': // INKY Outbound Mail Protect (optional, default 0)
      case '4164': // INKY Outbound Mail Protect (optional, default 0)
      case '3914': // Microsoft 365 (optional, default 0)
        return 0
      default:
        return 0
    }
  }

  // Auto-populate quantities when customer data changes
  useEffect(() => {
    const updatedTools = monthlyServices.variableCostTools.map(tool => {
      // Don't auto-calculate quantities for custom tools
      if (isCustomTool(tool.id)) {
        return tool
      }
      
      const calculatedQuantity = calculateQuantityForTool(tool)
      const updatedTool = { ...tool, nodesUnitsSupported: calculatedQuantity }
      
      // Recalculate costs and prices
      if (updatedTool.costPerNodeUnit) {
        updatedTool.extendedCost = updatedTool.nodesUnitsSupported * updatedTool.costPerNodeUnit
        if (updatedTool.pricePerNodeUnit) {
          updatedTool.extendedPrice = updatedTool.nodesUnitsSupported * updatedTool.pricePerNodeUnit
        }
      } else if (updatedTool.costPerCustomer) {
        updatedTool.extendedCost = updatedTool.costPerCustomer
        if (updatedTool.pricePerNodeUnit) {
          updatedTool.extendedPrice = updatedTool.pricePerNodeUnit
        }
      }
      
      // Calculate margin
      if (updatedTool.extendedPrice > 0) {
        updatedTool.margin = ((updatedTool.extendedPrice - updatedTool.extendedCost) / updatedTool.extendedPrice) * 100
      } else {
        updatedTool.margin = 0
      }
      
      return updatedTool
    })
    
    onChange({ ...monthlyServices, variableCostTools: updatedTools })
  }, [customer.infrastructure, customer.users])

  // Variable cost tools handlers

  const updateVariableTool = (toolId: string, updates: Partial<VariableCostTool>) => {
    const updatedTools = monthlyServices.variableCostTools.map(tool => {
      if (tool.id === toolId) {
        const updatedTool = { ...tool, ...updates }
        
        // Recalculate extended costs and prices when quantity changes
        if ('nodesUnitsSupported' in updates) {
          if (updatedTool.costPerNodeUnit) {
            updatedTool.extendedCost = updatedTool.nodesUnitsSupported * updatedTool.costPerNodeUnit
            if (updatedTool.pricePerNodeUnit) {
              updatedTool.extendedPrice = updatedTool.nodesUnitsSupported * updatedTool.pricePerNodeUnit
            }
          } else if (updatedTool.costPerCustomer) {
            updatedTool.extendedCost = updatedTool.costPerCustomer
            if (updatedTool.pricePerNodeUnit) {
              updatedTool.extendedPrice = updatedTool.pricePerNodeUnit
            }
          }
          
          // If quantity is 0, extended costs and prices should be 0
          if (updatedTool.nodesUnitsSupported === 0) {
            updatedTool.extendedCost = 0
            updatedTool.extendedPrice = 0
          }
          
          // Calculate margin
          if (updatedTool.extendedPrice > 0) {
            updatedTool.margin = ((updatedTool.extendedPrice - updatedTool.extendedCost) / updatedTool.extendedPrice) * 100
          } else {
            updatedTool.margin = 0
          }
        }
        
        return updatedTool
      }
      return tool
    })
    onChange({ ...monthlyServices, variableCostTools: updatedTools })
  }

  // Add custom item
  const addCustomItem = () => {
    if (!newItemName.trim() || !newItemCost || !newItemPrice || !newItemQuantity) return

    const customId = `custom_${Date.now()}`
    const costPerUnit = parseFloat(newItemCost)
    const pricePerUnit = parseFloat(newItemPrice)
    const quantity = parseInt(newItemQuantity) || 0
    const extendedCost = quantity * costPerUnit
    const extendedPrice = quantity * pricePerUnit
    const margin = extendedPrice > 0 ? ((extendedPrice - extendedCost) / extendedPrice) * 100 : 0

    const newTool: VariableCostTool = {
      id: customId,
      name: newItemName.trim(),
      isActive: true,
      nodesUnitsSupported: quantity,
      costPerNodeUnit: costPerUnit,
      extendedCost: extendedCost,
      pricePerNodeUnit: pricePerUnit,
      extendedPrice: extendedPrice,
      margin: margin
    }

    const updatedTools = [...monthlyServices.variableCostTools, newTool]
    onChange({ ...monthlyServices, variableCostTools: updatedTools })

    // Reset form
    setNewItemName('')
    setNewItemCost('')
    setNewItemPrice('')
    setNewItemQuantity('1')
    setShowAddForm(false)
  }

  // Remove custom item
  const removeCustomItem = (toolId: string) => {
    const updatedTools = monthlyServices.variableCostTools.filter(tool => tool.id !== toolId)
    onChange({ ...monthlyServices, variableCostTools: updatedTools })
  }

  // All tools are now shown by default (all are isActive: true)
  const activeVariableTools = monthlyServices.variableCostTools

  return (
    <div className="space-y-6">


      {/* Variable Cost Tools Configuration */}
      {activeVariableTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variable Cost Tools Configuration</CardTitle>
            <p className="text-sm text-gray-600">Configure quantities and pricing for monthly tools and licensing</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-700">Tool</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Units</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Cost/Unit</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Extended Cost</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Price/Unit</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Extended Price</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Margin %</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeVariableTools.map((tool, index) => {
                    const isOptional = isOptionalTool(tool.id)
                    return (
                      <tr key={tool.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-2 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{tool.name}</span>
                            <div className="relative group">
                              <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                              <div className="absolute bottom-full left-0 transform mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 min-w-max">
                                {getQuantityTooltip(tool.id)}
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {isOptional ? (
                            <input
                              type="number"
                              min="0"
                              value={tool.nodesUnitsSupported}
                              onChange={(e) => updateVariableTool(tool.id, { nodesUnitsSupported: parseInt(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="w-16 px-2 py-1 text-center text-sm text-gray-600 bg-gray-100 rounded border inline-block">
                              {tool.nodesUnitsSupported || 0}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {tool.costPerNodeUnit ? formatCurrency(tool.costPerNodeUnit) : 
                           tool.costPerCustomer ? formatCurrency(tool.costPerCustomer) : '-'}
                        </td>
                        <td className="py-2 px-2 text-center">{formatCurrency(tool.extendedCost)}</td>
                        <td className="py-2 px-2 text-center">
                          {tool.pricePerNodeUnit ? formatCurrency(tool.pricePerNodeUnit) : '-'}
                        </td>
                        <td className="py-2 px-2 text-center font-medium">{formatCurrency(tool.extendedPrice)}</td>
                        <td className="py-2 px-2 text-center">{formatPercent(tool.margin)}</td>
                        <td className="py-2 px-2 text-center">
                          {isCustomTool(tool.id) && (
                            <button
                              onClick={() => removeCustomItem(tool.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove custom item"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  
                  {/* Add Custom Item Form Row */}
                  {showAddForm && (
                    <tr className="bg-blue-50 border-t-2 border-blue-200">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder="Custom tool name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded"
                          placeholder="1"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={newItemCost}
                          onChange={(e) => setNewItemCost(e.target.value)}
                          className="w-20 px-2 py-1 text-center text-sm border border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-2 text-center text-gray-500">
                        {formatCurrency((parseInt(newItemQuantity) || 0) * (parseFloat(newItemCost) || 0))}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="w-20 px-2 py-1 text-center text-sm border border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-2 text-center text-gray-500">
                        {formatCurrency((parseInt(newItemQuantity) || 0) * (parseFloat(newItemPrice) || 0))}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-500">
                        {(() => {
                          const extendedPrice = (parseInt(newItemQuantity) || 0) * (parseFloat(newItemPrice) || 0)
                          const extendedCost = (parseInt(newItemQuantity) || 0) * (parseFloat(newItemCost) || 0)
                          const margin = extendedPrice > 0 ? ((extendedPrice - extendedCost) / extendedPrice) * 100 : 0
                          return formatPercent(margin)
                        })()}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={addCustomItem}
                            disabled={!newItemName.trim() || !newItemCost || !newItemPrice || !newItemQuantity}
                            className="text-green-600 hover:text-green-800 disabled:text-gray-400 transition-colors"
                            title="Add custom item"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setShowAddForm(false)
                              setNewItemName('')
                              setNewItemCost('')
                              setNewItemPrice('')
                              setNewItemQuantity('1')
                            }}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Cancel"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Always show Add Custom Item button */}
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={8} className="py-3 text-center">
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        Add Custom Item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}