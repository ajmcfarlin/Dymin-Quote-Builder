import { use } from 'react'
import EditQuoteServer from './EditQuoteServer'

interface EditQuotePageProps {
  params: Promise<{ id: string }>
}

export default function EditQuotePage({ params }: EditQuotePageProps) {
  const resolvedParams = use(params)
  return <EditQuoteServer quoteId={resolvedParams.id} />
}