import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership?.company_id) {
    return NextResponse.json({ team: null })
  }

  const admin = createAdminClient()

  const [{ data: company }, { data: subscription }] = await Promise.all([
    admin
      .from('companies')
      .select('name')
      .eq('id', membership.company_id)
      .maybeSingle(),
    admin
      .from('company_subscriptions')
      .select('status, current_period_end')
      .eq('company_id', membership.company_id)
      .maybeSingle(),
  ])

  return NextResponse.json({
    team: {
      companyName: company?.name ?? null,
      role: membership.role ?? null,
      status: membership.status ?? null,
      subscriptionStatus: subscription?.status ?? null,
      currentPeriodEnd: subscription?.current_period_end ?? null,
    },
  })
}