'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HaloTeamCostSync } from '@/components/HaloTeamCostSync'
import { HaloServiceHoursSync } from '@/components/HaloServiceHoursSync'
import { HaloPSAPax8Test } from '@/components/HaloPSAPax8Test'
import { SupportLaborSettings } from '@/components/SupportLaborSettings'
import { PasswordChangeForm } from '@/components/PasswordChangeForm'

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('account')
  const { data: session } = useSession()

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'halopsa', label: 'HaloPSA' },
    { id: 'support-labor', label: 'Support Labor' }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { borderBottomColor: '#15bef0', color: '#0891b2' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'account' && (
        <div className="space-y-6">
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
                    <div className="mt-1 text-sm text-gray-900">{session?.user?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 text-sm text-gray-900">{session?.user?.email}</div>
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

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
            <PasswordChangeForm />
          </div>

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
        </div>
      )}

      {activeTab === 'halopsa' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">HaloPSA Integration</h2>
            <p className="text-gray-600 mb-6">Manage integrations and sync data from HaloPSA</p>
            <div className="space-y-6">
              {/* Team & Agent Cost Sync */}
              <HaloTeamCostSync />
              
              {/* Service Hours Sync */}
              <HaloServiceHoursSync />
              
              {/* Pax8 Integration */}
              <HaloPSAPax8Test />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support-labor' && (
        <SupportLaborSettings />
      )}
    </div>
  )
}