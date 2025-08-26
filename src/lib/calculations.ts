import { CustomerInfo, ServiceCategory, LaborRates, QuoteCalculation, SetupService } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
import { OtherLaborData } from '@/types/otherLabor'
import { calculateSetupServiceHours } from './setupServiceCalculations'

export const DEFAULT_LABOR_RATES: LaborRates = {
  level1: { cost: 22, priceBusinessHours: 155, priceAfterHours: 155 },
  level2: { cost: 37, priceBusinessHours: 185, priceAfterHours: 275 }, 
  level3: { cost: 46, priceBusinessHours: 275, priceAfterHours: 375 }
}

export function calculateSupportLabor(
  customer: CustomerInfo,
  services: ServiceCategory[],
  laborRates: LaborRates
): number {
  let total = 0

  services.forEach(service => {
    if (!service.isActive) return

    const customerFactor = customer.contractType === 'Managed Services'
      ? (customer.users.full || 0)
      : (customer.users.full || 0) * 0.5

    const rates = laborRates[`level${service.skillLevel}` as keyof LaborRates]

    total += service.hours.onsiteBusiness * customerFactor * rates.priceBusinessHours
    total += service.hours.remoteBusiness * customerFactor * rates.priceBusinessHours
    total += service.hours.onsiteAfterHours * customerFactor * rates.priceAfterHours
    total += service.hours.remoteAfterHours * customerFactor * rates.priceAfterHours
  })

  return Math.round(total * 100) / 100
}

export function calculateToolsCosts(customer: CustomerInfo): number {
  const licensing = {
    ncentral: (customer.infrastructure.workstations || 0) * 5.50,
    remoteControl: (customer.users.full || 0) * 2.25,
    quickpass: (customer.users.full || 0) * 1.50,
    antivirus: (customer.infrastructure.workstations || 0) * 3.00,
    backup: (customer.infrastructure.servers || 0) * 25.00
  }

  return Math.round(Object.values(licensing).reduce((sum, cost) => sum + cost, 0) * 100) / 100
}

export function calculateSetupCosts(setupServices: SetupService[], laborRates: LaborRates, customer: CustomerInfo): number {
  return setupServices
    .filter(service => service.isActive)
    .reduce((total, service) => {
      const calculatedHours = calculateSetupServiceHours(service.id, service.isActive, customer)
      
      if (calculatedHours && service.skillLevel) {
        const rates = laborRates[`level${service.skillLevel}` as keyof LaborRates]
        const priceRate = service.factor2 === 'afterhours' ? rates.priceAfterHours : rates.priceBusinessHours
        let laborCost = calculatedHours * priceRate
        
        // Email Migration includes license costs
        if (service.id === 'email-migration') {
          const licenseCost = 42 * ((customer.users.full || 0) + (customer.users.emailOnly || 0))
          laborCost += licenseCost
        }
        
        return total + laborCost
      }
      // Fallback to static price if no calculation available (shouldn't happen with current setup)
      return total + (service.price || 0)
    }, 0)
}

export function calculateHaaS(customer: CustomerInfo): number {
  const workstationHaas = (customer.infrastructure.workstations || 0) * 25
  const serverHaas = (customer.infrastructure.servers || 0) * 100
  
  return workstationHaas + serverHaas
}

export function calculateWarranty(customer: CustomerInfo): number {
  const workstationWarranty = (customer.infrastructure.workstations || 0) * 15
  const serverWarranty = (customer.infrastructure.servers || 0) * 75
  
  return workstationWarranty + serverWarranty
}

export function calculateMonthlyServicesTotal(monthlyServices?: MonthlyServicesData): number {
  if (!monthlyServices) return 0
  
  const variableTotal = monthlyServices.variableCostTools
    .filter(tool => tool.isActive && tool.extendedPrice > 0)
    .reduce((sum, tool) => sum + tool.extendedPrice, 0)
  
  return variableTotal
}

