'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { SettingsTabs } from '@/components/SettingsTabs'

export default function SettingsPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account, integrations, and system configuration</p>
        </div>

        <SettingsTabs />
      </div>
    </DashboardLayout>
  )
}