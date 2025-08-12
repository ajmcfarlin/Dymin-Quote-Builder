'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
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
              {/* Glow effects */}
              <div className="absolute inset-0 logo-glow-1"></div>
              <div className="absolute inset-0 logo-glow-2"></div>
              <div className="absolute inset-0 logo-glow-3"></div>
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
            background: radial-gradient(ellipse at center, rgba(21, 190, 240, 0.8) 0%, transparent 60%);
            animation: pulse1 1.5s ease-in-out infinite;
            border-radius: 50%;
            transform: scale(1.3);
          }
          
          .logo-glow-2 {
            background: radial-gradient(ellipse at center, rgba(21, 190, 240, 0.6) 0%, transparent 50%);
            animation: pulse2 2s ease-in-out infinite;
            border-radius: 50%;
            transform: scale(1.7);
          }
          
          .logo-glow-3 {
            background: radial-gradient(ellipse at center, rgba(21, 190, 240, 0.4) 0%, transparent 70%);
            animation: pulse3 2.5s ease-in-out infinite;
            border-radius: 50%;
            transform: scale(2.5);
          }
          
          @keyframes logoFloat {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-10px); }
          }
          
          @keyframes pulse1 {
            0%, 100% { opacity: 0.8; transform: scale(1.3); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          
          @keyframes pulse2 {
            0%, 100% { opacity: 0.6; transform: scale(1.7); }
            50% { opacity: 0.9; transform: scale(1.9); }
          }
          
          @keyframes pulse3 {
            0%, 100% { opacity: 0.4; transform: scale(2.5); }
            50% { opacity: 0.7; transform: scale(2.8); }
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Demo credentials: admin@dymin.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}