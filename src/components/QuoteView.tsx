'use client'

import { SavedQuote } from '@/types/savedQuote'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, User, Building, MapPin, FileText, Calculator, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSetupServiceHours } from '@/lib/setupServiceCalculations'
import { toast } from 'sonner'

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

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      toast.error('Please allow popups for this site to enable printing')
      return
    }

    // Get the quote content
    const quoteContent = document.getElementById('quote-content')
    if (!quoteContent) {
      toast.error('Quote content not found')
      printWindow.close()
      return
    }

    // Create the print document
    const printDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quote ${quote.quoteNumber || quote.id}</title>
        <style>
          @page { 
            margin: 0.75in; 
            size: A4;
          }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 8px;
          }
          .space-y-6 > * + * { margin-top: 4px; }
          .grid { 
            display: table; 
            width: 100%; 
            border-collapse: collapse;
          }
          .grid > * { 
            display: table-cell; 
            vertical-align: top; 
            padding: 0 8px;
          }
          .grid > *:first-child { padding-left: 8px; }
          .grid > *:last-child { padding-right: 8px; }
          .gap-6 { gap: 12px; }
          .card { 
            border: 1px solid #e5e7eb; 
            margin-bottom: 4px; 
            border-radius: 4px;
          }
          .card-header { 
            background-color: #f9f9f9; 
            padding: 6px 12px; 
            border-bottom: 1px solid #e5e7eb;
            border-radius: 4px 4px 0 0;
          }
          .card-content { padding: 8px 12px; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .ml-auto { margin-left: auto; }
          .space-y-2 > * + * { margin-top: 8px; }
          .space-y-4 > * + * { margin-top: 4px; }
          .text-sm { font-size: 14px; }
          .text-lg { font-size: 18px; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-900 { color: #111827; }
          .border-r { border-right: 1px solid #e5e7eb; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          .pr-6 { padding-right: 24px; }
          .pl-6 { padding-left: 24px; }
          .px-6 { padding-left: 24px; padding-right: 24px; }
          .py-2 { padding-top: 4px; padding-bottom: 4px; }
          .mb-2 { margin-bottom: 4px; }
          .mb-4 { margin-bottom: 8px; }
          .space-y-6 { margin-top: 0; }
          .space-y-6 > div { padding-left: 6px; padding-right: 6px; }
          .space-y-2 > div { padding-left: 6px; padding-right: 6px; }
          .print\\:hidden { display: none !important; }
          .w-5 { width: 20px; }
          .h-5 { height: 20px; }
          .mr-2 { margin-right: 8px; }
          svg { display: none; }
          .line-through { text-decoration: line-through; }
          h1 { font-size: 24px; font-weight: bold; margin: 0 0 16px 0; }
          h2 { font-size: 18px; font-weight: 600; margin: 0 0 12px 0; }
          h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
          h4 { font-size: 14px; font-weight: 600; margin: 0 0 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { 
            padding: 8px 12px; 
            border: 1px solid #e5e7eb; 
            text-align: left;
          }
          th { 
            background-color: #f9f9f9; 
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        ${quoteContent.outerHTML}
      </body>
      </html>
    `

    // Write the document and trigger print
    printWindow.document.write(printDocument)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }


  // Calculate discounted amounts
  const calculateDiscountedTotal = (originalTotal: number) => {
    if (!quote.discountType || quote.discountType === 'none' || !quote.discountValue) return originalTotal
    
    switch (quote.discountType) {
      case 'percentage':
        return originalTotal * (1 - quote.discountValue / 100)
      case 'raw_dollar':
        return originalTotal - quote.discountValue
      case 'margin_override':
        const estimatedCost = originalTotal * 0.35 // Rough 35% cost estimate
        return estimatedCost / (1 - quote.discountValue / 100)
      case 'per_user':
        const fullUsers = quote.customerData?.users?.full || 0
        return quote.discountValue > 0 && fullUsers > 0 ? quote.discountValue * fullUsers : originalTotal
      case 'override':
        return quote.discountValue
      default:
        return originalTotal
    }
  }

  const hasDiscount = quote.discountType && quote.discountType !== 'none' && quote.discountValue && quote.discountValue > 0
  const originalTotal = quote.originalMonthlyTotal || quote.monthlyTotal
  const discountedTotal = quote.discountedTotal || quote.monthlyTotal
  const totalDiscountAmount = hasDiscount ? originalTotal - discountedTotal : 0
  const isIncrease = totalDiscountAmount < 0

  const calculateDiscountedComponent = (componentPrice: number) => {
    if (!hasDiscount || originalTotal === 0) return componentPrice
    const weighting = componentPrice / originalTotal
    const componentDiscount = totalDiscountAmount * weighting
    return componentPrice - componentDiscount
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
    <div id="quote-content" className="space-y-6 print:break-inside-avoid">

      {/* Customer Information */}
      <Card className="print:break-inside-avoid card">
        <CardHeader className="card-header">
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:pr-6 md:border-r mb-4 md:mb-0" style={{ borderColor: '#15bef0' }}>
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
            <div className="md:px-6 md:border-r mb-4 md:mb-0" style={{ borderColor: '#15bef0' }}>
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
            <div className="md:pl-6">
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
        <Card className="print:break-inside-avoid card">
          <CardHeader className="card-header">
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
                  <div key={colIndex} className={`space-y-2 ${colIndex === 0 ? 'md:pr-6 md:border-r' : colIndex === 1 ? 'md:px-6 md:border-r' : colIndex === 2 ? 'md:px-6 md:border-r' : 'md:pl-6'}`} style={colIndex !== 0 && colIndex !== 3 ? { borderColor: '#15bef0' } : colIndex === 0 ? { borderColor: '#15bef0' } : {}}>
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
      <Card className="print:break-inside-avoid card">
        <CardHeader className="card-header">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Quote Breakdown
            </div>
            {hasDiscount && (
              <div className="text-sm font-normal text-right ml-auto max-w-xs">
                <div className="text-gray-600 break-words">
                  Discount: {quote.discountType === 'percentage' ? `${quote.discountValue}%` : 
                    quote.discountType === 'raw_dollar' ? formatCurrency(quote.discountValue || 0) :
                    quote.discountType === 'margin_override' ? `${quote.discountValue}% margin` :
                    quote.discountType === 'per_user' ? `${formatCurrency(quote.discountValue || 0)}/user` :
                    'Custom pricing'}
                </div>
                <div className={`font-medium break-words ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncrease ? '+' : '-'}{formatCurrency(Math.abs(totalDiscountAmount))}
                </div>
              </div>
            )}
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
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 gap-4">
                        <span className="text-gray-700 flex-1">{service.name}</span>
                        <div className="text-right flex-shrink-0">
                          {(() => {
                            const setupPrice = calculateSetupServicePrice(service)
                            return hasDiscount ? (
                              <div>
                                <span className="text-gray-500 line-through text-sm">{formatCurrency(setupPrice)}</span>
                                <br />
                                <span className="font-medium">{formatCurrency(calculateDiscountedComponent(setupPrice))}</span>
                              </div>
                            ) : (
                              <span className="font-medium">{formatCurrency(setupPrice)}</span>
                            )
                          })()}
                        </div>
                      </div>
                    ))}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                      <span className="font-semibold text-gray-900">Setup Services (Monthly):</span>
                      <div className="text-right">
                        {(() => {
                          const setupMonthly = (quote.setupCosts - quote.upfrontPayment) / quote.contractMonths
                          const discountedSetupMonthly = calculateDiscountedComponent(setupMonthly)
                          return hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm">{formatCurrency(setupMonthly)}</span>
                              <br />
                              <span className="font-semibold text-gray-900">{formatCurrency(discountedSetupMonthly)}</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-gray-900">{formatCurrency(setupMonthly)}</span>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 px-3">
                      {formatCurrency(quote.setupCosts)} ÷ {quote.contractMonths} months
                      {quote.upfrontPayment > 0 && ` (${formatCurrency(quote.upfrontPayment)} paid upfront)`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tools & Software */}
            {quote.monthlyServices?.variableCostTools && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tools & Software</h4>
                <div className="space-y-2">
                  {quote.monthlyServices.variableCostTools
                    .filter((tool: any) => tool.isActive && tool.nodesUnitsSupported > 0)
                    .map((tool: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 gap-4">
                        <div className="flex-1">
                          <span className="text-gray-700">{tool.name}</span>
                          <div className="text-sm text-gray-500">
                            {tool.nodesUnitsSupported} units × {formatCurrency(tool.pricePerNodeUnit || 0)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm">{formatCurrency(tool.extendedPrice || 0)}</span>
                              <br />
                              <span className="font-medium">{formatCurrency(calculateDiscountedComponent(tool.extendedPrice || 0))}</span>
                            </div>
                          ) : (
                            <span className="font-medium">{formatCurrency(tool.extendedPrice || 0)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="font-semibold text-gray-900">Tools & Software Total:</span>
                    <div className="text-right">
                      {(() => {
                        const toolsTotal = quote.monthlyServices.variableCostTools.filter((tool: any) => tool.isActive && tool.nodesUnitsSupported > 0).reduce((sum: number, tool: any) => sum + (tool.extendedPrice || 0), 0)
                        const discountedToolsTotal = calculateDiscountedComponent(toolsTotal)
                        return hasDiscount ? (
                          <div>
                            <span className="text-gray-500 line-through text-sm">{formatCurrency(toolsTotal)}</span>
                            <br />
                            <span className="font-semibold text-gray-900">{formatCurrency(discountedToolsTotal)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-900">{formatCurrency(toolsTotal)}</span>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Labor */}
            {quote.supportDevices && quote.supportDevices.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Support Labor</h4>
                <div className="space-y-2">
                  {quote.supportDevices
                    .filter((device: any) => device.isActive && device.quantity > 0)
                    .map((device: any, index: number) => {
                      const unitPrice = device.monthlyPrice || 0
                      return (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 gap-4">
                          <div className="flex-1">
                            <span className="text-gray-700">{device.name}</span>
                            <div className="text-sm text-gray-500">
                              {device.quantity} devices × {formatCurrency(unitPrice / (device.quantity || 1))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {hasDiscount ? (
                              <div>
                                <span className="text-gray-500 line-through text-sm">{formatCurrency(unitPrice)}</span>
                                <br />
                                <span className="font-medium">{formatCurrency(calculateDiscountedComponent(unitPrice))}</span>
                              </div>
                            ) : (
                              <span className="font-medium">{formatCurrency(unitPrice)}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="font-semibold text-gray-900">Support Labor Total:</span>
                    <div className="text-right">
                      {(() => {
                        const supportTotal = quote.supportDevices.filter((device: any) => device.isActive && device.quantity > 0).reduce((sum: number, device: any) => sum + (device.monthlyPrice || 0), 0)
                        const discountedSupportTotal = calculateDiscountedComponent(supportTotal)
                        return hasDiscount ? (
                          <div>
                            <span className="text-gray-500 line-through text-sm">{formatCurrency(supportTotal)}</span>
                            <br />
                            <span className="font-semibold text-gray-900">{formatCurrency(discountedSupportTotal)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-900">{formatCurrency(supportTotal)}</span>
                        )
                      })()}
                    </div>
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
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 gap-4">
                        <div className="flex-1">
                          <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          <div className="text-sm text-gray-500">
                            {labor.hours} hours × {formatCurrency(labor.rate || 0)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(() => {
                            const laborPrice = (labor.hours || 0) * (labor.rate || 0)
                            return hasDiscount ? (
                              <div>
                                <span className="text-gray-500 line-through text-sm">{formatCurrency(laborPrice)}</span>
                                <br />
                                <span className="font-medium">{formatCurrency(calculateDiscountedComponent(laborPrice))}</span>
                              </div>
                            ) : (
                              <span className="font-medium">{formatCurrency(laborPrice)}</span>
                            )
                          })()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                {/* Show original price if discount exists and values are different */}
                {hasDiscount && totalDiscountAmount !== 0 && (
                  <div className="flex justify-between items-center py-2 text-gray-500">
                    <span className="line-through">Original Monthly:</span>
                    <span className="text-base line-through">{formatCurrency(originalTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Monthly Recurring:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(quote.discountedTotal && quote.discountType !== 'none' ? quote.discountedTotal : quote.monthlyTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Contract Length:</span>
                  <span className="text-lg font-semibold">{quote.contractMonths} months</span>
                </div>
                {/* Show original contract total if discount exists and values are different */}
                {hasDiscount && totalDiscountAmount !== 0 && (
                  <div className="flex justify-between items-center py-2 text-gray-500">
                    <span className="line-through">Original Total:</span>
                    <span className="text-base line-through">{formatCurrency(originalTotal * quote.contractMonths)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency((quote.discountedTotal && quote.discountType !== 'none' ? quote.discountedTotal : quote.monthlyTotal) * quote.contractMonths)}
                  </span>
                </div>
                {quote.upfrontPayment > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Upfront Payment:</span>
                    <span className="text-lg font-semibold">{formatCurrency(quote.upfrontPayment)}</span>
                  </div>
                )}
                {/* Discount info now shown inline above */}
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
            onClick={handlePrint}
            className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
            style={{ backgroundColor: '#15bef0' }}
          >
            Print Quote
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