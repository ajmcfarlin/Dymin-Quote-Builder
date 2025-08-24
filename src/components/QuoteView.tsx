'use client'

import { SavedQuote } from '@/types/savedQuote'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, User, Building, MapPin, FileText, Calculator, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSetupServiceHours } from '@/lib/setupServiceCalculations'

interface QuoteViewProps {
  quote: SavedQuote & {
    user?: {
      name: string
      email: string
    }
  }
}

export function QuoteView({ quote }: QuoteViewProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateSetupServicePrice = (service: any) => {
    if (!quote.customerData) return 0
    
    const hours = calculateSetupServiceHours(service.id, service.isActive, quote.customerData)
    const priceRate = service.skillLevel === 1 ? 155 : service.skillLevel === 2 ? 185 : 275
    
    let servicePrice = hours * priceRate
    
    // Email Migration includes license costs
    if (service.id === 'email-migration') {
      const priceLicense = 42 * ((quote.customerData.users?.full || 0) + (quote.customerData.users?.emailOnly || 0))
      servicePrice += priceLicense
    }
    
    return servicePrice
  }

  return (
    <div className="space-y-6">

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pr-6 border-r" style={{ borderColor: '#15bef0' }}>
              <h4 className="font-semibold text-gray-900">{quote.customerName}</h4>
              {quote.customerEmail && (
                <p className="text-gray-600">{quote.customerEmail}</p>
              )}
              {quote.customerAddress && (
                <div className="flex items-start mt-2 text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                  <span>{quote.customerAddress}</span>
                </div>
              )}
            </div>
            <div className="px-6 border-r" style={{ borderColor: '#15bef0' }}>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500 font-medium">Region:</span>
                  <span className="text-gray-900 font-semibold">{quote.customerRegion || 'Not specified'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 font-medium">Contract Type:</span>
                  <span className="text-gray-900 font-semibold">{quote.contractType || 'Not specified'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 font-medium">Contract Length:</span>
                  <span className="text-gray-900 font-semibold">{quote.contractMonths} months</span>
                </div>
              </div>
            </div>
            <div className="pl-6">
              {quote.customerData?.users && (
                <div className="space-y-2 text-sm">
                  <div className="flex gap-3">
                    <span className="text-gray-500 font-medium">Full Users:</span>
                    <span className="text-gray-900 font-semibold">{quote.customerData.users.full || 0}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-500 font-medium">Email-Only Users:</span>
                    <span className="text-gray-900 font-semibold">{quote.customerData.users.emailOnly || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Overview */}
      {quote.customerData?.infrastructure && (
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {Array.from({ length: 4 }, (_, colIndex) => {
                const entries = Object.entries(quote.customerData.infrastructure)
                const itemsPerColumn = Math.ceil(entries.length / 4)
                const startIndex = colIndex * itemsPerColumn
                const columnEntries = entries.slice(startIndex, startIndex + itemsPerColumn)
                
                if (columnEntries.length === 0) return null
                
                return (
                  <div key={colIndex} className={`space-y-2 ${colIndex === 0 ? 'pr-6 border-r' : colIndex === 1 ? 'px-6 border-r' : colIndex === 2 ? 'px-6 border-r' : 'pl-6'}`} style={colIndex !== 0 && colIndex !== 3 ? { borderColor: '#15bef0' } : colIndex === 0 ? { borderColor: '#15bef0' } : {}}>
                    {columnEntries.map(([key, value]) => (
                      <div key={key} className="flex gap-3">
                        <span className="text-gray-500 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span className="text-gray-900 font-semibold">{value as number}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Quote Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Setup Services */}
            {quote.setupServices && quote.setupServices.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Setup Services</h4>
                <div className="space-y-2">
                  {quote.setupServices
                    .filter((service: any) => service.isActive)
                    .map((service: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700">{service.name}</span>
                        <span className="font-medium">{formatCurrency(calculateSetupServicePrice(service))}</span>
                      </div>
                    ))}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                      <span className="font-semibold text-gray-900">Setup Services (Monthly):</span>
                      <span className="font-semibold text-gray-900">{formatCurrency((quote.setupCosts - quote.upfrontPayment) / quote.contractMonths)}</span>
                    </div>
                    <div className="text-xs text-gray-500 px-3">
                      {formatCurrency(quote.setupCosts)} ÷ {quote.contractMonths} months
                      {quote.upfrontPayment > 0 && ` (${formatCurrency(quote.upfrontPayment)} paid upfront)`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Services */}
            {quote.monthlyServices?.variableCostTools && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Monthly Services</h4>
                <div className="space-y-2">
                  {quote.monthlyServices.variableCostTools
                    .filter((tool: any) => tool.isActive && tool.nodesUnitsSupported > 0)
                    .map((tool: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-gray-700">{tool.name}</span>
                          <div className="text-sm text-gray-500">
                            {tool.nodesUnitsSupported} units × {formatCurrency(tool.pricePerNodeUnit || 0)}
                          </div>
                        </div>
                        <span className="font-medium">{formatCurrency(tool.extendedPrice || 0)}</span>
                      </div>
                    ))}
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="font-semibold text-gray-900">Monthly Services Total:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(quote.monthlyTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Labor */}
            {quote.otherLaborData && Object.values(quote.otherLaborData).some((labor: any) => labor.isActive && labor.hours > 0) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Other Labor</h4>
                <div className="space-y-2">
                  {Object.entries(quote.otherLaborData)
                    .filter(([_, labor]: [string, any]) => labor.isActive && labor.hours > 0)
                    .map(([key, labor]: [string, any], index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          <div className="text-sm text-gray-500">
                            {labor.hours} hours × {formatCurrency(labor.rate || 0)}
                          </div>
                        </div>
                        <span className="font-medium">{formatCurrency((labor.hours || 0) * (labor.rate || 0))}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Financial Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Upfront Payment:</span>
                  <span className="text-lg font-semibold">{formatCurrency(quote.upfrontPayment)}</span>
                </div>
                {quote.discountType && quote.discountType !== 'none' && (
                  <div className="flex justify-between items-center py-2 text-red-600">
                    <span>Discount ({quote.discountType}):</span>
                    <span className="font-semibold">
                      -{quote.discountType === 'percentage' ? `${quote.discountValue}%` : formatCurrency(quote.discountValue || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">Contract Total:</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(quote.contractTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {(quote.notes || quote.clientNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quote.clientNotes && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Client Notes</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{quote.clientNotes}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Internal Notes</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Print/Download Actions & Metadata */}
      <div className="flex justify-between items-center py-6 print:hidden border-t border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => window.print()}
            className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
            style={{ backgroundColor: '#15bef0' }}
          >
            Print Quote
          </button>
          <button
            className="px-6 py-2 rounded-lg font-medium border text-gray-900 hover:bg-gray-50"
            style={{ borderColor: '#15bef0' }}
            onClick={() => {
              // TODO: Implement PDF download
              alert('PDF download will be implemented')
            }}
          >
            Download PDF
          </button>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          <div className="flex items-center mb-1">
            <CalendarDays className="w-4 h-4 mr-2" />
            Created: {formatDate(quote.createdAt)}
          </div>
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 mr-2" />
            Updated: {formatDate(quote.updatedAt)}
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Created by: {quote.user?.name || 'Unknown'}
          </div>
        </div>

      </div>
    </div>
  )
}