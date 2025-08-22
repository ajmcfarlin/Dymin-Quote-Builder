export interface LocalSupportDevice {
  id: string
  name: string
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

export const DEFAULT_DEVICES: LocalSupportDevice[] = [
  {
    id: 'domain-controllers',
    name: 'Domain Controllers',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.08, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.24, remoteBusiness: 0.08, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.05, remoteBusiness: 0.11, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'ms-intune-mgmt',
    name: 'MS InTune Mgmt',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.05, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.22, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.10, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'terminal-server',
    name: 'Terminal Server',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.10, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.22, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.10, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'azure-cloud-server',
    name: 'Azure Cloud Server',
    isActive: false,
    quantity: 0,
    skillLevel: 3,
    hours: {
      predictable: { onsiteBusiness: 0.00, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.00, remoteBusiness: 0.10, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.00, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'application-server',
    name: 'Application Server',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.00, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.00, remoteBusiness: 0.15, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.00, remoteBusiness: 0.10, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'co-managed-server',
    name: 'Co-Managed Server',
    isActive: false,
    quantity: 0,
    skillLevel: 2,
    hours: {
      predictable: { onsiteBusiness: 0.03, remoteBusiness: 0.10, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.00, remoteBusiness: 0.00, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.00, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'proactive-users',
    name: 'Proactive Users',
    isActive: false,
    quantity: 25,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0.05, remoteBusiness: 0.03, onsiteAfterHours: 0.00, remoteAfterHours: 0.01 },
      reactive: { onsiteBusiness: 0.02, remoteBusiness: 0.06, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.05, remoteBusiness: 0.05, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'essential-users',
    name: 'Essential Users',
    isActive: false,
    quantity: 0,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0.00, remoteBusiness: 0.10, onsiteAfterHours: 0.01, remoteAfterHours: 0.00 },
      reactive: { onsiteBusiness: 0.00, remoteBusiness: 0.10, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.00, remoteBusiness: 0.10, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  },
  {
    id: 'co-managed-users',
    name: 'Co-Managed Users',
    isActive: false,
    quantity: 0,
    skillLevel: 1,
    hours: {
      predictable: { onsiteBusiness: 0.02, remoteBusiness: 0.03, onsiteAfterHours: 0.00, remoteAfterHours: 0.01 },
      reactive: { onsiteBusiness: 0.00, remoteBusiness: 0.00, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 },
      emergency: { onsiteBusiness: 0.00, remoteBusiness: 0.00, onsiteAfterHours: 0.00, remoteAfterHours: 0.00 }
    }
  }
]

// Auto-calculate support devices based on customer data and setup services
export function calculateSupportDevicesFromCustomerData(
  customer: any, 
  setupServices: any[]
): LocalSupportDevice[] {
  console.log('calculateSupportDevicesFromCustomerData called with:', {
    customer,
    setupServices
  })
  
  return DEFAULT_DEVICES.map(device => {
    let updatedDevice = { ...device }
    
    // Set all devices to default to Level 2
    updatedDevice.skillLevel = 2
    
    switch (device.id) {
      case 'ms-intune-mgmt':
        // Auto-select if "In-tune onboarding" is selected in setup services
        const intuneOnboarding = setupServices.find(service => service.id === 'intune-onboarding')
        console.log(`Checking ${device.id}:`, { intuneOnboarding })
        if (intuneOnboarding?.isActive) {
          console.log(`Activating ${device.id}`)
          updatedDevice.isActive = true
          updatedDevice.quantity = 1
        }
        break
        
      case 'proactive-users':
        // Auto-calculate for "Managed Services" contract type using full users
        console.log(`Checking ${device.id}:`, { 
          contractType: customer.contractType, 
          users: customer.users 
        })
        if (customer.contractType === 'Managed Services' && customer.users?.full > 0) {
          console.log(`Activating ${device.id} with quantity ${customer.users.full}`)
          updatedDevice.isActive = true
          updatedDevice.quantity = customer.users.full
        }
        break
        
      case 'co-managed-users':
        // Auto-calculate for "Co-Managed Services" contract type using full users
        console.log(`Checking ${device.id}:`, { 
          contractType: customer.contractType, 
          users: customer.users 
        })
        if (customer.contractType === 'Co-Managed Services' && customer.users?.full > 0) {
          console.log(`Activating ${device.id} with quantity ${customer.users.full}`)
          updatedDevice.isActive = true
          updatedDevice.quantity = customer.users.full
        }
        break
        
      default:
        // Other devices remain unchanged but get Level 2
        break
    }
    
    return updatedDevice
  })
}