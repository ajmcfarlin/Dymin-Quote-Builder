'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { CustomerInfo, SetupService, QuoteCalculation } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
import { calculateQuote } from '@/lib/calculations'
import { DEFAULT_SETUP_SERVICES } from '@/lib/setupServices'
import { DEFAULT_FIXED_COST_TOOLS, DEFAULT_VARIABLE_COST_TOOLS } from '@/lib/monthlyServices'
import { CustomerForm } from './CustomerForm'
import { SetupServiceSelector } from './SetupServiceSelector'
import { MonthlyServicesSelector } from './MonthlyServicesSelector'
import { PricingSummary } from './PricingSummary'
import { SupportLaborSelector } from './SupportLaborSelector'

export function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentMonthlyTab, setCurrentMonthlyTab] = useState('tools')
  const [quoteSummaryExpanded, setQuoteSummaryExpanded] = useState(false)
  const [maxContentHeight, setMaxContentHeight] = useState<number | null>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [customer, setCustomer] = useState<CustomerInfo>({
    companyName: '',
    address: '',
    region: 'United States',
    contractMonths: 36,
    contractType: 'Managed Services',
    users: { full: 0, emailOnly: 0 },
    infrastructure: { workstations: 0, servers: 0, printers: 0, phoneExtensions: 0 }
  })
  const [setupServices, setSetupServices] = useState<SetupService[]>(DEFAULT_SETUP_SERVICES)
  const [monthlyServices, setMonthlyServices] = useState<MonthlyServicesData>({
    fixedCostTools: DEFAULT_FIXED_COST_TOOLS,
    variableCostTools: DEFAULT_VARIABLE_COST_TOOLS
  })
  const [supportDevices, setSupportDevices] = useState<any[]>([])
  const [calculations, setCalculations] = useState<QuoteCalculation>()

  const handleCustomerChange = useMemo(() => (newCustomer: CustomerInfo) => {
    setCustomer(newCustomer)
  }, [])

  const handleSetupServicesChange = useMemo(() => (newSetupServices: SetupService[]) => {
    setSetupServices(newSetupServices)
  }, [])

  const handleMonthlyServicesChange = useMemo(() => (newMonthlyServices: MonthlyServicesData) => {
    setMonthlyServices(newMonthlyServices)
  }, [])

  const activeDevices = supportDevices.filter(device => device.isActive)
  const activeServices = setupServices.filter(service => service.isActive)

  useEffect(() => {
    // Always include monthly services in calculations if any are active
    const hasActiveMonthlyServices = monthlyServices.fixedCostTools.some(tool => tool.isActive) || 
                                   monthlyServices.variableCostTools.some(tool => tool.isActive)
    const monthlyServicesForCalculation = hasActiveMonthlyServices ? monthlyServices : undefined
    const newCalculations = calculateQuote(customer, [], setupServices, monthlyServicesForCalculation)
    setCalculations(newCalculations)
  }, [customer, setupServices, monthlyServices, currentStep])

  // Calculate main content height for quote summary max height
  useEffect(() => {
    const calculateContentHeight = () => {
      if (mainContentRef.current) {
        const height = mainContentRef.current.getBoundingClientRect().height
        setMaxContentHeight(height)
      }
    }

    calculateContentHeight()
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateContentHeight)
    
    // Recalculate when content changes (step changes, etc)
    const timer = setTimeout(calculateContentHeight, 100)
    
    return () => {
      window.removeEventListener('resize', calculateContentHeight)
      clearTimeout(timer)
    }
  }, [currentStep, currentMonthlyTab, activeDevices.length, activeServices.length])

  const canProceedToStep2 = true // Allow proceeding to monthly services anytime

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0 order-1" ref={mainContentRef}>
        {/* Step Navigation */}
        <div className="mb-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of 2</span>
            <span>{currentStep === 1 ? 'Quote Setup' : 'Monthly Services'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ 
                width: `${(currentStep / 2) * 100}%`,
                backgroundColor: '#15bef0'
              }}
            ></div>
          </div>
        </div>

        <nav className="flex space-x-8">
          <button
            onClick={() => setCurrentStep(1)}
            className={`pb-2 border-b-2 font-medium text-sm flex items-center cursor-pointer ${
              currentStep === 1
                ? 'border-transparent text-gray-500 hover:text-gray-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={currentStep === 1 ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
          >
            {currentStep > 1 && <span className="mr-2 text-green-500">✓</span>}
            Customer Info & Setup Services
          </button>
          <button
            onClick={() => canProceedToStep2 && setCurrentStep(2)}
            disabled={!canProceedToStep2}
            className={`pb-2 border-b-2 font-medium text-sm flex items-center ${
              currentStep === 2
                ? 'text-gray-500 hover:text-gray-700 cursor-pointer'
                : canProceedToStep2
                ? 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
                : 'border-transparent text-gray-300 cursor-not-allowed'
            }`}
            style={currentStep === 2 ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
          >
            Monthly Managed Services
          </button>
        </nav>
      </div>

      {/* Step 1: Customer Info & Setup Services */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <CustomerForm value={customer} onChange={handleCustomerChange} />
          <SetupServiceSelector setupServices={setupServices} customer={customer} onChange={handleSetupServicesChange} />
          
          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2}
              className={`px-6 py-2 rounded-lg font-medium ${
                canProceedToStep2
                  ? 'text-white hover:opacity-90 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={canProceedToStep2 ? { backgroundColor: '#15bef0' } : {}}
            >
              Continue to Monthly Services →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Monthly Managed Services */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Sub-tabs for Monthly Services */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentMonthlyTab('tools')}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  currentMonthlyTab === 'tools'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'tools' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <span className="w-4 inline-block text-center mr-2">◈</span>Tools & Licensing
              </button>
              <button
                onClick={() => setCurrentMonthlyTab('support')}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  currentMonthlyTab === 'support'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'support' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <span className="w-4 inline-block text-center mr-2">●</span>Support Labor
              </button>
              <button
                onClick={() => setCurrentMonthlyTab('other')}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  currentMonthlyTab === 'other'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'other' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <span className="w-4 inline-block text-center mr-2">⬢</span>Other Labor
              </button>
              <button
                onClick={() => setCurrentMonthlyTab('haas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  currentMonthlyTab === 'haas'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'haas' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <span className="w-4 inline-block text-center mr-2">▢</span>HaaS
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {currentMonthlyTab === 'tools' && (
            <MonthlyServicesSelector 
              monthlyServices={monthlyServices} 
              onChange={handleMonthlyServicesChange} 
            />
          )}

          {currentMonthlyTab === 'support' && (
            <SupportLaborSelector 
              devices={supportDevices} 
              onChange={setSupportDevices} 
            />
          )}

          {currentMonthlyTab === 'other' && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#15bef0' }}>
                <span className="text-white text-2xl">⬢</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Other Labor Configuration</h4>
              <p className="text-gray-600 mb-4">Additional professional services and project work</p>
              <div className="text-sm text-purple-600 bg-purple-100 rounded-full px-3 py-1 inline-block">
                Coming Soon
              </div>
            </div>
          )}

          {currentMonthlyTab === 'haas' && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#15bef0' }}>
                <span className="text-white text-2xl">▢</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Hardware as a Service</h4>
              <p className="text-gray-600 mb-4">Managed hardware solutions and device lifecycle management</p>
              <div className="text-sm text-green-600 bg-green-100 rounded-full px-3 py-1 inline-block">
                Coming Soon
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              ← Back to Setup Services
            </button>
            <button 
              className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#15bef0' }}
            >
              Generate Quote
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Quote Summary - Mobile: Normal flow at bottom, Desktop: Sticky Sidebar */}
      <div className={`w-full flex-shrink-0 order-2 transition-all duration-300 ${
        quoteSummaryExpanded ? 'lg:w-1/2' : 'lg:w-80'
      }`}>
        <div className="lg:sticky lg:top-6">
          <PricingSummary 
            calculations={calculations} 
            monthlyServices={monthlyServices}
            onExpandToggle={setQuoteSummaryExpanded}
            isExpanded={quoteSummaryExpanded}
            maxHeight={maxContentHeight}
          />
        </div>
      </div>
    </div>
  )
}