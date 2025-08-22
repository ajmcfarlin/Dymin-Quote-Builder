'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { CustomerInfo, SetupService, QuoteCalculation } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
import { OtherLaborData } from '@/types/otherLabor'
import { calculateQuote } from '@/lib/calculations'
import { DEFAULT_SETUP_SERVICES } from '@/lib/setupServices'
import { DEFAULT_MONTHLY_SERVICES_DATA } from '@/lib/monthlyServices'
import { DEFAULT_MONTHLY_LABOR_SERVICES, DEFAULT_INCIDENT_BASED_SERVICES } from '@/lib/otherLabor'
import { CustomerForm } from './CustomerForm'
import { SetupServiceSelector } from './SetupServiceSelector'
import { MonthlyServicesSelector } from './MonthlyServicesSelector'
import { PricingSummary } from './PricingSummary'
import { SupportLaborSelector } from './SupportLaborSelector'
import { useSupportDevices } from '@/hooks/useSupportDevices'
import { OtherLaborSelector } from './OtherLaborSelector'

export function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentMonthlyTab, setCurrentMonthlyTab] = useState('tools')
  const [quoteSummaryExpanded, setQuoteSummaryExpanded] = useState(false)
  const [maxContentHeight, setMaxContentHeight] = useState<number | null>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  
  // Fetch database devices for auto-calculation
  const { devices: configDevices, loading: configLoading } = useSupportDevices()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  const [customer, setCustomer] = useState<CustomerInfo>({
    companyName: '',
    address: '',
    region: 'United States',
    contractMonths: 36,
    contractType: 'Managed Services',
    users: { full: 0, emailOnly: 0 },
    infrastructure: { 
      workstations: 0, 
      servers: 0, 
      printers: 0, 
      phoneExtensions: 0,
      wifiAccessPoints: 0,
      firewalls: 0,
      switches: 0,
      ups: 0,
      nas: 0,
      managedMobileDevices: 0,
      domainsUsedForEmail: 0
    }
  })
  const [setupServices, setSetupServices] = useState<SetupService[]>(DEFAULT_SETUP_SERVICES)
  const [monthlyServices, setMonthlyServices] = useState<MonthlyServicesData>(DEFAULT_MONTHLY_SERVICES_DATA)
  const [upfrontPayment, setUpfrontPayment] = useState(0)
  const [supportDevices, setSupportDevices] = useState<any[]>([])
  const [otherLaborData, setOtherLaborData] = useState<OtherLaborData>({
    monthlyServices: DEFAULT_MONTHLY_LABOR_SERVICES,
    incidentServices: DEFAULT_INCIDENT_BASED_SERVICES
  })
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

  // Auto-calculate support devices based on customer data and setup services
  // Use refs to track user manual edits and prevent overriding them
  const userHasEditedDevicesManually = useRef(false)
  
  // Track when user manually edits support devices to prevent auto-calculation override
  const handleSupportDevicesChange = (newDevices: any[]) => {
    console.log('User manually changed support devices, disabling auto-calculation')
    userHasEditedDevicesManually.current = true
    setSupportDevices(newDevices)
  }
  
  // Initialize devices from database config when first loaded
  useEffect(() => {
    if (configDevices.length > 0 && !configLoading && supportDevices.length === 0) {
      console.log('Initial load: setting up support devices from database config')
      setSupportDevices(configDevices.map(device => ({ ...device, skillLevel: 2 })))
    }
  }, [configDevices, configLoading, supportDevices.length])
  
  // Track specific values to avoid array reference issues
  const contractType = customer.contractType
  const fullUsers = customer.users?.full || 0
  const intuneOnboardingActive = setupServices.find(service => service.id === 'intune-onboarding')?.isActive || false
  
  
  // Auto-calculate devices whenever customer data or setup services change
  useEffect(() => {
    
    if (supportDevices.length > 0) {
      
      const autoCalculatedDevices = supportDevices.map(device => {
        let updatedDevice = { ...device }
        
        
        // Auto-calculation logic based on device name
        if (device.name === 'MS InTune Mgmt') {
          if (intuneOnboardingActive) {
            updatedDevice.isActive = true
            updatedDevice.quantity = 1
          } else {
            updatedDevice.isActive = false
            updatedDevice.quantity = 0
          }
        } else if (device.name === 'Proactive Users') {
          if (contractType === 'Managed Services' && fullUsers > 0) {
            updatedDevice.isActive = true
            updatedDevice.quantity = fullUsers
          } else {
            updatedDevice.isActive = false
            updatedDevice.quantity = 0
          }
        } else if (device.name === 'Co-Managed Users') {
          if (contractType === 'Co-Managed Services' && fullUsers > 0) {
            updatedDevice.isActive = true
            updatedDevice.quantity = fullUsers
          } else {
            updatedDevice.isActive = false
            updatedDevice.quantity = 0
          }
        }
        
        return updatedDevice
      })
      
      // Check if there are actual changes before updating
      const hasChanges = autoCalculatedDevices.some((device, index) => {
        const current = supportDevices[index]
        return current && (
          device.isActive !== current.isActive || 
          device.quantity !== current.quantity
        )
      })
      
      if (hasChanges) {
        setSupportDevices(autoCalculatedDevices)
      } else {
      }
    } else {
    }
  }, [contractType, fullUsers, intuneOnboardingActive, supportDevices.length])


  useEffect(() => {
    // Always include monthly services in calculations if any have meaningful values
    const hasActiveMonthlyServices = monthlyServices.fixedCostTools.some(tool => tool.isActive && tool.extendedPrice > 0) || 
                                   monthlyServices.variableCostTools.some(tool => tool.isActive && tool.extendedPrice > 0)
    const monthlyServicesForCalculation = hasActiveMonthlyServices ? monthlyServices : undefined
    const newCalculations = calculateQuote(customer, [], setupServices, monthlyServicesForCalculation, undefined, upfrontPayment, supportDevices, otherLaborData)
    setCalculations(newCalculations)
  }, [customer, setupServices, monthlyServices, upfrontPayment, supportDevices, otherLaborData, currentStep])

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
            <span>Step {currentStep} of 3</span>
            <span>{currentStep === 1 ? 'Quote Setup' : currentStep === 2 ? 'Monthly Services' : 'Review & Discount'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ 
                width: `${(currentStep / 3) * 100}%`,
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
          
          <button
            onClick={() => setCurrentStep(3)}
            className={`pb-2 border-b-2 font-medium text-sm flex items-center ${
              currentStep === 3
                ? 'text-gray-500 hover:text-gray-700 cursor-pointer'
                : 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
            }`}
            style={currentStep === 3 ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
          >
            Review & Discount
          </button>
        </nav>
      </div>

      {/* Step 1: Customer Info & Setup Services */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <CustomerForm value={customer} onChange={handleCustomerChange} />
          <SetupServiceSelector 
            setupServices={setupServices} 
            customer={customer} 
            upfrontPayment={upfrontPayment}
            onChange={handleSetupServicesChange} 
            onUpfrontPaymentChange={setUpfrontPayment}
          />
          
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
            </nav>
          </div>

          {/* Tab Content */}
          {currentMonthlyTab === 'tools' && (
            <MonthlyServicesSelector 
              monthlyServices={monthlyServices} 
              customer={customer}
              onChange={handleMonthlyServicesChange} 
            />
          )}

          {currentMonthlyTab === 'support' && (
            <SupportLaborSelector 
              devices={supportDevices}
              onChange={handleSupportDevicesChange}
              customer={customer}
              setupServices={setupServices}
            />
          )}

          {currentMonthlyTab === 'other' && (
            <OtherLaborSelector
              otherLaborData={otherLaborData}
              onChange={setOtherLaborData}
            />
          )}


          {/* Navigation */}
          <div className="flex justify-between">
            {/* Left button - Back to Setup or Previous Tab */}
            {currentMonthlyTab === 'tools' ? (
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                ← Back to Setup Services
              </button>
            ) : currentMonthlyTab === 'support' ? (
              <button
                onClick={() => setCurrentMonthlyTab('tools')}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                ← Back to Tools & Licensing
              </button>
            ) : (
              <button
                onClick={() => setCurrentMonthlyTab('support')}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                ← Back to Support Labor
              </button>
            )}

            {/* Right button - Next Tab or Review */}
            {currentMonthlyTab === 'tools' ? (
              <button 
                onClick={() => setCurrentMonthlyTab('support')}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#15bef0' }}
              >
                Continue to Support Labor →
              </button>
            ) : currentMonthlyTab === 'support' ? (
              <button 
                onClick={() => setCurrentMonthlyTab('other')}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#15bef0' }}
              >
                Continue to Other Labor →
              </button>
            ) : (
              <button 
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#15bef0' }}
              >
                Review & Finalize →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review & Discount */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Finalize Quote</h2>
            
            {/* Quote Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quote Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Recurring Revenue:</span>
                    <span className="font-medium">{formatCurrency(calculations?.totals.monthlyTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract Length:</span>
                    <span>{customer.contractMonths} months</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total Contract Value:</span>
                    <span style={{ color: '#15bef0' }}>{formatCurrency(calculations?.totals.contractTotal || 0)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Adjustments</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upfront Payment
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={upfrontPayment}
                      onChange={(e) => setUpfrontPayment(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Setup Services Detail */}
            {calculations && calculations.totals.setupCosts > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Setup Services Detail</h3>
                <div className="space-y-2 text-sm">
                  {calculations.setupServices.filter(service => service.isActive).map(service => (
                    <div key={service.id} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>{formatCurrency(service.price || 0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total Setup Costs:</span>
                    <span>{formatCurrency(calculations.totals.setupCosts)}</span>
                  </div>
                  {upfrontPayment > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Upfront Payment:</span>
                        <span>-{formatCurrency(upfrontPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Added to Monthly:</span>
                        <span>{formatCurrency(calculations.totals.deferredSetupMonthly)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              ← Back to Monthly Services
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