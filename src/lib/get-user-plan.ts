import { createClient } from '@/lib/supabase/server'

export async function getUserPlan(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan_key, status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data || data.status !== 'active') {
    return 'starter'
  }

  return data.plan_key
}