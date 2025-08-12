'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HaloTeamCostSync } from '@/components/HaloTeamCostSync'
import { HaloServiceHoursSync } from '@/components/HaloServiceHoursSync'
import { HaloPSAPax8Test } from '@/components/HaloPSAPax8Test'

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
          <p className="mt-2 text-gray-600">Manage integrations and sync data from external systems</p>
        </div>

        <div className="space-y-8">
          {/* HaloPSA Integration Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">HaloPSA Integration</h2>
            <div className="space-y-6">
              {/* Team & Agent Cost Sync */}
              <HaloTeamCostSync />
              
              {/* Service Hours Sync */}
              <HaloServiceHoursSync />
              
              {/* Pax8 Integration */}
              <HaloPSAPax8Test />
            </div>
          </div>

          {/* System Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Database Connected</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Connected to Neon PostgreSQL
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quote Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Active</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Using database rates when available
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">HaloPSA Connected</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last sync: Ready for sync
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Clear Cache
                    </button>
                    <div className="text-xs text-gray-500">
                      Clear cached API responses
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <div className="mt-1 text-sm text-gray-900">{session.user?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 text-sm text-gray-900">{session.user?.email}</div>
                  </div>
                  <div className="pt-4 border-t">
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}