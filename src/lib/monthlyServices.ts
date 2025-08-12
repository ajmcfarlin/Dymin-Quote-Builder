import { FixedCostTool, VariableCostTool } from '@/types/monthlyServices'

export const DEFAULT_FIXED_COST_TOOLS: FixedCostTool[] = [
  {
    id: 'ncentral-customer-license',
    name: 'N-central (Customer License)',
    isActive: false,
    customersSupported: 0,
    monthlyAmortizedCost: 0,
    costPerCustomerPerMonth: 0,
    markup: 0,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'connectwise',
    name: 'ConnectWise',
    isActive: false,
    customersSupported: 0,
    monthlyAmortizedCost: 4500,
    costPerCustomerPerMonth: 0,
    markup: 20,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'remote-control',
    name: 'Remote Control',
    isActive: false,
    customersSupported: 0,
    monthlyAmortizedCost: 209,
    costPerCustomerPerMonth: 0,
    markup: 20,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'crm',
    name: 'CRM',
    isActive: false,
    customersSupported: 0,
    monthlyAmortizedCost: 190,
    costPerCustomerPerMonth: 0,
    markup: 20,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'quickpass',
    name: 'QuickPass',
    isActive: false,
    customersSupported: 0,
    monthlyAmortizedCost: 600,
    costPerCustomerPerMonth: 0,
    markup: 0,
    extendedPrice: 0,
    margin: 0
  }
]

