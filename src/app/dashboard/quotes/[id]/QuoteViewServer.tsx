import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { PrismaClient } from '@/generated/prisma'
import { DashboardLayout } from '@/components/DashboardLayout'
import { QuoteView } from '@/components/QuoteView'
import Link from 'next/link'
import { Edit, ArrowLeft } from 'lucide-react'
import { authOptions } from '@/lib/auth.config'

const prisma = new PrismaClient()

interface QuoteViewServerProps {
  quoteId: string
}

async function getQuoteData(quoteId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
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
    redirect('/login')
  }

  // Get the quote
  const where = user.role === 'admin' 
    ? { id: quoteId }
    : { id: quoteId, userId: user.id }

  const quote = await prisma.quote.findUnique({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!quote) {
    notFound()
  }

  return quote
}

export default async function QuoteViewServer({ quoteId }: QuoteViewServerProps) {
  const quote = await getQuoteData(quoteId)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/quotes"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quote {quote.quoteNumber || `#${quote.id.slice(0, 8)}`}
              </h1>
            </div>
          </div>
          <Link
            href={`/dashboard/quotes/${quoteId}/edit`}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 border text-gray-900 hover:bg-gray-50 font-medium"
            style={{ borderColor: '#15bef0' }}
          >
            <Edit className="w-4 h-4" />
            <span>Edit Quote</span>
          </Link>
        </div>
        
        <QuoteView quote={{
          ...quote,
          quoteNumber: quote.quoteNumber || undefined,
          customerEmail: quote.customerEmail || undefined,
          customerAddress: quote.customerAddress || undefined,
          customerRegion: quote.customerRegion || undefined,
          contractType: (quote.contractType as 'Managed Services' | 'Co-Managed Services') || undefined,
          discountType: (quote.discountType as 'none' | 'percentage' | 'raw_dollar' | 'margin_override' | 'per_user' | 'override') || undefined,
          discountValue: quote.discountValue || undefined,
          discountedTotal: quote.discountedTotal || undefined,
          estimatedCost: quote.estimatedCost || undefined,
          profitMargin: quote.profitMargin || undefined,
          haloPsaQuoteId: quote.haloPsaQuoteId || undefined,
          notes: quote.notes || undefined,
          clientNotes: quote.clientNotes || undefined,
          originalMonthlyTotal: quote.originalMonthlyTotal ?? undefined,
          // Fix user object type casting
          user: quote.user ? {
            name: quote.user.name,
            email: quote.user.email || 'N/A'
          } : undefined,
          // Cast JSON fields to their expected types
          customerData: quote.customerData as any,
          setupServices: quote.setupServices as any,
          monthlyServices: quote.monthlyServices as any,
          supportDevices: quote.supportDevices as any,
          otherLaborData: quote.otherLaborData as any
        }} />
      </div>
    </DashboardLayout>
  )
}