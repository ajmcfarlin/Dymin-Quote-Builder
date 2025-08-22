'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <img 
              src="/dymin.webp" 
              alt="Dymin" 
              className="h-8 w-auto"
            />
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-md text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-110"
            >
              <div className="flex flex-col space-y-1.5">
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}