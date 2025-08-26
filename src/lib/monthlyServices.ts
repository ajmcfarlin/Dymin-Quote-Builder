import { VariableCostTool, MonthlyServicesData } from '@/types/monthlyServices'


export const DEFAULT_VARIABLE_COST_TOOLS: VariableCostTool[] = [
  {
    id: '3433',
    name: 'Managed Workstation',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of workstations
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3427',
    name: 'Managed Server',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of servers
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3425',
    name: 'Managed Network WiFi Access Point',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page count of wifi access points
    costPerNodeUnit: 0,
    extendedCost: 0,
    pricePerNodeUnit: 2.00,
    extendedPrice: 0,
    margin: 100.0
  },
  {
    id: '3421',
    name: 'Managed Network Firewall',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page count of firewalls
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3426',
    name: 'Managed Printer',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page count of printers
    costPerNodeUnit: 5.00,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 41.2
  },
  {
    id: '3423',
    name: 'Managed Network Switch',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page count of switches
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3428',
    name: 'Managed UPS',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page count of UPS
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3414',
    name: 'Huntress',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of workstations and servers
    costPerNodeUnit: 1.40,
    extendedCost: 0,
    pricePerNodeUnit: 3.95,
    extendedPrice: 0,
    margin: 64.6
  },
  {
    id: '3516',
    name: 'Huntress 365',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of full and email only users
    costPerNodeUnit: 1.40,
    extendedCost: 0,
    pricePerNodeUnit: 3.95,
    extendedPrice: 0,
    margin: 64.6
  },
  {
    id: '3464',
    name: 'NinjaBackup',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of servers
    costPerNodeUnit: 19.00,
    extendedCost: 0,
    pricePerNodeUnit: 35.00,
    extendedPrice: 0,
    margin: 45.7
  },
  {
    id: '3506',
    name: 'ThreatLocker',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of workstations and servers
    costPerNodeUnit: 1.95,
    extendedCost: 0,
    pricePerNodeUnit: 3.25,
    extendedPrice: 0,
    margin: 40.0
  },
  {
    id: '3586',
    name: 'SaaS Backup',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of full and email only users
    costPerNodeUnit: 1.50,
    extendedCost: 0,
    pricePerNodeUnit: 3.00,
    extendedPrice: 0,
    margin: 50.0
  },
  {
    id: '3420',
    name: 'Managed NAS',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page count of NAS
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3810',
    name: 'Managed Mobile Device',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page mobile devices that need managed
    costPerNodeUnit: 0.85,
    extendedCost: 0,
    pricePerNodeUnit: 8.50,
    extendedPrice: 0,
    margin: 90.0
  },
  {
    id: '3418',
    name: 'Longard',
    isActive: true,
    nodesUnitsSupported: 0, // Always count of 1 on every environment
    costPerCustomer: 15.00,
    extendedCost: 0,
    costPerNodeUnit: 0,
    pricePerNodeUnit: 30.00,
    extendedPrice: 0,
    margin: 50.0
  },
  {
    id: '3413',
    name: 'Domain',
    isActive: true,
    nodesUnitsSupported: 0, // Add to into page number of domains used for email
    costPerNodeUnit: 0,
    extendedCost: 0,
    pricePerNodeUnit: 24.95,
    extendedPrice: 0,
    margin: 100.0
  },
  {
    id: '3412',
    name: 'DNS',
    isActive: true,
    nodesUnitsSupported: 0, // Into page count of domains used for email
    costPerNodeUnit: 1.00,
    extendedCost: 0,
    pricePerNodeUnit: 2.00,
    extendedPrice: 0,
    margin: 50.0
  },
  {
    id: '4181',
    name: '1 Password',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 0,
    extendedCost: 0,
    pricePerNodeUnit: 24.95,
    extendedPrice: 0,
    margin: 100.0
  },
  {
    id: '3410',
    name: 'Duo',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 0,
    extendedCost: 0,
    pricePerNodeUnit: 24.95,
    extendedPrice: 0,
    margin: 100.0
  },
  {
    id: '3522',
    name: 'Infima',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 1.50,
    extendedCost: 0,
    pricePerNodeUnit: 3.00,
    extendedPrice: 0,
    margin: 50.0
  },
  {
    id: '3415',
    name: 'INKY Inbound Mail Protect',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 1.60,
    extendedCost: 0,
    pricePerNodeUnit: 3.00,
    extendedPrice: 0,
    margin: 46.7
  },
  {
    id: '4164',
    name: 'INKY Outbound Mail Protect',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 1.60,
    extendedCost: 0,
    pricePerNodeUnit: 3.00,
    extendedPrice: 0,
    margin: 46.7
  },
  {
    id: '3914',
    name: 'INKY Email Signature',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 18.48,
    extendedCost: 0,
    pricePerNodeUnit: 22.00,
    extendedPrice: 0,
    margin: 16.0
  },
  {
    id: '3439',
    name: 'Microsoft 365 Business Premium [New Commerce Experience]',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 18.48,
    extendedCost: 0,
    pricePerNodeUnit: 22.00,
    extendedPrice: 0,
    margin: 16.0
  },
  {
    id: '3440',
    name: 'Microsoft 365 Business Standard [New Commerce Experience]',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 14.40,
    extendedCost: 0,
    pricePerNodeUnit: 18.00,
    extendedPrice: 0,
    margin: 20.0
  },
  {
    id: '3438',
    name: 'Microsoft 365 Business Basic [New Commerce Experience]',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 4.80,
    extendedCost: 0,
    pricePerNodeUnit: 6.00,
    extendedPrice: 0,
    margin: 20.0
  },
  {
    id: '3445',
    name: 'Exchange Online (Plan 1) [New Commerce Experience]',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 3.20,
    extendedCost: 0,
    pricePerNodeUnit: 4.00,
    extendedPrice: 0,
    margin: 20.0
  },
  {
    id: '3446',
    name: 'Exchange Online (Plan 2) [New Commerce Experience]',
    isActive: true, // Optional - Manually entered count
    nodesUnitsSupported: 0,
    costPerNodeUnit: 6.40,
    extendedCost: 0,
    pricePerNodeUnit: 8.00,
    extendedPrice: 0,
    margin: 20.0
  }
]

