'use client'

import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { QuoteListItem } from '@/types/savedQuote'
import { QuoteAPI } from '@/lib/quoteApi'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface QuotesTableProps {
  quotes: QuoteListItem[]
}

export function QuotesTable({ quotes }: QuotesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return
    
    setDeletingId(id)
    try {
      await QuoteAPI.deleteQuote(id)
      toast.success('Quote deleted successfully')
      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete quote:', error)
      toast.error('Failed to delete quote. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (quotes.length === 0) {
    return (
      <>
        {/* Desktop No Results */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Length</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No quotes found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Mobile No Results */}
        <div className="md:hidden p-6 text-center text-gray-500">
          No quotes found
        </div>
      </>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Length</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr 
                key={quote.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quote.quoteNumber || quote.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quote.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(quote.monthlyTotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quote.contractMonths} months
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(quote.contractTotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex space-x-3">
                    <Link
                      href={`/dashboard/quotes/${quote.id}/edit`}
                      className="hover:opacity-75"
                      title="Edit Quote"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      disabled={deletingId === quote.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Delete Quote"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
          >
            {/* Header: Customer Name + Quote ID */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                  {quote.customerName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  #{quote.quoteNumber || quote.id.slice(0, 8)}
                </p>
              </div>
              <div 
                className="flex space-x-2 ml-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/dashboard/quotes/${quote.id}/edit`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Quote"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </Link>
                <button
                  onClick={() => handleDelete(quote.id)}
                  disabled={deletingId === quote.id}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                  title="Delete Quote"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Financial Info */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(quote.monthlyTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contract Total</p>
                <p className="text-sm font-semibold" style={{ color: '#15bef0' }}>
                  {formatCurrency(quote.contractTotal)}
                </p>
              </div>
            </div>

            {/* Footer: Date */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>Created {new Date(quote.createdAt).toLocaleDateString()}</span>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}