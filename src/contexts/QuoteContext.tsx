'use client'

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { CustomerInfo, SetupService, QuoteCalculation } from '@/types/quote'
import { MonthlyServicesData, VariableCostTool } from '@/types/monthlyServices'
import { OtherLaborData } from '@/types/otherLabor'
import { DEFAULT_SETUP_SERVICES } from '@/lib/setupServices'
import { DEFAULT_MONTHLY_SERVICES_DATA } from '@/lib/monthlyServices'
// Removed import for old other labor defaults
import { calculateQuote } from '@/lib/calculations'
import { useSupportDevices } from '@/hooks/useSupportDevices'

interface QuoteState {
  // UI State
  currentStep: number
  currentMonthlyTab: string
  quoteSummaryExpanded: boolean
  
  // Quote Data
  customer: CustomerInfo
  setupServices: SetupService[]
  monthlyServices: MonthlyServicesData
  supportDevices: any[]
  otherLaborData: OtherLaborData
  upfrontPayment: number
  calculations?: QuoteCalculation
}

type QuoteAction =
  // UI Actions
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_CURRENT_MONTHLY_TAB'; payload: string }
  | { type: 'SET_QUOTE_SUMMARY_EXPANDED'; payload: boolean }
  
  // Data Actions
  | { type: 'UPDATE_CUSTOMER'; payload: CustomerInfo }
  | { type: 'UPDATE_SETUP_SERVICES'; payload: SetupService[] }
  | { type: 'UPDATE_MONTHLY_SERVICES'; payload: MonthlyServicesData }
  | { type: 'UPDATE_SUPPORT_DEVICES'; payload: any[] }
  | { type: 'UPDATE_OTHER_LABOR_DATA'; payload: OtherLaborData }
  | { type: 'UPDATE_UPFRONT_PAYMENT'; payload: number }
  
  // Internal Actions (auto-calculations)
  | { type: 'RECALCULATE_QUOTE' }
  | { type: 'INIT_SUPPORT_DEVICES'; payload: any[] }

const initialCustomer: CustomerInfo = {
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
}

const initialState: QuoteState = {
  currentStep: 1,
  currentMonthlyTab: 'tools',
  quoteSummaryExpanded: false,
  customer: initialCustomer,
  setupServices: DEFAULT_SETUP_SERVICES,
  monthlyServices: DEFAULT_MONTHLY_SERVICES_DATA,
  supportDevices: [],
  otherLaborData: {
    percentage: 5,
    customItems: []
  },
  upfrontPayment: 0
}

// Auto-calculation functions
function autoCalculateMonthlyServices(customer: CustomerInfo, monthlyServices: MonthlyServicesData): MonthlyServicesData {
  const updatedTools = monthlyServices.variableCostTools.map(tool => {
    // Don't auto-calculate custom tools
    if (tool.id.startsWith('custom_')) {
      return tool
    }
    
    const calculatedQuantity = calculateQuantityForTool(tool, customer)
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
    
    // If quantity is 0, costs and prices should be 0
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
    
    return updatedTool
  })
  
  return { ...monthlyServices, variableCostTools: updatedTools }
}

function calculateQuantityForTool(tool: VariableCostTool, customer: CustomerInfo): number {
  const infra = customer.infrastructure
  const users = customer.users
  
  switch (tool.id) {
    // Auto-calculated tools (No = automatically calculated)
    case '3433': return infra.workstations // Managed Workstation
    case '3427': return infra.servers // Managed Server
    case '3425': return infra.wifiAccessPoints // Managed Network WiFi Access Point
    case '3421': return infra.firewalls // Managed Network Firewall
    case '3426': return infra.printers // Managed Printer
    case '3423': return infra.switches // Managed Network Switch
    case '3428': return infra.ups // Managed UPS
    case '3414': return infra.workstations + infra.servers // Huntress MDR
    case '3516': return users.full + users.emailOnly // Huntress 365
    case '3464': return infra.servers // NinjaBackup
    case '3506': return infra.workstations + infra.servers // Threatlocker
    case '3586': return users.full + users.emailOnly // SaaS Backup
    case '3420': return infra.nas // Managed NAS
    case '3810': return infra.managedMobileDevices // Managed Mobile Device
    case '3418': return 1 // Longard (always 1 per environment)
    case '3413': return infra.domainsUsedForEmail // Domain
    case '3412': return infra.domainsUsedForEmail // DNS
    
    // Manually entered tools (Yes = manually entered, default to 0)
    case '4181': return 0 // IT Password
    case '3410': return 0 // Duo
    case '3522': return 0 // Infima
    case '3415': return 0 // INKY Inbound Mail Protect
    case '4164': return 0 // INKY Outbound Mail Protect
    case '3914': return 0 // INKY Email Signature
    case '3439': return 0 // Microsoft 365 Business Premium [New Commerce Experience]
    case '3440': return 0 // Microsoft 365 Business Standard [New Commerce Experience]
    case '3438': return 0 // Microsoft 365 Business Basic [New Commerce Experience]
    case '3445': return 0 // Exchange Online (Plan 1) [New Commerce Experience]
    case '3446': return 0 // Exchange Online (Plan 2) [New Commerce Experience]
    
    default:
      return 0
  }
}

