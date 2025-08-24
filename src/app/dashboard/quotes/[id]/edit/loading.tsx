import { DashboardLayout } from '@/components/DashboardLayout'

export default function EditQuoteLoading() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse mb-4"></div>
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