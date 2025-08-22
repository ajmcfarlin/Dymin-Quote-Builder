import { useState, useEffect } from 'react'
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

export function useSupportDevices() {
  const [devices, setDevices] = useState<SupportDevice[]>(DEFAULT_DEVICES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      
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
        console.error('Failed to load devices from database, using defaults')
        setDevices(DEFAULT_DEVICES)
      }
    } catch (err) {
      console.error('Error loading support devices:', err)
      setError('Failed to load support device configurations')
      setDevices(DEFAULT_DEVICES)
    } finally {
      setLoading(false)
    }
  }

  const convertDbToComponent = (dbDevice: any): SupportDevice => {
    return {
      id: dbDevice.deviceId,
      name: dbDevice.name,
      isActive: false, // Always start inactive for new quotes
      quantity: dbDevice.deviceId === 'proactive-users' ? 25 : 0, // Special case for proactive users
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
    }
  }

  return {
    devices,
    loading,
    error,
    refetch: loadDevices
  }
}