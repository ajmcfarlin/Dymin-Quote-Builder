import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@/generated/prisma'
import { UpdateQuoteRequest } from '@/types/savedQuote'
import { authOptions } from '@/lib/auth.config'

const prisma = new PrismaClient()

// GET /api/quotes/[id] - Get a specific quote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const username = (session.user as any).username
    let user
    if (username) {
      user = await prisma.user.findUnique({
        where: { username }
      })
    } else if (session.user.email) {
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { username: session.user.email },
            { email: session.user.email }
          ]
        }
      })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/quotes/[id] - Update a specific quote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const username = (session.user as any).username
    let user
    if (username) {
      user = await prisma.user.findUnique({
        where: { username }
      })
    } else if (session.user.email) {
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { username: session.user.email },
            { email: session.user.email }
          ]
        }
      })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if quote exists and belongs to user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const body: UpdateQuoteRequest = await request.json()

    // Calculate updated estimated cost and profit margin if financial data changed
    let estimatedCost = existingQuote.estimatedCost
    let profitMargin = existingQuote.profitMargin

    if (body.monthlyTotal !== undefined) {
      estimatedCost = body.monthlyTotal * 0.35 // 35% cost estimate
      profitMargin = ((body.monthlyTotal - estimatedCost) / body.monthlyTotal) * 100
    }

    // Update the quote
    const updateData: any = {}
    
    // Only update fields that are provided
    if (body.customerName !== undefined) updateData.customerName = body.customerName
    if (body.customerEmail !== undefined) updateData.customerEmail = body.customerEmail
    if (body.customerData !== undefined) {
      updateData.customerData = body.customerData
      updateData.customerAddress = body.customerData.address
      updateData.customerRegion = body.customerData.region
      updateData.contractType = body.customerData.contractType
      updateData.contractMonths = body.customerData.contractMonths
    }
    if (body.setupServices !== undefined) updateData.setupServices = body.setupServices
    if (body.monthlyServices !== undefined) updateData.monthlyServices = body.monthlyServices
    if (body.supportDevices !== undefined) updateData.supportDevices = body.supportDevices
    if (body.otherLaborData !== undefined) updateData.otherLaborData = body.otherLaborData
    if (body.monthlyTotal !== undefined) updateData.monthlyTotal = body.monthlyTotal
    if (body.setupCosts !== undefined) updateData.setupCosts = body.setupCosts
    if (body.upfrontPayment !== undefined) updateData.upfrontPayment = body.upfrontPayment
    if (body.contractTotal !== undefined) updateData.contractTotal = body.contractTotal
    if (body.discountType !== undefined) updateData.discountType = body.discountType
    if (body.discountValue !== undefined) updateData.discountValue = body.discountValue
    if (body.discountedTotal !== undefined) updateData.discountedTotal = body.discountedTotal
    if (body.notes !== undefined) updateData.notes = body.notes
    
    // Update calculated fields
    if (estimatedCost !== existingQuote.estimatedCost) updateData.estimatedCost = estimatedCost
    if (profitMargin !== existingQuote.profitMargin) updateData.profitMargin = profitMargin

    // Increment version for any significant update
    const hasSignificantUpdate = Object.keys(updateData).some(key => key !== 'notes')
    
    if (hasSignificantUpdate) {
      updateData.version = existingQuote.version + 1
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    return NextResponse.json(updatedQuote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/quotes/[id] - Delete a specific quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const username = (session.user as any).username
    let user
    if (username) {
      user = await prisma.user.findUnique({
        where: { username }
      })
    } else if (session.user.email) {
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { username: session.user.email },
            { email: session.user.email }
          ]
        }
      })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if quote exists and belongs to user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }


    await prisma.quote.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Quote deleted successfully' })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}