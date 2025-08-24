'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '■' },
    { name: 'New Quote', href: '/dashboard/new-quote', icon: '+' },
    { name: 'View Quotes', href: '/dashboard/quotes', icon: '▤' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚬' }
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-20 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `} style={{ backgroundColor: '#343333' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-600">
            <img 
              src="/dymin.webp" 
              alt="Dymin" 
              className="h-8 w-auto"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = item.href === '/dashboard/quotes' 
                ? pathname.startsWith('/dashboard/quotes')
                : pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-base font-bold rounded-lg transition-colors
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-200 hover:bg-gray-600 hover:text-white'
                    }
                  `}
                  style={isActive ? { backgroundColor: '#15bef0', color: '#343333' } : {}}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3 text-lg w-5 text-center">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-600 p-4">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors"
            >
              <span className="mr-3">↗</span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}