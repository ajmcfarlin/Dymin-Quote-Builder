'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { CustomerInfo, SetupService, QuoteCalculation } from '@/types/quote'
import { calculateQuote } from '@/lib/calculations'
import { DEFAULT_SETUP_SERVICES } from '@/lib/setupServices'
import { CustomerForm } from './CustomerForm'
import { SetupServiceSelector } from './SetupServiceSelector'
import { PricingSummary } from './PricingSummary'

export function QuoteForm() {
  const [customer, setCustomer] = useState<CustomerInfo>({
    companyName: '',
    address: '',
    region: '',
    contractMonths: 36,
    contractType: 'Managed Services',
    users: { full: 0, emailOnly: 0 },
    infrastructure: { 
      workstations: 0, 
      servers: 0, 
      printers: 0, 
      phoneExtensions: 0,
      wifiAccessPoints: 0,
      firewalls: 0,
      switches: 0,
      ups: 0,
      nas: 0,
      managedMobileDevices: 0,
      domainsUsedForEmail: 0
    }
  })
  const [setupServices, setSetupServices] = useState<SetupService[]>(DEFAULT_SETUP_SERVICES)
  const [calculations, setCalculations] = useState<QuoteCalculation>()

  const handleCustomerChange = useMemo(() => (newCustomer: CustomerInfo) => {
    setCustomer(newCustomer)
  }, [])

  const handleSetupServicesChange = useMemo(() => (newSetupServices: SetupService[]) => {
    setSetupServices(newSetupServices)
  }, [])

  useEffect(() => {
    const newCalculations = calculateQuote(customer, [], setupServices)
    setCalculations(newCalculations)
  }, [customer, setupServices])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomerForm value={customer} onChange={handleCustomerChange} />
          <SetupServiceSelector setupServices={setupServices} customer={customer} onChange={handleSetupServicesChange} />
        </div>
        <div>
          <PricingSummary calculations={calculations} />
        </div>
      </div>
    </div>
  )
}