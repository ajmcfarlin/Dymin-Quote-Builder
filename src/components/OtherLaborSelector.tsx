'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonthlyLaborService, IncidentBasedService, OtherLaborData } from '@/types/otherLabor'
import { DEFAULT_MONTHLY_LABOR_SERVICES, DEFAULT_INCIDENT_BASED_SERVICES } from '@/lib/otherLabor'
import { DEFAULT_LABOR_RATES } from '@/lib/calculations'

interface OtherLaborSelectorProps {
  otherLaborData: OtherLaborData
  onChange: (data: OtherLaborData) => void
}

export function OtherLaborSelector({ otherLaborData, onChange }: OtherLaborSelectorProps) {
  const workingMonthlyServices = otherLaborData.monthlyServices && otherLaborData.monthlyServices.length > 0 
    ? otherLaborData.monthlyServices 
    : DEFAULT_MONTHLY_LABOR_SERVICES

  const workingIncidentServices = otherLaborData.incidentServices && otherLaborData.incidentServices.length > 0
    ? otherLaborData.incidentServices
    : DEFAULT_INCIDENT_BASED_SERVICES

  const toggleMonthlyService = (serviceId: string) => {
    const updatedServices = workingMonthlyServices.map(service =>
      service.id === serviceId
        ? { ...service, isActive: !service.isActive }
        : service
    )
    onChange({
      ...otherLaborData,
      monthlyServices: updatedServices
    })
  }

  const toggleIncidentService = (serviceId: string) => {
    const updatedServices = workingIncidentServices.map(service =>
      service.id === serviceId
        ? { ...service, isActive: !service.isActive }
        : service
    )
    onChange({
      ...otherLaborData,
      incidentServices: updatedServices
    })
  }

  const updateMonthlyService = (serviceId: string, updates: Partial<MonthlyLaborService>) => {
    const updatedServices = workingMonthlyServices.map(service =>
      service.id === serviceId
        ? { ...service, ...updates }
        : service
    )
    onChange({
      ...otherLaborData,
      monthlyServices: updatedServices
    })
  }

  const updateIncidentService = (serviceId: string, updates: Partial<IncidentBasedService>) => {
    const updatedServices = workingIncidentServices.map(service =>
      service.id === serviceId
        ? { ...service, ...updates }
        : service
    )
    onChange({
      ...otherLaborData,
      incidentServices: updatedServices
    })
  }

  const calculateServicePrice = (service: MonthlyLaborService | IncidentBasedService, isIncident = false) => {
    const rates = DEFAULT_LABOR_RATES[`level${service.skillLevel}` as keyof typeof DEFAULT_LABOR_RATES]
    const priceRate = service.factor2 === 'afterhours' ? rates.priceAfterHours : rates.priceBusinessHours
    const costRate = rates.cost

    if (isIncident) {
      const incidentService = service as IncidentBasedService
      const totalHours = incidentService.hoursPerIncident * incidentService.quantityPerMonth
      return {
        cost: totalHours * costRate,
        price: totalHours * priceRate
      }
    } else {
      const monthlyService = service as MonthlyLaborService
      return {
        cost: monthlyService.hoursPerMonth * costRate,
        price: monthlyService.hoursPerMonth * priceRate
      }
    }
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

  const activeMonthlyServices = workingMonthlyServices.filter(service => service.isActive)
  const activeIncidentServices = workingIncidentServices.filter(service => service.isActive)

  return (
    <div className="space-y-6">
      {/* Monthly Recurring Services */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Services</CardTitle>
          <p className="text-sm text-gray-600">Predictable, recurring monthly services not assigned to specific devices</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workingMonthlyServices.map((service) => (
              <label key={service.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={service.isActive}
                    onChange={() => toggleMonthlyService(service.id)}
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

      {/* Active Monthly Services Configuration */}
      {activeMonthlyServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Services Configuration</h3>
          
          {activeMonthlyServices.map((service) => (
            <Card key={service.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    {getSkillLevelBadge(service.skillLevel)}
                  </div>
                  <button
                    onClick={() => toggleMonthlyService(service.id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                    title="Remove Service"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Configuration Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Level
                    </label>
                    <select
                      value={service.skillLevel}
                      onChange={(e) => updateMonthlyService(service.id, { skillLevel: parseInt(e.target.value) as 1 | 2 | 3 })}
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
                      onChange={(e) => updateMonthlyService(service.id, { factor1: e.target.value as 'onsite' | 'remote' })}
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
                      onChange={(e) => updateMonthlyService(service.id, { factor2: e.target.value as 'business' | 'afterhours' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="business">Business Hours</option>
                      <option value="afterhours">After Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours per Month
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.hoursPerMonth}
                      onChange={(e) => updateMonthlyService(service.id, { hoursPerMonth: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extended Price
                    </label>
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                      ${calculateServicePrice(service).price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Incident-Based Services */}
      <Card>
        <CardHeader>
          <CardTitle>Incident-Based Services</CardTitle>
          <p className="text-sm text-gray-600">Services charged per incident (e.g., Helpdesk calls)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workingIncidentServices.map((service) => (
              <label key={service.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={service.isActive}
                    onChange={() => toggleIncidentService(service.id)}
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
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  <div className="text-xs text-gray-500">{service.hoursPerIncident} hours per incident</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Incident Services Configuration */}
      {activeIncidentServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Incident Services Configuration</h3>
          
          {activeIncidentServices.map((service) => (
            <Card key={service.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    {getSkillLevelBadge(service.skillLevel)}
                  </div>
                  <button
                    onClick={() => toggleIncidentService(service.id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                    title="Remove Service"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Configuration Row */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours/Incident
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.hoursPerIncident}
                      onChange={(e) => updateIncidentService(service.id, { hoursPerIncident: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Level
                    </label>
                    <select
                      value={service.skillLevel}
                      onChange={(e) => updateIncidentService(service.id, { skillLevel: parseInt(e.target.value) as 1 | 2 | 3 })}
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
                      onChange={(e) => updateIncidentService(service.id, { factor1: e.target.value as 'onsite' | 'remote' })}
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
                      onChange={(e) => updateIncidentService(service.id, { factor2: e.target.value as 'business' | 'afterhours' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="business">Business Hours</option>
                      <option value="afterhours">After Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty per Month
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={service.quantityPerMonth}
                      onChange={(e) => updateIncidentService(service.id, { quantityPerMonth: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extended Price
                    </label>
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded">
                      ${calculateServicePrice(service, true).price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Initial State */}
      {activeMonthlyServices.length === 0 && activeIncidentServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Select services above to configure other labor costs and pricing.</p>
        </div>
      )}
    </div>
  )
}