interface SupportDevice {
  id: string
  name: string
  category: 'servers' | 'users' | 'cloud' | 'infrastructure'
  isActive: boolean
  quantity: number
  skillLevel: 1 | 2 | 3
  hours: {
    predictable: {
      onsiteBusiness: number
      remoteBusiness: number
      onsiteAfterHours: number
      remoteAfterHours: number
    }
    reactive: {
      onsiteBusiness: number
      remoteBusiness: number
      onsiteAfterHours: number
      remoteAfterHours: number
    }
    emergency: {
      onsiteBusiness: number
      remoteBusiness: number
      onsiteAfterHours: number
      remoteAfterHours: number
    }
  }
}

export function calculateSupportDevicesLabor(supportDevices: SupportDevice[] = []): number {
  const priceRates = { 
    1: { business: 155, afterHours: 155 },
    2: { business: 185, afterHours: 275 },
    3: { business: 275, afterHours: 375 }
  }
  
  return supportDevices
    .filter(device => device.isActive)
    .reduce((total, device) => {
      const calculateServiceTypePrice = (hours: any) => {
        const businessHoursPrice = (hours.onsiteBusiness + hours.remoteBusiness) * priceRates[device.skillLevel].business
        const afterHoursPrice = (hours.onsiteAfterHours + hours.remoteAfterHours) * priceRates[device.skillLevel].afterHours
        return businessHoursPrice + afterHoursPrice
      }
      
      const predictablePrice = calculateServiceTypePrice(device.hours.predictable)
      const reactivePrice = calculateServiceTypePrice(device.hours.reactive)
      const emergencyPrice = calculateServiceTypePrice(device.hours.emergency)
      
      const deviceTotal = device.quantity * (predictablePrice + reactivePrice + emergencyPrice)
      return total + deviceTotal
    }, 0)
}

export function calculateOtherLabor(otherLaborData?: OtherLaborData): number {
  if (!otherLaborData || !otherLaborData.customItems) return 0
  
  // Only return the total of custom items that were actually added
  // The percentage is just a reference/budget guide, not auto-calculated
  const customItemsTotal = otherLaborData.customItems.reduce((sum, item) => sum + item.price, 0)
  
  return customItemsTotal
}

export function calculateQuote(
  customer: CustomerInfo,
  services: ServiceCategory[],
  setupServices: SetupService[],
  monthlyServices?: MonthlyServicesData,
  laborRates: LaborRates = DEFAULT_LABOR_RATES,
  upfrontPayment: number = 0,
  supportDevices: SupportDevice[] = [],
  otherLaborData?: OtherLaborData
): QuoteCalculation {
  const setupCosts = calculateSetupCosts(setupServices, laborRates, customer)
  
  // Calculate deferred setup amount (spread over contract)
  const deferredSetupAmount = setupCosts - upfrontPayment
  const deferredSetupMonthly = customer.contractMonths > 0 ? deferredSetupAmount / customer.contractMonths : 0
  
  // Calculate monthly services total from the new structure
  const monthlyServicesTotal = calculateMonthlyServicesTotal(monthlyServices)
  
  // Calculate support labor from devices
  const supportLabor = calculateSupportDevicesLabor(supportDevices)
  const otherLabor = calculateOtherLabor(otherLaborData)
  const toolsSoftware = monthlyServicesTotal  // Now comes from monthly services
  const haas = 0  // calculateHaaS(customer)
  const warranty = 0  // calculateWarranty(customer)
  
  // Monthly total includes deferred setup
  const monthlyTotal = supportLabor + otherLabor + toolsSoftware + haas + warranty + deferredSetupMonthly
  const contractTotal = (monthlyTotal * customer.contractMonths) + upfrontPayment

  return {
    customer,
    services,
    setupServices,
    laborRates,
    totals: {
      supportLabor,
      otherLabor,
      toolsSoftware,
      setupCosts,
      haas,
      warranty,
      monthlyTotal,
      contractTotal,
      upfrontPayment,
      deferredSetupMonthly
    }
  }
}