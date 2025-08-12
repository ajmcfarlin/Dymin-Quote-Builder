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
  fixedCostTools: FixedCostTool[]
  variableCostTools: VariableCostTool[]
}