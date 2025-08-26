import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@/generated/prisma'
import { CreateQuoteRequest, QuotesListResponse, QuoteListItem } from '@/types/savedQuote'
import { authOptions } from '@/lib/auth.config'

const prisma = new PrismaClient()

// GET /api/quotes - List all quotes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database - try username first, fallback to email if needed
    const username = (session.user as any).username
    console.log('Session user:', { username, email: session.user.email })
    
    let user
    if (username) {
      user = await prisma.user.findUnique({
        where: { username }
      })
    } else if (session.user.email) {
      // Fallback: find user by email if it matches username
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { username: session.user.email },
            { email: session.user.email }
          ]
        }
      })
    }
    
    console.log('Found user:', user ? { id: user.id, username: user.username, role: user.role } : 'null')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50) // Cap at 50
    const search = url.searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause - show all quotes for admin users, only own quotes for others
    const where: any = user.role === 'admin' ? {} : { userId: user.id }
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { quoteNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get quotes with pagination
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        select: {
          id: true,
          quoteNumber: true,
          customerName: true,
          monthlyTotal: true,
          contractTotal: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.quote.count({ where })
    ])

    // Transform database result to match QuoteListItem interface
    const transformedQuotes: QuoteListItem[] = quotes.map(quote => ({
      ...quote,
      quoteNumber: quote.quoteNumber || undefined,
      user: quote.user ? {
        name: quote.user.name,
        email: quote.user.email || 'N/A'
      } : undefined
    }))

    const response: QuotesListResponse = {
      quotes: transformedQuotes,
      total,
      page,
      limit
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database - try username first, fallback to email if needed
    const username = (session.user as any).username
    console.log('Session user:', { username, email: session.user.email })
    
    let user
    if (username) {
      user = await prisma.user.findUnique({
        where: { username }
      })
    } else if (session.user.email) {
      // Fallback: find user by email if it matches username
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { username: session.user.email },
            { email: session.user.email }
          ]
        }
      })
    }
    
    console.log('Found user:', user ? { id: user.id, username: user.username, role: user.role } : 'null')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body: CreateQuoteRequest = await request.json()
    console.log('Quote creation payload:', JSON.stringify(body, null, 2))

    // Generate quote number (format: Q-YYYYMMDD-XXX)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    
    // Count quotes created today to generate sequence number
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    
    const todayQuotesCount = await prisma.quote.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })
    
    const sequenceNumber = (todayQuotesCount + 1).toString().padStart(3, '0')
    const quoteNumber = `Q-${dateStr}-${sequenceNumber}`

    // Calculate estimated cost and profit margin
    const estimatedCost = body.monthlyTotal * 0.35 // 35% cost estimate
    const profitMargin = ((body.monthlyTotal - estimatedCost) / body.monthlyTotal) * 100

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        userId: user.id,
        quoteNumber,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerAddress: body.customerData.address,
        customerRegion: body.customerData.region,
        contractType: body.customerData.contractType,
        contractMonths: body.customerData.contractMonths,
        customerData: body.customerData as any,
        setupServices: body.setupServices as any,
        monthlyServices: body.monthlyServices as any,
        supportDevices: body.supportDevices as any,
        otherLaborData: body.otherLaborData as any,
        monthlyTotal: body.monthlyTotal,
        originalMonthlyTotal: body.originalMonthlyTotal,
        setupCosts: body.setupCosts,
        upfrontPayment: body.upfrontPayment,
        contractTotal: body.contractTotal,
        discountType: body.discountType,
        discountValue: body.discountValue,
        discountedTotal: body.discountedTotal,
        estimatedCost,
        profitMargin,
        notes: body.notes
      }
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}