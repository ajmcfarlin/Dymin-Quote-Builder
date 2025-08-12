'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SupportDevice {
  id: string
  name: string
  category: 'servers' | 'users' | 'cloud' | 'infrastructure'
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
}

const DEFAULT_DEVICES: SupportDevice[] = [
  {
    id: 'domain-controllers',
    name: 'Domain Controllers',
    category: 'servers',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.08, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      reactive: { onsiteBusiness: 0.24, remoteBusiness: 0.08, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0.05, remoteBusiness: 0.05, onsiteAfterHours: 0.05, remoteAfterHours: 0 }
    }
  },
  {
    id: 'ms-intune',
    name: 'MS InTune Management',
    category: 'cloud',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.05, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      reactive: { onsiteBusiness: 0.22, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0.10, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  },
  {
    id: 'terminal-server',
    name: 'Terminal Server',
    category: 'servers',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.10, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      reactive: { onsiteBusiness: 0.22, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0.10, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  },
  {
    id: 'azure-server',
    name: 'Azure Cloud Server',
    category: 'cloud',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      reactive: { onsiteBusiness: 0, remoteBusiness: 0.10, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0.05 }
    }
  },
  {
    id: 'app-server',
    name: 'Application Server',
    category: 'servers',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 },
      reactive: { onsiteBusiness: 0, remoteBusiness: 0.15, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0, remoteBusiness: 0.10, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  },
  {
    id: 'co-managed-server',
    name: 'Co-Managed Server',
    category: 'servers',
    isActive: false,
    quantity: 0,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0.03, remoteBusiness: 0.10, onsiteAfterHours: 0, remoteAfterHours: 0.05 },
      reactive: { onsiteBusiness: 0, remoteBusiness: 0, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0, remoteBusiness: 0, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  },
  {
    id: 'proactive-users',
    name: 'Proactive Users',
    category: 'users',
    isActive: false,
    quantity: 0,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0.05, remoteBusiness: 0.03, onsiteAfterHours: 0, remoteAfterHours: 0.01 },
      reactive: { onsiteBusiness: 0.02, remoteBusiness: 0.06, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0.05, remoteBusiness: 0.05, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  },
  {
    id: 'essential-users',
    name: 'Essential Users',
    category: 'users',
    isActive: false,
    quantity: 0,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0, remoteBusiness: 0.10, onsiteAfterHours: 0, remoteAfterHours: 0.01 },
      reactive: { onsiteBusiness: 0, remoteBusiness: 0.10, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0, remoteBusiness: 0.10, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  },
  {
    id: 'co-managed-users',
    name: 'Co-Managed Users',
    category: 'users',
    isActive: false,
    quantity: 0,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0.02, remoteBusiness: 0.03, onsiteAfterHours: 0, remoteAfterHours: 0.01 },
      reactive: { onsiteBusiness: 0, remoteBusiness: 0, onsiteAfterHours: 0, remoteAfterHours: 0 },
      emergency: { onsiteBusiness: 0, remoteBusiness: 0, onsiteAfterHours: 0, remoteAfterHours: 0 }
    }
  }
]

export function SupportLaborSelector({ devices, onChange }: SupportLaborSelectorProps) {
  const workingDevices = devices && devices.length > 0 ? devices : DEFAULT_DEVICES
  const toggleDevice = (deviceId: string) => {
    const updatedDevices = workingDevices.map(device =>
      device.id === deviceId
        ? { ...device, isActive: !device.isActive }
        : device
    )
    onChange(updatedDevices)
  }

  const updateDeviceQuantity = (deviceId: string, quantity: number) => {
    const updatedDevices = workingDevices.map(device =>
      device.id === deviceId
        ? { ...device, quantity: Math.max(0, quantity) }
        : device
    )
    onChange(updatedDevices)
  }

  const updateDeviceSkillLevel = (deviceId: string, skillLevel: 1 | 2 | 3) => {
    const updatedDevices = workingDevices.map(device =>
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


  const groupedDevices = {
    servers: workingDevices.filter(d => d.category === 'servers'),
    users: workingDevices.filter(d => d.category === 'users'),
    cloud: workingDevices.filter(d => d.category === 'cloud'),
    infrastructure: workingDevices.filter(d => d.category === 'infrastructure')
  }

  const activeDevices = workingDevices.filter(device => device.isActive)

  const calculateDeviceTotal = (device: SupportDevice) => {
    const { hours } = device
    return (
      hours.predictable.onsiteBusiness + hours.predictable.remoteBusiness + 
      hours.predictable.onsiteAfterHours + hours.predictable.remoteAfterHours +
      hours.reactive.onsiteBusiness + hours.reactive.remoteBusiness + 
      hours.reactive.onsiteAfterHours + hours.reactive.remoteAfterHours +
      hours.emergency.onsiteBusiness + hours.emergency.remoteBusiness + 
      hours.emergency.onsiteAfterHours + hours.emergency.remoteAfterHours
    )
  }

  return (
    <div className="space-y-6">
      {/* Device Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Support Device Types</CardTitle>
          <p className="text-sm text-gray-600">Select the device types that require ongoing support</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workingDevices.map((device) => (
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

      {/* Selected Device Configuration */}
      {activeDevices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Support Labor Configuration</h3>
          
          {activeDevices.map((device) => (
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
                    title="Remove Device Type"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Configuration Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={device.quantity}
                      onChange={(e) => updateDeviceQuantity(device.id, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                      Hours per Device/Month
                    </label>
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                      {calculateDeviceTotal(device).toFixed(2)} hrs
                    </div>
                  </div>
                </div>

                {/* Hours Breakdown */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Monthly Hours Breakdown</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-gray-600 mb-1">Predictable Maintenance</div>
                      <div className="text-gray-500">
                        Onsite Business: {device.hours.predictable.onsiteBusiness}h<br/>
                        Remote Business: {device.hours.predictable.remoteBusiness}h<br/>
                        Onsite After Hrs: {device.hours.predictable.onsiteAfterHours}h<br/>
                        Remote After Hrs: {device.hours.predictable.remoteAfterHours}h
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600 mb-1">Reactive Maintenance</div>
                      <div className="text-gray-500">
                        Onsite Business: {device.hours.reactive.onsiteBusiness}h<br/>
                        Remote Business: {device.hours.reactive.remoteBusiness}h<br/>
                        Onsite After Hrs: {device.hours.reactive.onsiteAfterHours}h<br/>
                        Remote After Hrs: {device.hours.reactive.remoteAfterHours}h
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600 mb-1">Emergency Service</div>
                      <div className="text-gray-500">
                        Onsite Business: {device.hours.emergency.onsiteBusiness}h<br/>
                        Remote Business: {device.hours.emergency.remoteBusiness}h<br/>
                        Onsite After Hrs: {device.hours.emergency.onsiteAfterHours}h<br/>
                        Remote After Hrs: {device.hours.emergency.remoteAfterHours}h
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Initial State */}
      {activeDevices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Select device types above to configure support labor hours and costs.</p>
        </div>
      )}
    </div>
  )
}