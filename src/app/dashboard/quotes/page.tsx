import QuotesServerPage from './QuotesServerPage'

interface QuotesPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    limit?: string
  }>
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const resolvedSearchParams = await searchParams
  return <QuotesServerPage searchParams={resolvedSearchParams} />
}