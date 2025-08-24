import { use } from 'react'
import QuoteViewServer from './QuoteViewServer'

interface ViewQuotePageProps {
  params: Promise<{ id: string }>
}

export default function ViewQuotePage({ params }: ViewQuotePageProps) {
  const resolvedParams = use(params)
  return <QuoteViewServer quoteId={resolvedParams.id} />
}