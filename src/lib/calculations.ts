import { CustomerInfo, ServiceCategory, LaborRates, QuoteCalculation, SetupService } from '@/types/quote'
import { MonthlyServicesData } from '@/types/monthlyServices'
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
      ? customer.users.full
      : customer.users.full * 0.5

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
    ncentral: customer.infrastructure.workstations * 5.50,
    remoteControl: customer.users.full * 2.25,
    quickpass: customer.users.full * 1.50,
    antivirus: customer.infrastructure.workstations * 3.00,
    backup: customer.infrastructure.servers * 25.00
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
        const laborCost = calculatedHours * rates.priceBusinessHours
        return total + laborCost
      }
      return total + (service.price || 0)
    }, 0)
}

export function calculateHaaS(customer: CustomerInfo): number {
  const workstationHaas = customer.infrastructure.workstations * 25
  const serverHaas = customer.infrastructure.servers * 100
  
  return workstationHaas + serverHaas
}

export function calculateWarranty(customer: CustomerInfo): number {
  const workstationWarranty = customer.infrastructure.workstations * 15
  const serverWarranty = customer.infrastructure.servers * 75
  
  return workstationWarranty + serverWarranty
}

export function calculateMonthlyServicesTotal(monthlyServices?: MonthlyServicesData): number {
  if (!monthlyServices) return 0
  
  const fixedTotal = monthlyServices.fixedCostTools
    .filter(tool => tool.isActive)
    .reduce((sum, tool) => sum + tool.extendedPrice, 0)
  
  const variableTotal = monthlyServices.variableCostTools
    .filter(tool => tool.isActive)
    .reduce((sum, tool) => sum + tool.extendedPrice, 0)
  
  return fixedTotal + variableTotal
}

export function calculateQuote(
  customer: CustomerInfo,
  services: ServiceCategory[],
  setupServices: SetupService[],
  monthlyServices?: MonthlyServicesData,
  laborRates: LaborRates = DEFAULT_LABOR_RATES
): QuoteCalculation {
  const setupCosts = calculateSetupCosts(setupServices, laborRates, customer)
  
  // Calculate monthly services total from the new structure
  const monthlyServicesTotal = calculateMonthlyServicesTotal(monthlyServices)
  
  // Legacy calculations - keeping for backward compatibility but will be replaced by monthlyServices
  const supportLabor = 0  // calculateSupportLabor(customer, services, laborRates)
  const toolsSoftware = monthlyServicesTotal  // Now comes from monthly services
  const haas = 0  // calculateHaaS(customer)
  const warranty = 0  // calculateWarranty(customer)
  
  const monthlyTotal = supportLabor + toolsSoftware + haas + warranty
  const contractTotal = (monthlyTotal * customer.contractMonths) + setupCosts

  return {
    customer,
    services,
    setupServices,
    laborRates,
    totals: {
      supportLabor,
      toolsSoftware,
      setupCosts,
      haas,
      warranty,
      monthlyTotal,
      contractTotal
    }
  }
}