import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

export async function POST(request: Request) {
  const { user, admin } = await getGenimAdmin()

  if (!user || !admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const companyId = String(formData.get('companyId') || '').trim()

  if (!companyId) {
    return NextResponse.json({ error: 'companyId required' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const now = new Date()
  const endsAt = new Date(now)
  endsAt.setDate(endsAt.getDate() + 7)

  const { error } = await adminClient
    .from('company_subscriptions')
    .upsert(
      {
        company_id: companyId,
        plan_name: '7_day_pilot',
        status: 'active',
        seat_limit: 3,
        current_period_start: now.toISOString(),
        current_period_end: endsAt.toISOString(),
        amount_due: 0,
        currency: 'usd',
        updated_at: now.toISOString(),
      },
      {
        onConflict: 'company_id',
      }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  redirect(`/admin/users/companies/${companyId}?pilot=granted`)
}