import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { PrismaClient } from '@/generated/prisma'
import { DashboardLayout } from '@/components/DashboardLayout'
import { QuoteWizard } from '@/components/QuoteWizard'
import { QuoteProvider } from '@/contexts/QuoteContext'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const prisma = new PrismaClient()

interface EditQuoteServerProps {
  quoteId: string
}

async function getQuoteData(quoteId: string) {
  const session = await getServerSession()
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

export default async function EditQuoteServer({ quoteId }: EditQuoteServerProps) {
  const quote = await getQuoteData(quoteId)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href={`/dashboard/quotes/${quoteId}`}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Quote {quote.quoteNumber || `#${quote.id.slice(0, 8)}`}
            </h1>
            <p className="mt-2 text-gray-600">Customer: {quote.customerName}</p>
          </div>
        </div>
        
        <QuoteProvider initialQuote={quote}>
          <QuoteWizard editMode={true} quoteId={quoteId} />
        </QuoteProvider>
      </div>
    </DashboardLayout>
  )
}