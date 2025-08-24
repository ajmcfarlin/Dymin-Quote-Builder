'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function QuotesSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    } else {
      params.delete('search')
    }
    
    // Reset to page 1 when searching
    params.set('page', '1')
    
    router.push(`/dashboard/quotes?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchTerm('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/dashboard/quotes?${params.toString()}`)
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search quotes by customer name or quote number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#15bef0' }}
        >
          Search
        </button>
        {searchParams.get('search') && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  )
}