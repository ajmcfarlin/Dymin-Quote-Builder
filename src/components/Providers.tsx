'use client'

import { SessionProvider } from 'next-auth/react'
import { LoadingProvider } from '@/contexts/LoadingContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </SessionProvider>
  )
}