import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@/generated/prisma'
import { HaloQuoteGenerationRequest, HaloQuoteResponse } from '@/types/savedQuote'

const prisma = new PrismaClient()

// POST /api/quotes/[id]/generate-halo - Generate quote in Halo PSA
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the quote
    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const body: HaloQuoteGenerationRequest = await request.json()

    // TODO: Implement actual Halo PSA integration
    // For now, we'll simulate the process and prepare the data structure

    const haloQuoteData = {
      // Quote header information
      clientName: quote.customerName,
      clientEmail: quote.customerEmail,
      quoteNumber: quote.quoteNumber,
      
      // Contract details
      contractType: quote.contractType,
      contractMonths: quote.contractMonths,
      
      // Line items for setup services
      setupItems: (quote.setupServices as any[]).filter(service => service.isActive).map(service => ({
        description: service.name,
        quantity: 1,
        rate: service.price || 0,
        total: service.price || 0,
        serviceType: 'setup'
      })),
      
      // Monthly recurring items
      monthlyItems: [
        {
          description: 'Tools & Licensing',
          quantity: 1,
          rate: quote.monthlyTotal, // This would be broken down further in a real implementation
          total: quote.monthlyTotal,
          serviceType: 'monthly_recurring'
        }
      ],
      
      // Financial summary
      monthlyTotal: quote.discountedTotal || quote.monthlyTotal,
      setupTotal: quote.setupCosts,
      contractTotal: quote.contractTotal,
      
      // Discount information
      discount: quote.discountType !== 'none' ? {
        type: quote.discountType,
        value: quote.discountValue,
        amount: (quote.monthlyTotal - (quote.discountedTotal || quote.monthlyTotal))
      } : null,
      
      // Additional data for Halo PSA
      notes: quote.notes,
      clientNotes: quote.clientNotes,
      expiresAt: quote.expiresAt
    }

    // Simulate Halo PSA API call
    // In a real implementation, this would make actual API calls to Halo PSA
    const simulateHaloApiCall = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate a mock Halo PSA quote ID
      const haloPsaQuoteId = `HALO-${Date.now()}`
      
      return {
        success: true,
        haloPsaQuoteId,
        quoteUrl: `https://your-halo-instance.com/quotes/${haloPsaQuoteId}`
      }
    }

    const haloResult = await simulateHaloApiCall()

    if (haloResult.success) {
      // Update the quote with Halo PSA reference
      await prisma.quote.update({
        where: { id: params.id },
        data: {
          haloPsaQuoteId: haloResult.haloPsaQuoteId,
          status: body.sendToCustomer ? 'sent' : quote.status,
          sentAt: body.sendToCustomer ? new Date() : quote.sentAt
        }
      })
    }

    const response: HaloQuoteResponse = {
      success: haloResult.success,
      haloPsaQuoteId: haloResult.haloPsaQuoteId,
      quoteUrl: haloResult.quoteUrl,
      error: haloResult.success ? undefined : 'Failed to generate quote in Halo PSA'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating Halo PSA quote:', error)
    
    const response: HaloQuoteResponse = {
      success: false,
      error: 'Internal server error while generating Halo PSA quote'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// GET /api/quotes/[id]/generate-halo - Get Halo PSA quote status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the quote
    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      select: {
        id: true,
        quoteNumber: true,
        haloPsaQuoteId: true,
        status: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const response = {
      hasHaloQuote: !!quote.haloPsaQuoteId,
      haloPsaQuoteId: quote.haloPsaQuoteId,
      status: quote.status,
      // In a real implementation, you might fetch additional status from Halo PSA
      quoteUrl: quote.haloPsaQuoteId ? `https://your-halo-instance.com/quotes/${quote.haloPsaQuoteId}` : null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching Halo PSA quote status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}