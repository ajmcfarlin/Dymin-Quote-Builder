'use client'

import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OtherLaborData, CustomLaborItem } from '@/types/otherLabor'

interface OtherLaborSelectorProps {
  otherLaborData: OtherLaborData
  onChange: (data: OtherLaborData) => void
  supportLaborTotal: number
}

export function OtherLaborSelector({ otherLaborData, onChange, supportLaborTotal }: OtherLaborSelectorProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const budgetTotal = supportLaborTotal * (otherLaborData.percentage / 100)
  const customItemsTotal = otherLaborData.customItems.reduce((sum, item) => sum + item.price, 0)
  const remainingBudget = budgetTotal - customItemsTotal

  const addCustomItem = () => {
    if (!newItemName.trim() || !newItemPrice) return

    const newItem: CustomLaborItem = {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      price: parseFloat(newItemPrice) || 0
    }

    onChange({
      ...otherLaborData,
      customItems: [...otherLaborData.customItems, newItem]
    })

    setNewItemName('')
    setNewItemPrice('')
    setShowAddForm(false)
  }

  const removeCustomItem = (itemId: string) => {
    onChange({
      ...otherLaborData,
      customItems: otherLaborData.customItems.filter(item => item.id !== itemId)
    })
  }

  const useRemainingBudget = () => {
    if (remainingBudget <= 0) return
    
    setNewItemPrice(remainingBudget.toString())
  }


  return (
    <div className="space-y-6">
      {/* Budget Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Budget</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {formatCurrency(remainingBudget)}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(customItemsTotal)} used of {formatCurrency(budgetTotal)} total
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Labor Items */}
      <Card>
        <CardHeader>
          <CardTitle>Other Labor Items</CardTitle>
          <p className="text-sm text-gray-600">Add additional labor items as needed</p>
        </CardHeader>
        <CardContent>
          {otherLaborData.customItems.length > 0 && (
            <div className="space-y-3 mb-4">
              {otherLaborData.customItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => removeCustomItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddForm ? (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="Labor item description"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {remainingBudget > 0 && (
                    <button
                      type="button"
                      onClick={useRemainingBudget}
                      className="w-full mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Use Remaining ({formatCurrency(remainingBudget)})
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={addCustomItem}
                  disabled={!newItemName.trim() || !newItemPrice}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewItemName('')
                    setNewItemPrice('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Plus size={16} />
              Add Custom Labor Item
            </button>
          )}

          {otherLaborData.customItems.length === 0 && !showAddForm && (
            <div className="text-center py-6 text-gray-500">
              <p>No custom labor items added yet.</p>
              <p className="text-sm">Click "Add Custom Labor Item" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}