function autoCalculateSupportDevices(
  customer: CustomerInfo, 
  setupServices: SetupService[], 
  configDevices: any[]
): any[] {
  return configDevices.map(device => {
    let updatedDevice = { ...device, skillLevel: 2 }
    
    if (device.name === 'MS InTune Mgmt') {
      const intuneOnboarding = setupServices.find(service => service.id === 'intune-onboarding')
      if (intuneOnboarding?.isActive) {
        updatedDevice.isActive = true
        updatedDevice.quantity = 1
      } else {
        updatedDevice.isActive = false
        updatedDevice.quantity = 0
      }
    } else if (device.name === 'Proactive Users') {
      if (customer.contractType === 'Managed Services' && customer.users?.full > 0) {
        updatedDevice.isActive = true
        updatedDevice.quantity = customer.users.full
      } else {
        updatedDevice.isActive = false
        updatedDevice.quantity = 0
      }
    } else if (device.name === 'Co-Managed Users') {
      if (customer.contractType === 'Co-Managed Services' && customer.users?.full > 0) {
        updatedDevice.isActive = true
        updatedDevice.quantity = customer.users.full
      } else {
        updatedDevice.isActive = false
        updatedDevice.quantity = 0
      }
    }
    
    return updatedDevice
  })
}

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
      
    case 'SET_CURRENT_MONTHLY_TAB':
      return { ...state, currentMonthlyTab: action.payload }
      
    case 'SET_QUOTE_SUMMARY_EXPANDED':
      return { ...state, quoteSummaryExpanded: action.payload }
      
    case 'UPDATE_CUSTOMER': {
      // Auto-calculate monthly services when customer changes
      const updatedMonthlyServices = autoCalculateMonthlyServices(action.payload, state.monthlyServices)
      
      return {
        ...state,
        customer: action.payload,
        monthlyServices: updatedMonthlyServices
      }
    }
    
    case 'UPDATE_SETUP_SERVICES':
      return { ...state, setupServices: action.payload }
      
    case 'UPDATE_MONTHLY_SERVICES':
      return { ...state, monthlyServices: action.payload }
      
    case 'UPDATE_SUPPORT_DEVICES':
      return { ...state, supportDevices: action.payload }
      
    case 'UPDATE_OTHER_LABOR_DATA':
      return { ...state, otherLaborData: action.payload }
      
    case 'UPDATE_UPFRONT_PAYMENT':
      return { ...state, upfrontPayment: action.payload }
      
    case 'INIT_SUPPORT_DEVICES':
      return { ...state, supportDevices: action.payload }
      
    case 'RECALCULATE_QUOTE': {
      const hasActiveMonthlyServices = 
        state.monthlyServices.variableCostTools.some(tool => tool.isActive && tool.extendedPrice > 0)
      const monthlyServicesForCalculation = hasActiveMonthlyServices ? state.monthlyServices : undefined
      
      const calculations = calculateQuote(
        state.customer,
        [],
        state.setupServices,
        monthlyServicesForCalculation,
        undefined,
        state.upfrontPayment,
        state.supportDevices,
        state.otherLaborData
      )
      
      return { ...state, calculations }
    }
    
    default:
      return state
  }
}

