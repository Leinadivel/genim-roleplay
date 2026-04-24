import { createClient } from '@/lib/supabase/server'
import PricingClient from './pricing-client'

export default async function PricingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <PricingClient isLoggedIn={Boolean(user)} />
}