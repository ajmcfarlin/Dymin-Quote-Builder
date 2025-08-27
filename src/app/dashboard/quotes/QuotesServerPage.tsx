import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@/generated/prisma'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuotesTable } from './QuotesTable'
import { QuotesSearch } from './QuotesSearch'
import { QuotesPagination } from './QuotesPagination'
import Link from 'next/link'
import { authOptions } from '@/lib/auth.config'

const prisma = new PrismaClient()

interface QuotesServerPageProps {
  searchParams: {
    page?: string
    search?: string
    limit?: string
  }
}

async function getQuotesData(searchParams: QuotesServerPageProps['searchParams']) {
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
    throw new Error('User not found')
  }

  const page = parseInt(searchParams.page || '1')
  const limit = Math.min(parseInt(searchParams.limit || '20'), 50)
  const search = searchParams.search

  const skip = (page - 1) * limit

  // Build where clause - show all quotes for all authenticated users
  const where: any = {}
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
        contractMonths: true,
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

  return {
    quotes: quotes.map(quote => ({
      ...quote,
      quoteNumber: quote.quoteNumber || undefined, // Convert null to undefined
      user: quote.user ? {
        name: quote.user.name,
        email: quote.user.email || 'N/A' // Convert null to fallback string
      } : undefined
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export default async function QuotesServerPage({ searchParams }: QuotesServerPageProps) {
  const { quotes, total, page, limit, totalPages } = await getQuotesData(searchParams)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
            <p className="mt-2 text-gray-600">View and manage all quotes</p>
          </div>
          <Link
            href="/dashboard/new-quote"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors border"
            style={{ borderColor: '#15bef0' }}
          >
            New Quote
          </Link>
        </div>

        <QuotesSearch />

        <Card>
          <CardHeader>
            <CardTitle>All Quotes ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <QuotesTable quotes={quotes} />
            
            <QuotesPagination 
              currentPage={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}