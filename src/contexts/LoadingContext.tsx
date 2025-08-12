'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { LoadingBar } from '@/components/ui/loading'

interface LoadingContextType {
  isLoading: boolean
  startLoading: (label?: string) => void
  stopLoading: () => void
  loadingLabel: string
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')

  const startLoading = useCallback((label = 'Loading...') => {
    setIsLoading(true)
    setLoadingLabel(label)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingLabel('')
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, loadingLabel }}>
      <LoadingBar isLoading={isLoading} />
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Hook for API calls with automatic loading states
export function useApiCall() {
  const { startLoading, stopLoading } = useLoading()
  
  const apiCall = useCallback(async <T>(
    fetchFn: () => Promise<T>, 
    loadingMessage?: string
  ): Promise<T> => {
    try {
      startLoading(loadingMessage)
      const result = await fetchFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])
  
  return { apiCall }
}