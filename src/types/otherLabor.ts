export interface MonthlyLaborService {
  id: string
  name: string
  isActive: boolean
  skillLevel: 1 | 2 | 3
  factor1: 'onsite' | 'remote'
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
  factor1: 'onsite' | 'remote'
  factor2: 'business' | 'afterhours'
  quantityPerMonth: number
  extendedCost: number
  extendedPrice: number
}

export interface OtherLaborData {
  monthlyServices: MonthlyLaborService[]
  incidentServices: IncidentBasedService[]
}