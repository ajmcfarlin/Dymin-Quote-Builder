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

// Helper function to convert QuoteContext state to CreateQuoteRequest
export function stateToCreateQuoteRequest(state: {
  customer: any
  setupServices: any[]
  monthlyServices: any
  supportDevices: any[]
  otherLaborData: any
  upfrontPayment: number
  calculations?: any
}): CreateQuoteRequest {
  const totals = state.calculations?.totals
  
  return {
    customerName: state.customer.companyName,
    customerEmail: state.customer.email,
    customerData: state.customer,
    setupServices: state.setupServices,
    monthlyServices: state.monthlyServices,
    supportDevices: state.supportDevices,
    otherLaborData: state.otherLaborData,
    monthlyTotal: totals?.monthlyTotal || 0,
    setupCosts: totals?.setupCosts || 0,
    upfrontPayment: state.upfrontPayment,
    contractTotal: totals?.contractTotal || 0,
    discountType: totals?.discountType,
    discountValue: totals?.discountValue,
    discountedTotal: totals?.discountedTotal
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