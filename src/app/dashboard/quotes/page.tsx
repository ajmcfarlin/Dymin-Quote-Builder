'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function QuotesPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  // Mock data for demonstration
  const quotes = [
    {
      id: 'Q-2024-001',
      customerName: 'Acme Corporation',
      totalValue: 156000,
      status: 'pending',
      createdAt: '2024-01-15',
      contractMonths: 36
    },
    {
      id: 'Q-2024-002',
      customerName: 'TechFlow Solutions',
      totalValue: 98500,
      status: 'approved',
      createdAt: '2024-01-12',
      contractMonths: 24
    },
    {
      id: 'Q-2024-003',
      customerName: 'Metro Manufacturing',
      totalValue: 245000,
      status: 'draft',
      createdAt: '2024-01-10',
      contractMonths: 48
    }
  ]

  const getStatusBadge = (status: string) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
            <p className="mt-2 text-gray-600">View and manage all quotes</p>
          </div>
          <a
            href="/dashboard/new-quote"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors border"
            style={{ borderColor: '#15bef0' }}
          >
            Create New Quote
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract Length
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quote.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(quote.totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.contractMonths} months
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-gray-900">View</button>
                          <button className="text-gray-600 hover:text-gray-900">Edit</button>
                          <button className="text-gray-600 hover:text-gray-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}