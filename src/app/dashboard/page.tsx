import { Suspense } from 'react'
import DashboardServer from './DashboardServer'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardServer />
    </Suspense>
  )
}