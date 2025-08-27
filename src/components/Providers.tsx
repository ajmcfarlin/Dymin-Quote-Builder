'use client'

import { SessionProvider } from 'next-auth/react'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        {children}
        <Toaster position="top-right" />
      </LoadingProvider>
    </SessionProvider>
  )
}