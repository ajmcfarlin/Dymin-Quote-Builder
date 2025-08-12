'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Pax8Product {
  id: string
  name: string
  [key: string]: any
}

interface Pax8Response {
  success: boolean
  message: string
  data?: any
  error?: string
}

export function HaloPSAPax8Test() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Pax8Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any>(null)

  const fetchPax8Details = async () => {
    setLoading(true)
    setError(null)
    setProducts([])
    setRawData(null)

    try {
      console.log('Fetching Pax8 details from HaloPSA...')
      
      const response = await fetch('/api/halopsa/pax8details')
      const data: Pax8Response = await response.json()

      console.log('Pax8Details API response:', data)
      setRawData(data.data)

      if (data.success) {
        // Handle different possible data structures
        let productList = []
        
        if (Array.isArray(data.data)) {
          productList = data.data
        } else if (data.data && Array.isArray(data.data.products)) {
          productList = data.data.products
        } else if (data.data && Array.isArray(data.data.items)) {
          productList = data.data.items
        } else if (data.data && typeof data.data === 'object') {
          // If it's an object, convert to array format for display
          productList = [data.data]
        }

        const formattedProducts = productList.map((product: any, index: number) => ({
          id: product.id || product.productId || `product-${index}`,
          name: product.name || product.productName || product.title || `Product ${index + 1}`,
          vendor: product.vendor || product.publisher || 'Microsoft',
          category: product.category || product.type,
          price: product.price || product.unitPrice,
          description: product.description,
          sku: product.sku || product.partNumber,
          raw: product
        }))

        setProducts(formattedProducts)
        console.log('Formatted Pax8 products:', formattedProducts)
      } else {
        setError(data.error || 'Failed to fetch Pax8 details')
      }
    } catch (error) {
      console.error('Error fetching Pax8 details:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HaloPSA Pax8 Integration Test</CardTitle>
        <p className="text-sm text-gray-600">
          Testing the Pax8Details endpoint to fetch Microsoft products
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fetch Button */}
        <button
          onClick={fetchPax8Details}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Fetching Pax8 Details...' : 'Get Pax8 Microsoft Products'}
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Fetching Microsoft products from Pax8...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="font-medium text-red-800">❌ Error</div>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Products List */}
        {products.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              Found {products.length} Pax8 Product{products.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="grid gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-lg">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        {product.id && (
                          <div><span className="font-medium">ID:</span> {product.id}</div>
                        )}
                        {product.vendor && (
                          <div><span className="font-medium">Vendor:</span> {product.vendor}</div>
                        )}
                        {product.category && (
                          <div><span className="font-medium">Category:</span> {product.category}</div>
                        )}
                        {product.sku && (
                          <div><span className="font-medium">SKU:</span> {product.sku}</div>
                        )}
                        {product.price && (
                          <div><span className="font-medium">Price:</span> ${product.price}</div>
                        )}
                        {product.description && (
                          <div><span className="font-medium">Description:</span> {product.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Raw Data */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      View Raw Product Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40 border">
                      {JSON.stringify(product.raw, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Response Data */}
        {rawData && (
          <div className="space-y-2">
            <h3 className="font-semibold">Raw API Response</h3>
            <details>
              <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                View Full Raw Response
              </summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-60 border">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* No Products Found */}
        {!loading && !error && products.length === 0 && rawData && (
          <div className="text-center py-8 text-gray-500">
            <p>No products found in the response, but API call was successful.</p>
            <p className="text-sm mt-2">Check the raw response data above for details.</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !error && products.length === 0 && !rawData && (
          <div className="text-center py-8 text-gray-500">
            <p>Click the button above to fetch Microsoft products from Pax8 via HaloPSA.</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p><strong>About:</strong> This component tests the HaloPSA Pax8Details endpoint</p>
          <p><strong>Expected:</strong> Microsoft products and licensing information from Pax8</p>
          <p><strong>API Endpoint:</strong> GET /api/halopsa/pax8details → HaloPSA /Pax8Details</p>
        </div>
      </CardContent>
    </Card>
  )
}