export const DEFAULT_MONTHLY_SERVICES_DATA: MonthlyServicesData = {
  variableCostTools: DEFAULT_VARIABLE_COST_TOOLS
}

// Utility function to calculate quantities based on infrastructure data
export function calculateToolQuantityFromInfrastructure(toolId: string, infrastructure: any, users: any): number {
  switch (toolId) {
    case '3433': // Managed Workstation
      return infrastructure.workstations || 0
    case '3427': // Managed Server
      return infrastructure.servers || 0
    case '3425': // Managed Network WiFi Access Point
      return infrastructure.wifiAccessPoints || 0
    case '3421': // Managed Network Firewall
      return infrastructure.firewalls || 0
    case '3426': // Managed Printer
      return infrastructure.printers || 0
    case '3423': // Managed Network Switch
      return infrastructure.switches || 0
    case '3428': // Managed UPS
      return infrastructure.ups || 0
    case '3414': // Huntress (workstations and servers)
      return (infrastructure.workstations || 0) + (infrastructure.servers || 0)
    case '3516': // Huntress 365 (full and email only users)
      return (users.full || 0) + (users.emailOnly || 0)
    case '3464': // NinjaBackup (servers)
      return infrastructure.servers || 0
    case '3506': // ThreatLocker (workstations and servers)
      return (infrastructure.workstations || 0) + (infrastructure.servers || 0)
    case '3586': // SaaS Backup (full and email only users)
      return (users.full || 0) + (users.emailOnly || 0)
    case '3420': // Managed NAS
      return infrastructure.nas || 0
    case '3810': // Managed Mobile Device
      return infrastructure.managedMobileDevices || 0
    case '3418': // Longard (always 1 per environment, but only when there's infrastructure)
      // Only return 1 if there's some meaningful infrastructure data
      const hasInfrastructure = (infrastructure.workstations || 0) + (infrastructure.servers || 0) + 
                               (infrastructure.printers || 0) + (infrastructure.wifiAccessPoints || 0) + 
                               (infrastructure.firewalls || 0) + (infrastructure.switches || 0) + 
                               (infrastructure.ups || 0) + (infrastructure.nas || 0) + 
                               (infrastructure.managedMobileDevices || 0) + (users.full || 0) + (users.emailOnly || 0) > 0
      return hasInfrastructure ? 1 : 0
    case '3413': // Domain (domains used for email)
      return infrastructure.domainsUsedForEmail || 0
    case '3412': // DNS (domains used for email)
      return infrastructure.domainsUsedForEmail || 0
    case '4181': // IT Password (optional, default 0)
    case '3410': // Duo (optional, default 0)
    case '3522': // Infima (optional, default 0)
    case '3415': // INKY Inbound Mail Protect (optional, default 0)
    case '4164': // INKY Outbound Mail Protect (optional, default 0)
    case '3914': // INKY Email Signature (optional, default 0)
    case '3439': // Microsoft 365 Business Premium [New Commerce Experience] (optional, default 0)
    case '3440': // Microsoft 365 Business Standard [New Commerce Experience] (optional, default 0)
    case '3438': // Microsoft 365 Business Basic [New Commerce Experience] (optional, default 0)
    case '3445': // Exchange Online (Plan 1) [New Commerce Experience] (optional, default 0)
    case '3446': // Exchange Online (Plan 2) [New Commerce Experience] (optional, default 0)
      return 0
    default:
      return 0
  }
}

