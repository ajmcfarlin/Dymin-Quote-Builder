'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HaloTeamCostSync } from '@/components/HaloTeamCostSync'
import { HaloServiceHoursSync } from '@/components/HaloServiceHoursSync'
import { HaloPSAPax8Test } from '@/components/HaloPSAPax8Test'
import { SupportLaborSettings } from '@/components/SupportLaborSettings'
import { PasswordChangeForm } from '@/components/PasswordChangeForm'

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('account')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [templates, setTemplates] = useState([
    {
      id: '1',
      templateId: '12345',
      name: 'Server Setup Template',
      lastSynced: '2 hours ago',
      isActive: true
    },
    {
      id: '2', 
      templateId: '67890',
      name: 'Workstation Deployment',
      lastSynced: '1 day ago',
      isActive: true
    }
  ])
  const [newTemplate, setNewTemplate] = useState({ templateId: '', name: '' })
  const [tools, setTools] = useState([
    {
      id: '1',
      itemId: '456',
      name: 'Microsoft 365 Business Premium',
      price: 24.00,
      lastSynced: '1 hour ago',
      isActive: true
    },
    {
      id: '2',
      itemId: '789',
      name: 'Antivirus Software',
      price: 15.99,
      lastSynced: '3 hours ago',
      isActive: true
    }
  ])
  const [newTool, setNewTool] = useState({ itemId: '', name: '' })
  const { data: session, update: updateSession } = useSession()

  // Update local username when session changes
  React.useEffect(() => {
    if (session?.user) {
      setCurrentUsername((session.user as any)?.username || '')
    }
  }, [session])

  const handleEditClick = (field: string) => {
    setError('')
    setMessage('')
    setEditingField(field)
    if (field === 'username') {
      setTempValues(prev => ({ ...prev, username: currentUsername }))
    }
  }

  const handleSave = async (field: string) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (field === 'username') {
        const response = await fetch('/api/auth/update-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: tempValues.username })
        })

        const data = await response.json()

        if (response.ok) {
          // Update local state immediately for UI
          setCurrentUsername(data.username)
          
          // Try to update the session (this might not always work immediately)
          try {
            await updateSession()
          } catch (sessionError) {
            console.log('Session update failed, but username was saved:', sessionError)
          }
          
          setMessage('Username updated successfully!')
          setEditingField(null)
        } else {
          setError(data.error || 'Failed to update username')
        }
      } else if (field === 'password') {
        // Validation
        if (tempValues.newPassword !== tempValues.confirmPassword) {
          setError('New passwords do not match')
          setLoading(false)
          return
        }

        if (tempValues.newPassword.length < 6) {
          setError('New password must be at least 6 characters long')
          setLoading(false)
          return
        }

        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            currentPassword: tempValues.currentPassword, 
            newPassword: tempValues.newPassword 
          })
        })

        const data = await response.json()

        if (response.ok) {
          setMessage('Password changed successfully!')
          setEditingField(null)
          setTempValues(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }))
        } else {
          setError(data.error || 'Failed to change password')
        }
      }
    } catch (err) {
      setError(`Failed to update ${field}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setError('')
    setMessage('')
    setTempValues({
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleAddTemplate = () => {
    if (!newTemplate.templateId.trim()) {
      setError('Template ID is required')
      return
    }

    // Check if template ID already exists
    if (templates.some(t => t.templateId === newTemplate.templateId.trim())) {
      setError('Template ID already exists')
      return
    }

    const template = {
      id: Date.now().toString(),
      templateId: newTemplate.templateId.trim(),
      name: newTemplate.name.trim() || `Template ${newTemplate.templateId.trim()}`,
      lastSynced: 'Never',
      isActive: true
    }

    setTemplates(prev => [...prev, template])
    setNewTemplate({ templateId: '', name: '' })
    setMessage('Template added successfully!')
    setError('')
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id))
      setMessage('Template deleted successfully!')
    }
  }

  const handleSyncTemplate = async (id: string) => {
    setLoading(true)
    try {
      // TODO: Implement actual HaloPSA sync
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      
      setTemplates(prev => prev.map(t => 
        t.id === id 
          ? { ...t, lastSynced: 'Just now' }
          : t
      ))
      setMessage('Template synced successfully!')
    } catch (err) {
      setError('Failed to sync template')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncAllTemplates = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual HaloPSA sync for all templates
      await new Promise(resolve => setTimeout(resolve, 2000)) // Mock API call
      
      setTemplates(prev => prev.map(t => ({ ...t, lastSynced: 'Just now' })))
      setMessage('All templates synced successfully!')
    } catch (err) {
      setError('Failed to sync templates')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTool = () => {
    if (!newTool.itemId.trim()) {
      setError('Item ID is required')
      return
    }

    // Check if item ID already exists
    if (tools.some(t => t.itemId === newTool.itemId.trim())) {
      setError('Item ID already exists')
      return
    }

    const tool = {
      id: Date.now().toString(),
      itemId: newTool.itemId.trim(),
      name: newTool.name.trim() || `Item ${newTool.itemId.trim()}`,
      price: 0,
      lastSynced: 'Never',
      isActive: true
    }

    setTools(prev => [...prev, tool])
    setNewTool({ itemId: '', name: '' })
    setMessage('Tool/License added successfully!')
    setError('')
  }

  const handleDeleteTool = (id: string) => {
    if (confirm('Are you sure you want to delete this tool/license?')) {
      setTools(prev => prev.filter(t => t.id !== id))
      setMessage('Tool/License deleted successfully!')
    }
  }

  const handleSyncTool = async (id: string) => {
    setLoading(true)
    try {
      // TODO: Implement actual HaloPSA item sync
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      
      setTools(prev => prev.map(t => 
        t.id === id 
          ? { ...t, lastSynced: 'Just now', price: Math.random() * 50 + 10 } // Mock price update
          : t
      ))
      setMessage('Tool/License synced successfully!')
    } catch (err) {
      setError('Failed to sync tool/license')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncAllTools = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual HaloPSA sync for all items
      await new Promise(resolve => setTimeout(resolve, 2000)) // Mock API call
      
      setTools(prev => prev.map(t => ({ 
        ...t, 
        lastSynced: 'Just now',
        price: Math.random() * 50 + 10 // Mock price updates
      })))
      setMessage('All tools/licenses synced successfully!')
    } catch (err) {
      setError('Failed to sync tools/licenses')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'templates', label: 'Templates' },
    { id: 'tools', label: 'Tools' },
    { id: 'support-devices', label: 'Support Devices' },
    { id: 'labor-rates', label: 'Labor Rates' }
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
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Information</CardTitle>
            <p className="text-gray-600 text-sm">Manage your account details and security</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            {/* Role */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  (session?.user as any)?.role === 'ADMIN' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(session?.user as any)?.role || 'USER'}
                </span>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                {editingField === 'username' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempValues.username}
                      onChange={(e) => setTempValues(prev => ({ ...prev, username: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave('username')}
                      disabled={loading}
                      className={`px-3 py-1 text-sm rounded ${
                        loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-900">{currentUsername || 'N/A'}</div>
                )}
              </div>
              {editingField !== 'username' && (
                <button 
                  onClick={() => handleEditClick('username')}
                  className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Password */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                {editingField === 'password' ? (
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={tempValues.currentPassword}
                      onChange={(e) => setTempValues(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={tempValues.newPassword}
                      onChange={(e) => setTempValues(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={tempValues.confirmPassword}
                      onChange={(e) => setTempValues(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave('password')}
                        disabled={loading}
                        className={`px-3 py-1 text-sm rounded ${
                          loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-900">••••••••</div>
                )}
              </div>
              {editingField !== 'password' && (
                <button 
                  onClick={() => handleEditClick('password')}
                  className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">HaloPSA Template Management</h2>
            <p className="text-gray-600 mb-6">Configure HaloPSA ticket template IDs to fetch and use as setup services</p>
            
            {/* Add New Template */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add Template</CardTitle>
                <p className="text-sm text-gray-600">Enter a HaloPSA ticket template ID to add to your available templates</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template ID
                    </label>
                    <input
                      type="text"
                      value={newTemplate.templateId}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, templateId: e.target.value }))}
                      placeholder="Enter HaloPSA template ID (e.g., 12345)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Custom name for this template"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleAddTemplate}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Adding...' : 'Add Template'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configured Templates</CardTitle>
                <p className="text-sm text-gray-600">Manage your HaloPSA ticket templates</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{template.name}</span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              ID: {template.templateId}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Last synced: {template.lastSynced}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleSyncTemplate(template.id)}
                            disabled={loading}
                            className={`px-3 py-1 text-sm font-medium ${
                              loading
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            {loading ? 'Syncing...' : 'Sync'}
                          </button>
                          <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700">
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">No templates configured yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add a HaloPSA template ID above to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sync All Button */}
            {templates.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Templates will automatically sync with HaloPSA to fetch latest ticket details
                </div>
                <button 
                  onClick={handleSyncAllTemplates}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {loading ? 'Syncing All...' : 'Sync All Templates'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools & Licensing Management</h2>
            <p className="text-gray-600 mb-6">Configure HaloPSA item IDs to fetch and use as tools & licensing in quotes</p>
            
            {/* Add New Tool/License */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add Tool/License</CardTitle>
                <p className="text-sm text-gray-600">Enter a HaloPSA item ID to add to your available tools & licensing</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item ID
                    </label>
                    <input
                      type="text"
                      value={newTool.itemId}
                      onChange={(e) => setNewTool(prev => ({ ...prev, itemId: e.target.value }))}
                      placeholder="Enter HaloPSA item ID (e.g., 456)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTool.name}
                      onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Custom name for this item"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleAddTool}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Adding...' : 'Add Tool/License'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools & Licenses List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configured Tools & Licenses</CardTitle>
                <p className="text-sm text-gray-600">Manage your HaloPSA items for quote generation</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tools.length > 0 ? (
                    tools.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{tool.name}</span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              ID: {tool.itemId}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Price: ${tool.price.toFixed(2)}</span>
                            <span>Last synced: {tool.lastSynced}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleSyncTool(tool.id)}
                            disabled={loading}
                            className={`px-3 py-1 text-sm font-medium ${
                              loading
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            {loading ? 'Syncing...' : 'Sync'}
                          </button>
                          <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700">
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTool(tool.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                      </svg>
                      <p className="text-sm">No tools/licenses configured yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add a HaloPSA item ID above to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sync All Button */}
            {tools.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Items will automatically sync with HaloPSA to fetch latest pricing and details
                </div>
                <button 
                  onClick={handleSyncAllTools}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {loading ? 'Syncing All...' : 'Sync All Tools/Licenses'}
                </button>
              </div>
            )}

            {/* Legacy Integrations Section */}
            <div className="border-t pt-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legacy Integrations</h3>
              <p className="text-gray-600 mb-6">Existing HaloPSA integrations and sync tools</p>
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
        </div>
      )}

      {activeTab === 'support-devices' && (
        <SupportLaborSettings />
      )}

      {activeTab === 'labor-rates' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Labor Rates</h2>
            <p className="text-gray-600 mb-6">Configure labor rates and pricing for different skill levels</p>
            
            {/* Labor Rate Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Labor Rate Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Skill Level</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-700">Cost Rate</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-700">Business Hours Price</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-700">After Hours Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-3 font-medium">Level 1</td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="22.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="155.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="155.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-3 px-3 font-medium">Level 2</td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="37.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="185.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="275.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-3 font-medium">Level 3</td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="46.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="275.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input type="number" step="0.01" defaultValue="375.00" className="w-20 px-2 py-1 text-center border border-gray-300 rounded" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Labor Rates
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}