import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@/generated/prisma'
import { authOptions } from '@/lib/auth.config'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long' }, { status: 400 })
    }

    // Check if username already exists (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        NOT: {
          id: (session.user as any).id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Update username
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { username: username.trim() }
    })

    return NextResponse.json({ message: 'Username updated successfully', username: username.trim() })
  } catch (error) {
    console.error('Error updating username:', error)
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 })
  }
}