// Check if a tool is optional (manually editable)
export function isOptionalTool(toolId: string): boolean {
  const optionalToolIds = ['4181', '3410', '3522', '3415', '4164', '3914', '3439', '3440', '3438', '3445', '3446']
  return optionalToolIds.includes(toolId) || toolId.startsWith('custom_')
}

// Check if a tool is custom (can be deleted)
export function isCustomTool(toolId: string): boolean {
  return toolId.startsWith('custom_')
}

// Update monthly services with calculated quantities
export function updateMonthlyServicesWithInfrastructure(
  monthlyServices: MonthlyServicesData, 
  infrastructure: any, 
  users: any
): MonthlyServicesData {
  const updatedTools = monthlyServices.variableCostTools.map(tool => {
    // Don't auto-calculate quantities for custom tools
    if (isCustomTool(tool.id)) {
      return tool
    }
    
    const calculatedQuantity = calculateToolQuantityFromInfrastructure(tool.id, infrastructure, users)
    const updatedTool = { ...tool, nodesUnitsSupported: calculatedQuantity }
    
    // Recalculate costs and prices
    if (updatedTool.costPerNodeUnit) {
      updatedTool.extendedCost = updatedTool.nodesUnitsSupported * updatedTool.costPerNodeUnit
      if (updatedTool.pricePerNodeUnit) {
        updatedTool.extendedPrice = updatedTool.nodesUnitsSupported * updatedTool.pricePerNodeUnit
      }
    } else if (updatedTool.costPerCustomer) {
      updatedTool.extendedCost = updatedTool.costPerCustomer
      if (updatedTool.pricePerNodeUnit) {
        updatedTool.extendedPrice = updatedTool.pricePerNodeUnit
      }
    }
    
    // For optional tools with 0 quantity, ensure extended price is also 0
    if (calculatedQuantity === 0 && isOptionalTool(tool.id)) {
      updatedTool.extendedCost = 0
      updatedTool.extendedPrice = 0
    }
    
    // Calculate margin
    if (updatedTool.extendedPrice > 0) {
      updatedTool.margin = ((updatedTool.extendedPrice - updatedTool.extendedCost) / updatedTool.extendedPrice) * 100
    } else {
      updatedTool.margin = 0
    }
    
    return updatedTool
  })
  
  return {
    ...monthlyServices,
    variableCostTools: updatedTools
  }
}