export const DEFAULT_VARIABLE_COST_TOOLS: VariableCostTool[] = [
  {
    id: 'ncentral-device-license',
    name: 'N-central (Device License)',
    isActive: false,
    nodesUnitsSupported: 30,
    costPerNodeUnit: 0.85,
    extendedCost: 25.50,
    pricePerNodeUnit: 8.50,
    extendedPrice: 255.00,
    margin: 90.0
  },
  {
    id: 'switch',
    name: 'Switch',
    isActive: false,
    nodesUnitsSupported: 3,
    costPerCustomer: 0,
    extendedCost: 0,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'firewall',
    name: 'Firewall',
    isActive: false,
    nodesUnitsSupported: 2,
    costPerNodeUnit: 0.85,
    extendedCost: 1.70,
    pricePerNodeUnit: 8.50,
    extendedPrice: 17.00,
    margin: 90.0
  },
  {
    id: 'firewall-haas-bundle',
    name: 'Firewall Monthly HAAS Bundle',
    isActive: false,
    nodesUnitsSupported: 0,
    costPerNodeUnit: 48.30,
    extendedCost: 0,
    pricePerNodeUnit: 69.00,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'huntress-siem',
    name: 'Huntress SIEM Solution',
    isActive: false,
    nodesUnitsSupported: 0,
    costPerNodeUnit: 1.40,
    extendedCost: 0,
    markup: 65,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'ninja-backup',
    name: 'Ninja Backup (Per Server/VM)',
    isActive: false,
    nodesUnitsSupported: 2,
    costPerNodeUnit: 19.00,
    extendedCost: 38.00,
    pricePerNodeUnit: 35.00,
    extendedPrice: 70.00,
    margin: 45.7
  },
  {
    id: 'pc-parts-warranty',
    name: 'PC Parts and Service (warranty)',
    isActive: false,
    nodesUnitsSupported: 28,
    costPerNodeUnit: 0.86,
    extendedCost: 24.08,
    markup: 60,
    extendedPrice: 38.53,
    margin: 37.5
  },
  {
    id: 'zorus-dns',
    name: 'Zorus DNS Web Filtering',
    isActive: false,
    nodesUnitsSupported: 30,
    costPerNodeUnit: 1.00,
    extendedCost: 30.00,
    markup: 60,
    pricePerNodeUnit: 2.00,
    extendedPrice: 60.00,
    margin: 50.0
  },
  {
    id: 'managed-printer',
    name: 'Managed Printer',
    isActive: false,
    nodesUnitsSupported: 8,
    costPerNodeUnit: 5.00,
    extendedCost: 40.00,
    pricePerNodeUnit: 8.50,
    extendedPrice: 68.00,
    margin: 41.2
  },
  {
    id: 'infima-training',
    name: 'Infima Cyber Security Training',
    isActive: false,
    nodesUnitsSupported: 0,
    costPerNodeUnit: 1.50,
    extendedCost: 0,
    pricePerNodeUnit: 3.00,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'inky-email',
    name: 'INKY Email Security',
    isActive: false,
    nodesUnitsSupported: 0,
    costPerNodeUnit: 1.60,
    extendedCost: 0,
    pricePerNodeUnit: 3.00,
    extendedPrice: 0,
    margin: 0
  },
  {
    id: 'ninja-saas-backup',
    name: 'Ninja SaaS M365 Backup',
    isActive: false,
    nodesUnitsSupported: 25,
    costPerNodeUnit: 1.50,
    extendedCost: 37.50,
    pricePerNodeUnit: 3.00,
    extendedPrice: 75.00,
    margin: 50.0
  },
  {
    id: 'huntress-av',
    name: 'Huntress AV Mgmt',
    isActive: false,
    nodesUnitsSupported: 28,
    costPerNodeUnit: 1.40,
    extendedCost: 39.20,
    pricePerNodeUnit: 3.95,
    extendedPrice: 110.60,
    margin: 64.6
  },
  {
    id: 'lionguard',
    name: 'LionGard',
    isActive: false,
    nodesUnitsSupported: 1,
    costPerCustomer: 15.00,
    extendedCost: 15.00,
    pricePerNodeUnit: 30.00,
    extendedPrice: 30.00,
    margin: 50.0
  },
  {
    id: 'managed-wifi',
    name: 'Managed Wifi AP',
    isActive: false,
    nodesUnitsSupported: 3,
    costPerNodeUnit: 0,
    extendedCost: 0,
    pricePerNodeUnit: 2.00,
    extendedPrice: 6.00,
    margin: 100.0
  },
  {
    id: 'threat-locker',
    name: 'Threat Locker Zero Trust',
    isActive: false,
    nodesUnitsSupported: 30,
    costPerNodeUnit: 1.95,
    extendedCost: 58.50,
    pricePerNodeUnit: 3.25,
    extendedPrice: 97.50,
    margin: 40.0
  },
  {
    id: 'ms-premium',
    name: 'Microsoft Premium License',
    isActive: false,
    nodesUnitsSupported: 24,
    costPerNodeUnit: 18.48,
    extendedCost: 443.52,
    pricePerNodeUnit: 22.00,
    extendedPrice: 528.00,
    margin: 16.0
  },
  {
    id: 'ms-business-standard',
    name: 'Microsoft Business Standard',
    isActive: false,
    nodesUnitsSupported: 4,
    costPerNodeUnit: 10.80,
    extendedCost: 43.20,
    pricePerNodeUnit: 12.50,
    extendedPrice: 50.00,
    margin: 13.6
  },
  {
    id: 'exchange-online',
    name: 'Exchange Online Plan 2',
    isActive: false,
    nodesUnitsSupported: 1,
    costPerNodeUnit: 4.10,
    extendedCost: 4.10,
    pricePerNodeUnit: 5.00,
    extendedPrice: 5.00,
    margin: 18.0
  },
  {
    id: 'ms-email-only',
    name: 'Microsoft Email only License',
    isActive: false,
    nodesUnitsSupported: 5,
    costPerNodeUnit: 3.36,
    extendedCost: 16.80,
    pricePerNodeUnit: 5.00,
    extendedPrice: 25.00,
    margin: 32.8
  },
  {
    id: 'ms-management-fee',
    name: 'Microsoft Management Fee',
    isActive: false,
    nodesUnitsSupported: 1,
    costPerNodeUnit: 0,
    extendedCost: 0,
    pricePerNodeUnit: 181.79,
    extendedPrice: 181.79,
    margin: 100.0
  },
  {
    id: 'ms-365-f3',
    name: 'Microsoft 365 F3',
    isActive: false,
    nodesUnitsSupported: 3,
    costPerNodeUnit: 4.20,
    extendedCost: 12.60,
    pricePerNodeUnit: 15.00,
    extendedPrice: 45.00,
    margin: 16.0
  },
  {
    id: 'azure-info-protection',
    name: 'Azure Information Protection Plan 1',
    isActive: false,
    nodesUnitsSupported: 1,
    costPerNodeUnit: 1.68,
    extendedCost: 1.68,
    pricePerNodeUnit: 2.15,
    extendedPrice: 2.15,
    margin: 21.9
  },
  {
    id: 'project-plan-3',
    name: 'Project Plan 3',
    isActive: false,
    nodesUnitsSupported: 2,
    costPerNodeUnit: 30.24,
    extendedCost: 60.48,
    pricePerNodeUnit: 36.00,
    extendedPrice: 72.00,
    margin: 16.0
  }
]