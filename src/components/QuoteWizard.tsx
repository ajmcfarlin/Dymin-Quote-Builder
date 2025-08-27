'use client'

import React, { useRef, useState, useEffect } from 'react'
import { CustomerForm } from './CustomerForm'
import { SetupServiceSelector } from './SetupServiceSelector'
import { MonthlyServicesSelector } from './MonthlyServicesSelector'
import { PricingSummary } from './PricingSummary'
import { SupportLaborSelector } from './SupportLaborSelector'
import { OtherLaborSelector } from './OtherLaborSelector'
import { ReviewDiscountTab } from './ReviewDiscountTab'
import { useQuote, useQuoteUI, useQuoteCustomer, useQuoteCalculations } from '@/contexts/QuoteContext'
import { calculateSupportDevicesLabor, calculateSetupCosts, DEFAULT_LABOR_RATES } from '@/lib/calculations'
import { Building2, Settings, Users, Wrench, Receipt, ChevronDown, Menu, Package, HardDrive, UserCog } from 'lucide-react'

interface QuoteWizardProps {
  readOnly?: boolean
  editMode?: boolean
  quoteId?: string
}

export function QuoteWizard({ readOnly = false, editMode = false, quoteId }: QuoteWizardProps) {
  // Use context hooks instead of local state
  const { state, updateSetupServices, updateMonthlyServices, updateSupportDevices, updateOtherLaborData, updateUpfrontPayment, initialQuote } = useQuote()
  const { currentStep, currentMonthlyTab, quoteSummaryExpanded, setCurrentStep, setCurrentMonthlyTab, setQuoteSummaryExpanded } = useQuoteUI()

  const scrollToTop = () => {
    // Find the main scrollable container and scroll it to top
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Fallback to window scroll
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const { customer, updateCustomer } = useQuoteCustomer()
  const calculations = useQuoteCalculations()
  
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [maxContentHeight, setMaxContentHeight] = useState<number | null>(null)

  const activeDevices = state.supportDevices.filter(device => device.isActive)
  const activeServices = state.setupServices.filter(service => service.isActive)
  // Calculate total monthly labor costs (support labor + monthly setup portion, excluding tools)
  const supportLaborTotal = calculateSupportDevicesLabor(state.supportDevices)
  const totalSetupCosts = calculateSetupCosts(state.setupServices, DEFAULT_LABOR_RATES, customer)
  const upfrontPayment = state.upfrontPayment
  const deferredSetupAmount = totalSetupCosts - upfrontPayment
  const monthlySetupCosts = customer.contractMonths > 0 ? deferredSetupAmount / customer.contractMonths : 0
  const totalMonthlyLaborCosts = supportLaborTotal + monthlySetupCosts

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
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
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

        <nav className="flex flex-wrap sm:space-x-8 space-x-0 gap-y-4">
          <button
            onClick={() => setCurrentStep(1)}
            className={`pb-2 border-b-2 font-medium text-sm flex items-center cursor-pointer flex-1 sm:flex-none justify-center sm:justify-start min-w-0 ${
              currentStep === 1
                ? 'border-transparent text-gray-500 hover:text-gray-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={currentStep === 1 ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
          >
            <Building2 size={18} className="mr-2" />
            <span className="hidden sm:inline">Customer Info & Setup Services</span>
            <span className="sm:hidden">Setup</span>
          </button>
          <button
            onClick={() => {
              if (canProceedToStep2) {
                setCurrentStep(2)
              }
            }}
            disabled={!canProceedToStep2}
            className={`pb-2 border-b-2 font-medium text-sm flex items-center flex-1 sm:flex-none justify-center sm:justify-start ${
              currentStep === 2
                ? 'text-gray-500 hover:text-gray-700 cursor-pointer'
                : canProceedToStep2
                ? 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
                : 'border-transparent text-gray-300 cursor-not-allowed'
            }`}
            style={currentStep === 2 ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
          >
            <Settings size={18} className="mr-2" />
            <span className="hidden sm:inline">Monthly Managed Services</span>
            <span className="sm:hidden">Services</span>
          </button>
          
          <button
            onClick={() => setCurrentStep(3)}
            className={`pb-2 border-b-2 font-medium text-sm flex items-center flex-1 sm:flex-none justify-center sm:justify-start ${
              currentStep === 3
                ? 'text-gray-500 hover:text-gray-700 cursor-pointer'
                : 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
            }`}
            style={currentStep === 3 ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
          >
            <Receipt size={18} className="mr-2" />
            <span className="hidden sm:inline">Review & Discount</span>
            <span className="sm:hidden">Review</span>
          </button>
        </nav>
      </div>

      {/* Step 1: Customer Info & Setup Services */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <CustomerForm value={customer} onChange={updateCustomer} />
          <SetupServiceSelector 
            setupServices={state.setupServices} 
            customer={customer} 
            upfrontPayment={state.upfrontPayment}
            onChange={updateSetupServices} 
            onUpfrontPaymentChange={updateUpfrontPayment}
          />
          
          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setCurrentStep(2)
                scrollToTop()
              }}
              disabled={!canProceedToStep2}
              className={`px-6 py-2 rounded-lg font-medium ${
                canProceedToStep2
                  ? 'text-white hover:opacity-90 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={canProceedToStep2 ? { backgroundColor: '#15bef0' } : {}}
            >
              Continue
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
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center ${
                  currentMonthlyTab === 'tools'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'tools' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <Wrench size={16} className="mr-2" />
                <span className="hidden sm:inline">Tools & Licensing</span>
                <span className="sm:hidden">Tools</span>
              </button>
              <button
                onClick={() => setCurrentMonthlyTab('support')}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center ${
                  currentMonthlyTab === 'support'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'support' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <UserCog size={16} className="mr-2" />
                <span className="hidden sm:inline">Support Labor</span>
                <span className="sm:hidden">Support</span>
              </button>
              <button
                onClick={() => setCurrentMonthlyTab('other')}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center ${
                  currentMonthlyTab === 'other'
                    ? 'text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentMonthlyTab === 'other' ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
              >
                <Package size={16} className="mr-2" />
                <span className="hidden sm:inline">Other Labor</span>
                <span className="sm:hidden">Other</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {currentMonthlyTab === 'tools' && (
            <MonthlyServicesSelector 
              monthlyServices={state.monthlyServices} 
              customer={customer}
              onChange={updateMonthlyServices} 
            />
          )}

          {currentMonthlyTab === 'support' && (
            <SupportLaborSelector 
              devices={state.supportDevices}
              onChange={updateSupportDevices}
              customer={customer}
              setupServices={state.setupServices}
            />
          )}

          {currentMonthlyTab === 'other' && (
            <OtherLaborSelector
              otherLaborData={state.otherLaborData}
              onChange={updateOtherLaborData}
              supportLaborTotal={totalMonthlyLaborCosts}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {/* Left button - Back to Setup or Previous Tab */}
            {currentMonthlyTab === 'tools' ? (
              <button
                onClick={() => {
                  setCurrentStep(1)
                  scrollToTop()
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
            ) : currentMonthlyTab === 'support' ? (
              <button
                onClick={() => {
                  setCurrentMonthlyTab('tools')
                  scrollToTop()
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentMonthlyTab('support')
                  scrollToTop()
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
            )}

            {/* Right button - Next Tab or Review */}
            {currentMonthlyTab === 'tools' ? (
              <button 
                onClick={() => {
                  setCurrentMonthlyTab('support')
                  scrollToTop()
                }}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#15bef0' }}
              >
                Continue
              </button>
            ) : currentMonthlyTab === 'support' ? (
              <button 
                onClick={() => {
                  setCurrentMonthlyTab('other')
                  scrollToTop()
                }}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#15bef0' }}
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={() => {
                  setCurrentStep(3)
                  scrollToTop()
                }}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#15bef0' }}
              >
                Finalize
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review & Discount */}
      {currentStep === 3 && (
        <ReviewDiscountTab
          calculations={calculations}
          customer={customer}
          supportDevices={state.supportDevices}
          monthlyServices={state.monthlyServices}
          otherLaborData={state.otherLaborData}
          setupServices={state.setupServices}
          upfrontPayment={state.upfrontPayment}
          onUpfrontPaymentChange={updateUpfrontPayment}
          editMode={editMode}
          quoteId={quoteId}
        />
      )}
      </div>

      {/* Quote Summary - Gently transitions on Review tab */}
      <div className={`flex-shrink-0 order-2 transition-all duration-500 ease-in-out ${
        currentStep === 3 
          ? 'hidden lg:block w-0 lg:translate-x-full opacity-0 pointer-events-none overflow-hidden' 
          : quoteSummaryExpanded 
            ? 'w-full lg:w-1/2 lg:translate-x-0 opacity-100' 
            : 'w-full lg:w-80 lg:translate-x-0 opacity-100'
      }`}>
        <div className="lg:sticky lg:top-6">
          <PricingSummary 
            calculations={calculations} 
            monthlyServices={state.monthlyServices}
            supportDevices={state.supportDevices}
            setupServices={state.setupServices}
            onExpandToggle={setQuoteSummaryExpanded}
            isExpanded={quoteSummaryExpanded}
            maxHeight={maxContentHeight}
            editMode={editMode}
            savedQuoteTotals={editMode && initialQuote ? {
              monthlyTotal: initialQuote.monthlyTotal,
              originalMonthlyTotal: initialQuote.originalMonthlyTotal,
              contractTotal: initialQuote.contractTotal,
              setupCosts: initialQuote.setupCosts,
              upfrontPayment: initialQuote.upfrontPayment,
              discountType: initialQuote.discountType,
              discountValue: initialQuote.discountValue,
              discountedTotal: initialQuote.discountedTotal
            } : undefined}
            quoteId={quoteId}
          />
        </div>
      </div>
    </div>
  )
}