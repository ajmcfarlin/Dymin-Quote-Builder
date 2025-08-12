export interface CustomerInfo {
  companyName: string
  address: string
  region: string
  contractMonths: number
  contractType: 'Managed Services' | 'Co-Managed Services'
  users: {
    full: number
    emailOnly: number
  }
  infrastructure: {
    workstations: number
    servers: number
    printers: number
    phoneExtensions: number
  }
}

export interface ServiceCategory {
  id: string
  name: string
  hours: {
    onsiteBusiness: number
    remoteBusiness: number
    onsiteAfterHours: number
    remoteAfterHours: number
  }
  skillLevel: 1 | 2 | 3
  isActive: boolean
}

export interface LaborRates {
  level1: { 
    cost: number
    priceBusinessHours: number
    priceAfterHours: number
  }
  level2: { 
    cost: number
    priceBusinessHours: number
    priceAfterHours: number
  }
  level3: { 
    cost: number
    priceBusinessHours: number
    priceAfterHours: number
  }
}

export interface SetupService {
  id: string
  name: string
  isActive: boolean
  skillLevel: 1 | 2 | 3
  factor1: 'onsite' | 'remote'
  factor2: 'business' | 'afterhours'
  hours?: number
  cost?: number
  price?: number
}

export interface QuoteCalculation {
  customer: CustomerInfo
  services: ServiceCategory[]
  setupServices: SetupService[]
  laborRates: LaborRates
  totals: {
    // Monthly recurring costs
    toolsSoftware: number
    supportLabor: number
    haas: number
    warranty: number
    monthlyTotal: number
    
    // One-time costs
    setupCosts: number
    
    // Contract totals
    contractTotal: number
  }
}