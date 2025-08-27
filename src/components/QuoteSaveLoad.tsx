'use client'

import React, { useState } from 'react'
import { Save, Send, ExternalLink } from 'lucide-react'
import { QuoteAPI, stateToCreateQuoteRequest } from '@/lib/quoteApi'
import { SavedQuote } from '@/types/savedQuote'
import { toast } from 'sonner'

interface QuoteSaveLoadProps {
  currentQuoteId?: string
  quoteState: {
    customer: any
    setupServices: any[]
    monthlyServices: any
    supportDevices: any[]
    otherLaborData: any
    upfrontPayment: number
    calculations?: any
  }
  onQuoteLoaded?: (quote: SavedQuote) => void
  onQuoteSaved?: (quote: SavedQuote) => void
}

export function QuoteSaveLoad({ 
  currentQuoteId, 
  quoteState, 
  onQuoteLoaded, 
  onQuoteSaved 
}: QuoteSaveLoadProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingHalo, setIsGeneratingHalo] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [haloStatus, setHaloStatus] = useState<string>('')

  const handleSave = async () => {
    if (!quoteState.customer.companyName.trim()) {
      toast.error('Please enter a company name before saving.')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const request = stateToCreateQuoteRequest(quoteState)
      
      let savedQuote: SavedQuote
      if (currentQuoteId) {
        // Update existing quote
        savedQuote = await QuoteAPI.updateQuote({
          id: currentQuoteId,
          ...request
        })
      } else {
        // Create new quote
        savedQuote = await QuoteAPI.createQuote(request)
      }
      
      setSaveStatus('success')
      onQuoteSaved?.(savedQuote)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to save quote:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateHalo = async () => {
    if (!currentQuoteId) {
      toast.error('Please save the quote first before generating in Halo PSA.')
      return
    }

    setIsGeneratingHalo(true)
    setHaloStatus('')

    try {
      const result = await QuoteAPI.generateHaloQuote(currentQuoteId, {
        quoteId: currentQuoteId,
        generateInvoice: false,
        sendToCustomer: false
      })

      if (result.success) {
        setHaloStatus(`✅ Generated in Halo PSA: ${result.haloPsaQuoteId}`)
        // Open Halo PSA quote in new tab if URL is provided
        if (result.quoteUrl) {
          window.open(result.quoteUrl, '_blank')
        }
      } else {
        setHaloStatus(`❌ Failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to generate Halo PSA quote:', error)
      setHaloStatus(`❌ Error generating Halo PSA quote`)
    } finally {
      setIsGeneratingHalo(false)
      // Clear status after 10 seconds
      setTimeout(() => setHaloStatus(''), 10000)
    }
  }


  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          isSaving
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Save size={16} />
        {isSaving ? 'Saving...' : currentQuoteId ? 'Update Quote' : 'Save Quote'}
      </button>


      {/* Generate Halo PSA Quote Button */}
      {currentQuoteId && (
        <button
          onClick={handleGenerateHalo}
          disabled={isGeneratingHalo}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isGeneratingHalo
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <ExternalLink size={16} />
          {isGeneratingHalo ? 'Generating...' : 'Generate in Halo PSA'}
        </button>
      )}

      {/* Status Messages */}
      <div className="flex flex-col gap-1">
        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="text-green-600 text-sm font-medium">
            ✅ Quote saved successfully!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="text-red-600 text-sm font-medium">
            ❌ Failed to save quote. Please try again.
          </div>
        )}

        {/* Halo Status */}
        {haloStatus && (
          <div className="text-sm font-medium">
            {haloStatus}
          </div>
        )}
      </div>
    </div>
  )
}