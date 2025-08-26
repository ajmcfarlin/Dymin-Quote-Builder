import { NextRequest } from 'next/server'

interface RateLimitOptions {
  max: number
  windowMs: number
  keyGenerator?: (request: NextRequest) => string
}

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

export function rateLimit(options: RateLimitOptions) {
  const { max, windowMs, keyGenerator } = options

  return {
    check: (request: NextRequest): { success: boolean; remaining?: number } => {
      const key = keyGenerator ? keyGenerator(request) : getDefaultKey(request)
      const now = Date.now()
      
      // Clean up expired entries
      const cutoff = now - windowMs
      for (const [k, v] of rateLimitMap.entries()) {
        if (v.timestamp < cutoff) {
          rateLimitMap.delete(k)
        }
      }
      
      const current = rateLimitMap.get(key)
      
      if (!current || current.timestamp < cutoff) {
        // First request or expired window
        rateLimitMap.set(key, { count: 1, timestamp: now })
        return { success: true, remaining: max - 1 }
      }
      
      if (current.count >= max) {
        // Rate limit exceeded
        return { success: false }
      }
      
      // Increment counter
      current.count++
      return { success: true, remaining: max - current.count }
    }
  }
}

function getDefaultKey(request: NextRequest): string {
  // Use IP address as default key
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

// Create rate limiters for different endpoints
export const loginRateLimit = rateLimit({
  max: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
})

export const apiRateLimit = rateLimit({
  max: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // 15 minutes
})