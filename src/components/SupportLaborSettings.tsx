'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_DEVICES } from '@/lib/defaultSupportDevices'

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

export function SupportLaborSettings() {
  const [devices, setDevices] = useState<SupportDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load devices from database on component mount
  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support-devices')
      
      if (response.ok) {
        const dbDevices = await response.json()
        
        if (dbDevices.length === 0) {
          // Initialize database with default devices
          await fetch('/api/support-devices/initialize', { method: 'POST' })
          // Reload devices after initialization
          const newResponse = await fetch('/api/support-devices')
          const newDbDevices = await newResponse.json()
          
          // Convert database format to component format
          const convertedDevices = newDbDevices.map(convertDbToComponent)
          setDevices(convertedDevices)
        } else {
          // Convert database format to component format
          const convertedDevices = dbDevices.map(convertDbToComponent)
          setDevices(convertedDevices)
        }
      } else {
        console.error('Failed to load devices, using defaults')
        setDevices(DEFAULT_DEVICES)
      }
    } catch (error) {
      console.error('Error loading devices:', error)
      setDevices(DEFAULT_DEVICES)
    } finally {
      setLoading(false)
    }
  }

  const convertDbToComponent = (dbDevice: any): SupportDevice => ({
    id: dbDevice.deviceId,
    name: dbDevice.name,
    isActive: dbDevice.isActive,
    quantity: 0, // This is not stored in DB, it's per-quote
    skillLevel: dbDevice.defaultSkillLevel,
    hours: {
      predictable: {
        onsiteBusiness: dbDevice.predictableOnsiteBusiness,
        remoteBusiness: dbDevice.predictableRemoteBusiness,
        onsiteAfterHours: dbDevice.predictableOnsiteAfterHours,
        remoteAfterHours: dbDevice.predictableRemoteAfterHours,
      },
      reactive: {
        onsiteBusiness: dbDevice.reactiveOnsiteBusiness,
        remoteBusiness: dbDevice.reactiveRemoteBusiness,
        onsiteAfterHours: dbDevice.reactiveOnsiteAfterHours,
        remoteAfterHours: dbDevice.reactiveRemoteAfterHours,
      },
      emergency: {
        onsiteBusiness: dbDevice.emergencyOnsiteBusiness,
        remoteBusiness: dbDevice.emergencyRemoteBusiness,
        onsiteAfterHours: dbDevice.emergencyOnsiteAfterHours,
        remoteAfterHours: dbDevice.emergencyRemoteAfterHours,
      }
    }
  })

  const convertComponentToDb = (device: SupportDevice) => ({
    deviceId: device.id,
    name: device.name,
    defaultSkillLevel: device.skillLevel,
    hours: device.hours
  })

  const updateDeviceHours = (deviceId: string, serviceType: 'predictable' | 'reactive' | 'emergency', timeType: 'onsiteBusiness' | 'remoteBusiness' | 'onsiteAfterHours' | 'remoteAfterHours', value: number) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId 
          ? {
              ...device,
              hours: {
                ...device.hours,
                [serviceType]: {
                  ...device.hours[serviceType],
                  [timeType]: value
                }
              }
            }
          : device
      )
    )
    setHasChanges(true)
  }

  const saveChanges = async () => {
    try {
      setSaving(true)
      
      // Save all changed devices to database
      const savePromises = devices.map(device => 
        fetch('/api/support-devices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(convertComponentToDb(device))
        })
      )
      
      await Promise.all(savePromises)
      setHasChanges(false)
      alert('Support labor settings saved successfully!')
    } catch (error) {
      console.error('Error saving devices:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      setSaving(true)
      
      // Reset each device to its default values from DEFAULT_DEVICES
      const resetPromises = DEFAULT_DEVICES.map(defaultDevice => 
        fetch('/api/support-devices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(convertComponentToDb(defaultDevice))
        })
      )
      
      await Promise.all(resetPromises)
      
      // Reload devices from database
      await loadDevices()
      setHasChanges(false)
      alert('Settings reset to defaults successfully!')
    } catch (error) {
      console.error('Error resetting to defaults:', error)
      alert('Failed to reset to defaults. Please try again.')
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading support labor settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Support Devices</h2>
          <p className="text-gray-600 mt-1">Configure support hours for each device type and service category</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Resetting...' : 'Reset to Defaults'}
          </button>
          <button
            onClick={saveChanges}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              hasChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>


      {/* Device Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Types</CardTitle>
          <p className="text-sm text-gray-600">Select a device to configure its support hours</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedDevice === device.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="mb-2">
                  <span className="font-medium text-gray-900">{device.name}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hours Configuration */}
      {selectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Configure Hours: {devices.find(d => d.id === selectedDevice)?.name}
            </CardTitle>
            <p className="text-sm text-gray-600">Set hours per device per month for each service type and timing</p>
          </CardHeader>
          <CardContent>
            {['predictable', 'reactive', 'emergency'].map((serviceType) => {
              const device = devices.find(d => d.id === selectedDevice)!
              const serviceHours = device.hours[serviceType as keyof typeof device.hours]
              
              return (
                <div key={serviceType} className="mb-8 last:mb-0">
                  <h4 className={`font-medium mb-4 text-lg ${
                    serviceType === 'predictable' ? 'text-green-700' :
                    serviceType === 'reactive' ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    {serviceType === 'predictable' ? 'Predictable Maintenance' :
                     serviceType === 'reactive' ? 'Reactive Maintenance' : 'Emergency Service'}
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Onsite Business Hours
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceHours.onsiteBusiness}
                        onChange={(e) => updateDeviceHours(
                          selectedDevice,
                          serviceType as any,
                          'onsiteBusiness',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remote Business Hours
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceHours.remoteBusiness}
                        onChange={(e) => updateDeviceHours(
                          selectedDevice,
                          serviceType as any,
                          'remoteBusiness',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Onsite After Hours
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceHours.onsiteAfterHours}
                        onChange={(e) => updateDeviceHours(
                          selectedDevice,
                          serviceType as any,
                          'onsiteAfterHours',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remote After Hours
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceHours.remoteAfterHours}
                        onChange={(e) => updateDeviceHours(
                          selectedDevice,
                          serviceType as any,
                          'remoteAfterHours',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">
                      <strong>Total {serviceType} hours per device:</strong> {' '}
                      {(serviceHours.onsiteBusiness + serviceHours.remoteBusiness + 
                        serviceHours.onsiteAfterHours + serviceHours.remoteAfterHours).toFixed(2)} hours/month
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Total Hours Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">Total Hours Summary</h5>
              <div className="text-sm text-blue-800">
                {(() => {
                  const device = devices.find(d => d.id === selectedDevice)!
                  const totalHours = 
                    Object.values(device.hours.predictable).reduce((a, b) => a + b, 0) +
                    Object.values(device.hours.reactive).reduce((a, b) => a + b, 0) +
                    Object.values(device.hours.emergency).reduce((a, b) => a + b, 0)
                  return `${totalHours.toFixed(2)} total hours per device per month`
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedDevice && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <p className="text-lg font-medium">Select a device type above to configure its support hours</p>
              <p className="text-sm mt-1">Choose from servers, users, cloud services, or infrastructure devices</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}