interface QuoteContextType {
  state: QuoteState
  dispatch: React.Dispatch<QuoteAction>
  initialQuote?: any // Add access to initial quote data
  // Convenience methods
  updateCustomer: (customer: CustomerInfo) => void
  updateSetupServices: (services: SetupService[]) => void
  updateMonthlyServices: (services: MonthlyServicesData) => void
  updateSupportDevices: (devices: any[]) => void
  updateOtherLaborData: (data: OtherLaborData) => void
  updateUpfrontPayment: (payment: number) => void
  setCurrentStep: (step: number) => void
  setCurrentMonthlyTab: (tab: string) => void
  setQuoteSummaryExpanded: (expanded: boolean) => void
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

interface QuoteProviderProps {
  children: React.ReactNode
  initialQuote?: any // SavedQuote from API
}

// Add context for quote ID when editing
const QuoteIdContext = createContext<string | undefined>(undefined)

export function QuoteProvider({ children, initialQuote }: QuoteProviderProps) {
  // If we have an initial quote, use it to populate the state
  const initializedState = initialQuote ? {
    customer: initialQuote.customerData || initialCustomer,
    setupServices: initialQuote.setupServices || DEFAULT_SETUP_SERVICES,
    monthlyServices: initialQuote.monthlyServices || DEFAULT_MONTHLY_SERVICES_DATA,
    supportDevices: initialQuote.supportDevices || [],
    otherLaborData: initialQuote.otherLaborData || { percentage: 5, customItems: [] },
    upfrontPayment: initialQuote.upfrontPayment || 0,
    calculations: initialQuote.calculations || (initialQuote ? {
      customer: initialQuote.customerData || initialCustomer,
      services: [],
      setupServices: initialQuote.setupServices || [],
      laborRates: {
        level1: { cost: 22, priceBusinessHours: 155, priceAfterHours: 155 },
        level2: { cost: 37, priceBusinessHours: 185, priceAfterHours: 275 }, 
        level3: { cost: 46, priceBusinessHours: 275, priceAfterHours: 375 }
      },
      totals: {
        monthlyTotal: initialQuote.originalMonthlyTotal || initialQuote.monthlyTotal,
        toolsSoftware: 0, // Will be calculated
        supportLabor: 0, // Will be calculated  
        otherLabor: 0, // Will be calculated
        haas: 0,
        warranty: 0,
        setupCosts: initialQuote.setupCosts || 0,
        contractTotal: initialQuote.contractTotal || 0,
        upfrontPayment: initialQuote.upfrontPayment || 0,
        deferredSetupMonthly: 0, // Will be calculated
        discountType: initialQuote.discountType,
        discountValue: initialQuote.discountValue,
        discountedTotal: initialQuote.discountedTotal || (initialQuote.discountType !== 'none' ? initialQuote.monthlyTotal : undefined)
      }
    } : undefined),
    currentStep: 1,
    currentMonthlyTab: 'tools',
    quoteSummaryExpanded: false
  } : initialState
  
  // Debug logging
  if (initialQuote) {
    console.log('Loading quote data:', {
      hasMonthlyServices: !!initialQuote.monthlyServices,
      toolsLength: initialQuote.monthlyServices?.variableCostTools?.length,
      sampleTool: initialQuote.monthlyServices?.variableCostTools?.[0]
    })
  }
  
  const [state, dispatch] = useReducer(quoteReducer, initializedState)
  const { devices: configDevices, loading: configLoading } = useSupportDevices()

  // Initialize support devices from database
  useEffect(() => {
    if (configDevices.length > 0 && !configLoading && state.supportDevices.length === 0) {
      const initialDevices = autoCalculateSupportDevices(state.customer, state.setupServices, configDevices)
      dispatch({ type: 'INIT_SUPPORT_DEVICES', payload: initialDevices })
    }
  }, [configDevices, configLoading, state.supportDevices.length])

  // Auto-calculate support devices when customer or setup services change
  useEffect(() => {
    if (configDevices.length > 0 && state.supportDevices.length > 0) {
      const updatedDevices = autoCalculateSupportDevices(state.customer, state.setupServices, configDevices)
      dispatch({ type: 'UPDATE_SUPPORT_DEVICES', payload: updatedDevices })
    }
  }, [state.customer.contractType, state.customer.users?.full, state.setupServices, configDevices])

  // Recalculate quote whenever any relevant data changes
  useEffect(() => {
    dispatch({ type: 'RECALCULATE_QUOTE' })
  }, [
    state.customer,
    state.setupServices,
    state.monthlyServices,
    state.supportDevices,
    state.otherLaborData,
    state.upfrontPayment
  ])

  const contextValue: QuoteContextType = useMemo(() => ({
    state,
    dispatch,
    initialQuote,
    updateCustomer: (customer: CustomerInfo) => dispatch({ type: 'UPDATE_CUSTOMER', payload: customer }),
    updateSetupServices: (services: SetupService[]) => dispatch({ type: 'UPDATE_SETUP_SERVICES', payload: services }),
    updateMonthlyServices: (services: MonthlyServicesData) => dispatch({ type: 'UPDATE_MONTHLY_SERVICES', payload: services }),
    updateSupportDevices: (devices: any[]) => dispatch({ type: 'UPDATE_SUPPORT_DEVICES', payload: devices }),
    updateOtherLaborData: (data: OtherLaborData) => dispatch({ type: 'UPDATE_OTHER_LABOR_DATA', payload: data }),
    updateUpfrontPayment: (payment: number) => dispatch({ type: 'UPDATE_UPFRONT_PAYMENT', payload: payment }),
    setCurrentStep: (step: number) => dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
    setCurrentMonthlyTab: (tab: string) => dispatch({ type: 'SET_CURRENT_MONTHLY_TAB', payload: tab }),
    setQuoteSummaryExpanded: (expanded: boolean) => dispatch({ type: 'SET_QUOTE_SUMMARY_EXPANDED', payload: expanded })
  }), [state, initialQuote])

  return (
    <QuoteContext.Provider value={contextValue}>
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  const context = useContext(QuoteContext)
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider')
  }
  return context
}

// Custom hooks for specific parts of the state
export function useQuoteCustomer() {
  const { state, updateCustomer } = useQuote()
  return { customer: state.customer, updateCustomer }
}

export function useQuoteCalculations() {
  const { state } = useQuote()
  return state.calculations
}

export function useQuoteUI() {
  const { state, setCurrentStep, setCurrentMonthlyTab, setQuoteSummaryExpanded } = useQuote()
  return {
    currentStep: state.currentStep,
    currentMonthlyTab: state.currentMonthlyTab,
    quoteSummaryExpanded: state.quoteSummaryExpanded,
    setCurrentStep,
    setCurrentMonthlyTab,
    setQuoteSummaryExpanded
  }
}