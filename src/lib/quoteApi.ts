import { CreateQuoteRequest, UpdateQuoteRequest, SavedQuote, QuotesListResponse, HaloQuoteGenerationRequest, HaloQuoteResponse } from '@/types/savedQuote'

// Quote API client functions
export class QuoteAPI {
  static async createQuote(data: CreateQuoteRequest): Promise<SavedQuote> {
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create quote')
    }
    
    return response.json()
  }

  static async updateQuote(data: UpdateQuoteRequest): Promise<SavedQuote> {
    const response = await fetch(`/api/quotes/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update quote')
    }
    
    return response.json()
  }

  static async getQuote(id: string): Promise<SavedQuote> {
    const response = await fetch(`/api/quotes/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch quote')
    }
    
    return response.json()
  }

  static async getQuotes(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<QuotesListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    
    const response = await fetch(`/api/quotes?${searchParams}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch quotes')
    }
    
    return response.json()
  }

  static async deleteQuote(id: string): Promise<void> {
    const response = await fetch(`/api/quotes/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete quote')
    }
  }

  static async generateHaloQuote(id: string, options: HaloQuoteGenerationRequest): Promise<HaloQuoteResponse> {
    const response = await fetch(`/api/quotes/${id}/generate-halo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate Halo PSA quote')
    }
    
    return response.json()
  }

  static async getHaloQuoteStatus(id: string): Promise<{
    hasHaloQuote: boolean
    haloPsaQuoteId?: string
    status: string
    quoteUrl?: string
  }> {
    const response = await fetch(`/api/quotes/${id}/generate-halo`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch Halo PSA quote status')
    }
    
    return response.json()
  }
}

// Helper function to calculate support device costs
function calculateSupportDeviceCosts(device: any) {
  const costRates: { [key: number]: number } = { 1: 22, 2: 37, 3: 46 }
  const priceRates: { [key: number]: { business: number; afterHours: number } } = { 
    1: { business: 155, afterHours: 155 },
    2: { business: 185, afterHours: 275 },
    3: { business: 275, afterHours: 375 }
  }
  
  const skillLevel = device.skillLevel as 1 | 2 | 3
  
  const calculateServiceTypeCost = (hours: any) => {
    const cost = device.quantity * (
      (hours.onsiteBusiness + hours.remoteBusiness + hours.onsiteAfterHours + hours.remoteAfterHours) * costRates[skillLevel]
    )
    
    const businessHoursPrice = device.quantity * (
      (hours.onsiteBusiness + hours.remoteBusiness) * priceRates[skillLevel].business
    )
    const afterHoursPrice = device.quantity * (
      (hours.onsiteAfterHours + hours.remoteAfterHours) * priceRates[skillLevel].afterHours
    )
    const price = businessHoursPrice + afterHoursPrice
    
    return { cost, price }
  }

  const predictable = calculateServiceTypeCost(device.hours.predictable)
  const reactive = calculateServiceTypeCost(device.hours.reactive)
  const emergency = calculateServiceTypeCost(device.hours.emergency)
  
  const totalCost = predictable.cost + reactive.cost + emergency.cost
  const totalPrice = predictable.price + reactive.price + emergency.price

  return { cost: totalCost, price: totalPrice }
}

// Helper function to convert QuoteContext state to CreateQuoteRequest
export function stateToCreateQuoteRequest(
  state: {
    customer: any
    setupServices: any[]
    monthlyServices: any
    supportDevices: any[]
    otherLaborData: any
    upfrontPayment: number
    calculations?: any
  },
  discountInfo?: {
    discountType: string
    discountValue: number
    discountedTotal: number
  }
): CreateQuoteRequest {
  const totals = state.calculations?.totals
  
  // Calculate and add monthly prices to support devices
  const enrichedSupportDevices = state.supportDevices.map(device => {
    if (!device.isActive || device.quantity === 0) {
      return { ...device, monthlyPrice: 0 }
    }
    
    const costs = calculateSupportDeviceCosts(device)
    return { ...device, monthlyPrice: costs.price }
  })
  
  // Use discount info parameter if provided, otherwise fall back to totals
  const hasDiscount = (discountInfo?.discountType !== 'none' && discountInfo?.discountedTotal) || 
                     (totals?.discountedTotal && totals?.discountType !== 'none')
  
  const finalDiscountedTotal = discountInfo?.discountedTotal || totals?.discountedTotal
  const finalMonthlyTotal = hasDiscount ? finalDiscountedTotal : (totals?.monthlyTotal || 0)
  const originalMonthlyTotal = hasDiscount ? (totals?.monthlyTotal || 0) : null
  const finalContractTotal = finalMonthlyTotal * (state.customer.contractMonths || 36) + (state.upfrontPayment || 0)
  
  return {
    customerName: state.customer.companyName,
    customerEmail: state.customer.email,
    customerData: state.customer,
    setupServices: state.setupServices,
    monthlyServices: state.monthlyServices,
    supportDevices: enrichedSupportDevices,
    otherLaborData: state.otherLaborData,
    monthlyTotal: finalMonthlyTotal,
    originalMonthlyTotal,
    setupCosts: totals?.setupCosts || 0,
    upfrontPayment: state.upfrontPayment,
    contractTotal: finalContractTotal,
    discountType: discountInfo?.discountType || totals?.discountType,
    discountValue: discountInfo?.discountValue || totals?.discountValue,
    discountedTotal: finalDiscountedTotal // Keep for backwards compatibility
  }
}

// Helper function to convert SavedQuote back to QuoteContext state
export function savedQuoteToState(savedQuote: SavedQuote): {
  customer: any
  setupServices: any[]
  monthlyServices: any
  supportDevices: any[]
  otherLaborData: any
  upfrontPayment: number
} {
  return {
    customer: savedQuote.customerData,
    setupServices: savedQuote.setupServices,
    monthlyServices: savedQuote.monthlyServices,
    supportDevices: savedQuote.supportDevices,
    otherLaborData: savedQuote.otherLaborData,
    upfrontPayment: savedQuote.upfrontPayment
  }
}