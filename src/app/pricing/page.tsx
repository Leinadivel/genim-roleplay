import { createClient } from '@/lib/supabase/server'
import PricingClient from './pricing-client'

type PricingPageProps = {
  searchParams: Promise<{
    limit?: string
  }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const limitReason =
    params.limit === 'starter' || params.limit === 'weekly'
      ? params.limit
      : null

  return (
    <PricingClient
      isLoggedIn={Boolean(user)}
      limitReason={limitReason}
    />
  )
}