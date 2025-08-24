import { CustomerInfo, SetupService } from './quote'
import { MonthlyServicesData } from './monthlyServices'
import { OtherLaborData } from './otherLabor'

// Enhanced quote model for database storage and API
export interface SavedQuote {
  id: string
  userId: string
  
  // Quote identification
  quoteNumber?: string
  version: number
  
  // Customer information
  customerName: string
  customerEmail?: string
  customerAddress?: string
  customerRegion?: string
  
  // Contract details
  contractType?: 'Managed Services' | 'Co-Managed Services'
  contractMonths: number
  
  // Quote data (structured objects stored as JSON in DB)
  customerData: CustomerInfo
  setupServices: SetupService[]
  monthlyServices: MonthlyServicesData
  supportDevices: any[] // Support device configurations
  otherLaborData: OtherLaborData
  
  // Financial summary
  monthlyTotal: number
  setupCosts: number
  upfrontPayment: number
  contractTotal: number
  
  // Discount information
  discountType?: 'none' | 'percentage' | 'raw_dollar' | 'margin_override' | 'per_user' | 'override'
  discountValue?: number
  discountedTotal?: number
  
  // Margins and analysis (for internal use)
  estimatedCost?: number
  profitMargin?: number
  
  // External integrations
  haloPsaQuoteId?: string
  
  // Metadata
  notes?: string
  clientNotes?: string
  expiresAt?: Date
  sentAt?: Date
  approvedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

// API request/response types
export interface CreateQuoteRequest {
  customerName: string
  customerEmail?: string
  customerData: CustomerInfo
  setupServices: SetupService[]
  monthlyServices: MonthlyServicesData
  supportDevices: any[]
  otherLaborData: OtherLaborData
  monthlyTotal: number
  setupCosts: number
  upfrontPayment: number
  contractTotal: number
  discountType?: string
  discountValue?: number
  discountedTotal?: number
  notes?: string
}

export interface UpdateQuoteRequest extends Partial<CreateQuoteRequest> {
  id: string
}

export interface QuoteListItem {
  id: string
  quoteNumber?: string
  customerName: string
  monthlyTotal: number
  contractTotal: number
  createdAt: Date
  updatedAt: Date
  user?: {
    name: string
    email: string
  }
}

export interface QuotesListResponse {
  quotes: QuoteListItem[]
  total: number
  page: number
  limit: number
}

// Halo PSA Integration types
export interface HaloQuoteGenerationRequest {
  quoteId: string
  generateInvoice?: boolean
  sendToCustomer?: boolean
}

export interface HaloQuoteResponse {
  success: boolean
  haloPsaQuoteId?: string
  quoteUrl?: string
  error?: string
}