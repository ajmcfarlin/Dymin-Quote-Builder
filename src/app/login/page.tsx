'use client'

import React, { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#343333' }}>
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null // Will redirect via useEffect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check rate limit first
      const rateLimitCheck = await fetch('/api/auth/rate-limit', { method: 'POST' })
      if (rateLimitCheck.status === 429) {
        const rateLimitError = await rateLimitCheck.json()
        setError(rateLimitError.error)
        return
      }

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#343333' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mb-2 relative">
            <div className="logo-container relative inline-block">
              <Image
                src="/dymin.webp"
                alt="Dymin Logo"
                width={200}
                height={80}
                className="relative z-10 logo-main"
              />
              {/* Glow effects positioned over power button */}
              <div className="absolute logo-glow-1"></div>
              <div className="absolute logo-glow-2"></div>
              <div className="absolute logo-glow-3"></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .logo-container {
            filter: drop-shadow(0 0 30px rgba(21, 190, 240, 0.6));
          }
          
          .logo-main {
            animation: logoFloat 3s ease-in-out infinite alternate;
          }
          
          .logo-glow-1 {
            background: radial-gradient(circle at center, rgba(21, 190, 240, 0.95) 0%, rgba(21, 190, 240, 0.7) 30%, transparent 60%);
            animation: powerPulse 5s ease-in-out infinite;
            border-radius: 50%;
            --base-scale: 1.3;
            width: 30px;
            height: 30px;
            top: 45%;
            left: 10%;
            transform: translate(-50%, -50%) scale(var(--base-scale, 1));
          }
          
          .logo-glow-2 {
            background: radial-gradient(circle at center, rgba(21, 190, 240, 0.4) 0%, rgba(21, 190, 240, 0.2) 50%, transparent 70%);
            animation: powerPulse 5s ease-in-out infinite;
            border-radius: 50%;
            --base-scale: 1.7;
            animation-delay: 0.1s;
            width: 40px;
            height: 40px;
            top: 45%;
            left: 10%;
            transform: translate(-50%, -50%) scale(var(--base-scale, 1));
          }
          
          .logo-glow-3 {
            background: radial-gradient(circle at center, rgba(21, 190, 240, 0.2) 0%, rgba(21, 190, 240, 0.1) 40%, transparent 80%);
            animation: powerPulse 5s ease-in-out infinite;
            border-radius: 50%;
            --base-scale: 2.5;
            animation-delay: 0.2s;
            width: 60px;
            height: 60px;
            top: 45%;
            left: 10%;
            transform: translate(-50%, -50%) scale(var(--base-scale, 1));
          }
          
          @keyframes logoFloat {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-10px); }
          }
          
          @keyframes powerPulse {
            0%, 100% { 
              opacity: 0.4; 
              transform: translate(-50%, -50%) scale(var(--base-scale, 1)); 
            }
            50% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(calc(var(--base-scale, 1) * 1.2)); 
            }
          }
        `}</style>

        {/* Clean form without glow effects */}
        <div className="px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded backdrop-blur-sm">
                {error}
              </div>
            )}

            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-opacity duration-200"
              style={{ backgroundColor: '#15bef0' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}