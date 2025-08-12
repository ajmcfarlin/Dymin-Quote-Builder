import React from 'react'

// Global loading bar component
export function LoadingBar({ isLoading }: { isLoading: boolean }) {
  return (
    <div className={`fixed top-0 left-0 right-0 h-1 bg-blue-600 transition-all duration-300 z-50 ${
      isLoading ? 'animate-pulse opacity-100' : 'opacity-0'
    }`}>
      <div className="h-full bg-blue-400 animate-pulse"></div>
    </div>
  )
}

// Skeleton card for loading states
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse border rounded-lg p-4 ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  )
}

// Skeleton for table rows
export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-200">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/5"></div>
          <div className="h-4 bg-gray-300 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  )
}

// Skeleton for form inputs
export function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-4">
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/5 mb-2"></div>
        <div className="h-24 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  )
}

// Skeleton for stats/metrics
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse border rounded-lg p-4">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  )
}

// Loading spinner for buttons
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
  )
}

// Pulsing border frame
export function PulsingFrame({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {
  return (
    <div className={`rounded-lg transition-all duration-300 ${
      isLoading ? 'border-2 border-blue-300 animate-pulse' : 'border border-gray-200'
    }`}>
      {children}
    </div>
  )
}