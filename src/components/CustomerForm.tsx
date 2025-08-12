'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CustomerInfo } from '@/types/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const customerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  region: z.string().min(1, 'Region is required'),
  contractMonths: z.number().min(12).max(60),
  contractType: z.enum(['Managed Services', 'Co-Managed Services']),
  users: z.object({
    full: z.number().min(0),
    emailOnly: z.number().min(0)
  }),
  infrastructure: z.object({
    workstations: z.number().min(0),
    servers: z.number().min(0),
    printers: z.number().min(0),
    phoneExtensions: z.number().min(0)
  })
})

interface CustomerFormProps {
  value?: CustomerInfo
  onChange: (customer: CustomerInfo) => void
}

export function CustomerForm({ value, onChange }: CustomerFormProps) {
  const { register, watch, formState: { errors } } = useForm<CustomerInfo>({
    resolver: zodResolver(customerSchema),
    defaultValues: value || {
      companyName: '',
      address: '',
      region: '',
      contractMonths: 36,
      contractType: 'Managed Services',
      users: { full: 0, emailOnly: 0 },
      infrastructure: { workstations: 0, servers: 0, printers: 0, phoneExtensions: 0 }
    }
  })

  React.useEffect(() => {
    const subscription = watch((value) => {
      // Always call onChange with the current form values, even if incomplete
      onChange(value as CustomerInfo)
    })
    return () => subscription.unsubscribe()
  }, [watch, onChange])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            {...register('companyName')}
            placeholder="Enter company name"
          />
          <Input
            label="Address"
            {...register('address')}
            placeholder="Enter address"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Region</label>
            <select
              {...register('region')}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Contract Type</label>
            <select
              {...register('contractType')}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Managed Services">Managed Services</option>
              <option value="Co-Managed Services">Co-Managed Services</option>
            </select>
          </div>
          <Input
            label="Contract Length (Months)"
            type="number"
            {...register('contractMonths', { valueAsNumber: true })}
            min="12"
            max="60"
          />
          <Input
            label="Full Users"
            type="number"
            {...register('users.full', { valueAsNumber: true })}
            min="0"
          />
          <Input
            label="Email Only Users"
            type="number"
            {...register('users.emailOnly', { valueAsNumber: true })}
            min="0"
          />
          <Input
            label="Workstations"
            type="number"
            {...register('infrastructure.workstations', { valueAsNumber: true })}
            min="0"
          />
          <Input
            label="Servers"
            type="number"
            {...register('infrastructure.servers', { valueAsNumber: true })}
            min="0"
          />
          <Input
            label="Printers"
            type="number"
            {...register('infrastructure.printers', { valueAsNumber: true })}
            min="0"
          />
          <Input
            label="Phone Extensions"
            type="number"
            {...register('infrastructure.phoneExtensions', { valueAsNumber: true })}
            min="0"
          />
        </div>
      </CardContent>
    </Card>
  )
}