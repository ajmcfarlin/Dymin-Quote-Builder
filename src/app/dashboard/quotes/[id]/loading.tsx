import { DashboardLayout } from '@/components/DashboardLayout'

export default function QuoteViewLoading() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}