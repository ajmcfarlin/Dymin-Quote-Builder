'use client'

import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { QuoteListItem } from '@/types/savedQuote'
import { QuoteAPI } from '@/lib/quoteApi'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete quote:', error)
      alert('Failed to delete quote. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (quotes.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
            No quotes found
          </td>
        </tr>
      </tbody>
    )
  }

  return (
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
  )
}