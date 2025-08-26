import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@/generated/prisma'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authOptions } from '@/lib/auth.config'

const prisma = new PrismaClient()

async function getDashboardStats() {
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

  // Build where clause - show all quotes for admin users, only own quotes for others
  const whereClause = user.role === 'admin' ? {} : { userId: user.id }

  // Get current month and previous month dates
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Calculate statistics
  const [
    totalQuotes,
    currentMonthQuotes,
    totalValue,
    currentMonthValue,
    previousMonthValue,
    recentQuotes
  ] = await Promise.all([
    // Total quotes count
    prisma.quote.count({
      where: whereClause
    }),
    
    // Current month quotes count
    prisma.quote.count({
      where: {
        ...whereClause,
        createdAt: { gte: currentMonthStart }
      }
    }),
    
    // Total value (sum of all contract totals)
    prisma.quote.aggregate({
      where: whereClause,
      _sum: {
        contractTotal: true
      }
    }),
    
    // Current month value
    prisma.quote.aggregate({
      where: {
        ...whereClause,
        createdAt: { gte: currentMonthStart }
      },
      _sum: {
        contractTotal: true
      }
    }),
    
    // Previous month value for comparison
    prisma.quote.aggregate({
      where: {
        ...whereClause,
        createdAt: { 
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      },
      _sum: {
        contractTotal: true
      }
    }),
    
    // Recent quotes (last 10)
    prisma.quote.findMany({
      where: whereClause,
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
            name: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    })
  ])

  // Calculate month-over-month changes
  const quotesThisMonth = currentMonthQuotes
  const valueThisMonth = currentMonthValue._sum.contractTotal || 0
  const valuePreviousMonth = previousMonthValue._sum.contractTotal || 0
  const valueChange = valueThisMonth - valuePreviousMonth

  return {
    user,
    totalQuotes: totalQuotes,
    quotesThisMonth: quotesThisMonth,
    totalValue: totalValue._sum.contractTotal || 0,
    valueThisMonth: valueThisMonth,
    valueChange: valueChange,
    recentActivity: recentQuotes.map(quote => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      customerName: quote.customerName,
      monthlyTotal: quote.monthlyTotal,
      contractTotal: quote.contractTotal,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      userName: quote.user?.name || 'Unknown'
    }))
  }
}

export default async function DashboardServer() {
  const stats = await getDashboardStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {stats.user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalQuotes || 0}</div>
              <p className="text-sm text-gray-500">
                {stats.quotesThisMonth ? `+${stats.quotesThisMonth} this month` : 'No quotes this month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalValue || 0)}</div>
              <p className="text-sm text-gray-500">
                {stats.valueChange ? (
                  stats.valueChange >= 0 ? 
                    `+${formatCurrency(stats.valueChange)} this month` : 
                    `${formatCurrency(stats.valueChange)} this month`
                ) : 'No change this month'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/dashboard/new-quote"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  style={{ borderColor: '#15bef0' }}
                >
                  <div className="font-medium text-gray-900">Create New Quote</div>
                  <div className="text-sm text-gray-600">Start a new managed services quote</div>
                </a>
                <a
                  href="/dashboard/quotes"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">View All Quotes</div>
                  <div className="text-sm text-gray-600">Browse and manage existing quotes</div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity?.length ? (
                  stats.recentActivity.map((activity) => {
                    const wasUpdated = activity.updatedAt.getTime() > activity.createdAt.getTime() + 60000 // 1 minute buffer
                    const displayTime = wasUpdated ? activity.updatedAt : activity.createdAt
                    const action = wasUpdated ? 'updated' : 'created'
                    
                    return (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            <a 
                              href={`/dashboard/quotes/${activity.id}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {activity.quoteNumber || `Quote for ${activity.customerName}`} {action}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(activity.contractTotal)} • {formatRelativeTime(displayTime)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}