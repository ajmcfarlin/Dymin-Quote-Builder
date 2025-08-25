export interface CustomLaborItem {
  id: string
  name: string
  price: number
}

export interface MonthlyLaborService {
  id: string
  name: string
  isActive: boolean
  skillLevel: 1 | 2 | 3
  factor1: 'remote' | 'onsite'
  factor2: 'business' | 'afterhours'
  hoursPerMonth: number
  extendedCost: number
  extendedPrice: number
}

export interface IncidentBasedService {
  id: string
  name: string
  isActive: boolean
  hoursPerIncident: number
  skillLevel: 1 | 2 | 3
  factor1: 'remote' | 'onsite'
  factor2: 'business' | 'afterhours'
  quantityPerMonth: number
  extendedCost: number
  extendedPrice: number
}

export interface OtherLaborData {
  percentage: number // Percentage of support labor to allocate as budget (e.g., 5 = 5%)
  customItems: CustomLaborItem[] // Custom items that subtract from the budget
}