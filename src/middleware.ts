import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic middleware - rate limiting moved to auth handler
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only run on specific paths if needed
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}