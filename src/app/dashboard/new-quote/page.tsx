'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { QuoteWizard } from '@/components/QuoteWizard'
import { QuoteProvider } from '@/contexts/QuoteContext'

export default function NewQuotePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          <p className="mt-2 text-gray-600">Generate a new managed services quote</p>
        </div>
        <QuoteProvider>
          <QuoteWizard />
        </QuoteProvider>
      </div>
    </DashboardLayout>
  )
}