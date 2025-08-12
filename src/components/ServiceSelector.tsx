'use client'

import React from 'react'
import { ServiceCategory } from '@/types/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ServiceSelectorProps {
  services: ServiceCategory[]
  onChange: (services: ServiceCategory[]) => void
}

export function ServiceSelector({ services, onChange }: ServiceSelectorProps) {
  const toggleService = (serviceId: string) => {
    const updatedServices = services.map(service =>
      service.id === serviceId
        ? { ...service, isActive: !service.isActive }
        : service
    )
    onChange(updatedServices)
  }

  const updateServiceHours = (serviceId: string, field: keyof ServiceCategory['hours'], value: number) => {
    const updatedServices = services.map(service =>
      service.id === serviceId
        ? { ...service, hours: { ...service.hours, [field]: value } }
        : service
    )
    onChange(updatedServices)
  }

  const getSkillLevelBadge = (level: 1 | 2 | 3) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
        Level {level}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
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
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    {getSkillLevelBadge(service.skillLevel)}
                  </div>
                </div>
              </div>

              {service.isActive && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Onsite Business
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.hours.onsiteBusiness}
                      onChange={(e) =>
                        updateServiceHours(service.id, 'onsiteBusiness', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Remote Business
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.hours.remoteBusiness}
                      onChange={(e) =>
                        updateServiceHours(service.id, 'remoteBusiness', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Onsite After Hours
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.hours.onsiteAfterHours}
                      onChange={(e) =>
                        updateServiceHours(service.id, 'onsiteAfterHours', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Remote After Hours
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.hours.remoteAfterHours}
                      onChange={(e) =>
                        updateServiceHours(service.id, 'remoteAfterHours', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}