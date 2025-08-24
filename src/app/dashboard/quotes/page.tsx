import QuotesServerPage from './QuotesServerPage'

interface QuotesPageProps {
  searchParams: {
    page?: string
    search?: string
    limit?: string
  }
}

export default function QuotesPage({ searchParams }: QuotesPageProps) {
  return <QuotesServerPage searchParams={searchParams} />
}