export interface NCentralConfig {
  contractStructure: 'Lease' | 'Purchase' | 'Subscription'
  licensingStructure: 'Device' | 'Customer'
  totalDeviceLicenses: number
  // For Purchase
  totalInitialPurchasePrice: number
  // For Lease/Subscription  
  monthlyLeasePayment: number
  monthlySubscriptionPayment: number
  leaseLength: number
  devicesMonitored: number
  costPerDevice: number // This will be calculated dynamically
  additionalSupport: number
}

export interface FixedCostTool {
  id: string
  name: string
  isActive: boolean
  customersSupported: number
  monthlyAmortizedCost: number
  costPerCustomerPerMonth: number
  markup: number
  extendedPrice: number
  margin: number
}

export interface VariableCostTool {
  id: string
  name: string
  isActive: boolean
  nodesUnitsSupported: number
  costPerCustomer?: number
  costPerNodeUnit?: number
  extendedCost: number
  markup?: number
  pricePerNodeUnit?: number
  extendedPrice: number
  margin: number
}

export interface MonthlyServicesData {
  ncentral: NCentralConfig
  fixedCostTools: FixedCostTool[]
  variableCostTools: VariableCostTool[]
}