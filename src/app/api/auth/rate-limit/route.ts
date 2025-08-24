import { NextRequest, NextResponse } from 'next/server'
import { loginRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = loginRateLimit.check(request)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }
    
    return NextResponse.json({ success: true, remaining: rateLimitResult.remaining })
  } catch (error) {
    return NextResponse.json(
      { error: 'Rate limit check failed' },
      { status: 500 }
    )
  }
}