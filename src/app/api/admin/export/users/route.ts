import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const { user, admin } = await getGenimAdmin()

  if (!user || !admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let profilesQuery = adminClient
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      account_type,
      role,
      status,
      created_at
    `
    )
    .order('created_at', { ascending: false })

  if (from) {
    profilesQuery = profilesQuery.gte('created_at', new Date(from).toISOString())
  }

  if (to) {
    const toDate = new Date(to)
    toDate.setDate(toDate.getDate() + 1)
    profilesQuery = profilesQuery.lt('created_at', toDate.toISOString())
  }

  const { data: profiles, error } = await profilesQuery
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: subscriptions } = await adminClient
    .from('subscriptions')
    .select('user_id, plan_key, status')

  const { data: memberships } = await adminClient
    .from('company_members')
    .select('user_id, company_id, role, status')

  const { data: companies } = await adminClient
    .from('companies')
    .select('id, name')

  const subMap = new Map(
    (subscriptions ?? []).map((sub) => [sub.user_id, sub])
  )

  const membershipMap = new Map(
    (memberships ?? [])
      .filter((membership) => membership.user_id)
      .map((membership) => [membership.user_id as string, membership])
  )

  const companyMap = new Map(
    (companies ?? []).map((company) => [company.id, company.name])
  )

  const headers = [
    'Full Name',
    'Email',
    'Account Type',
    'Role',
    'Status',
    'Plan',
    'Subscription Status',
    'Company',
    'Company Role',
    'Company Member Status',
    'Created At',
  ]

  const rows = (profiles ?? []).map((profile) => {
    const sub = subMap.get(profile.id)
    const membership = membershipMap.get(profile.id)
    const companyName = membership ? companyMap.get(membership.company_id) : ''

    return [
      profile.full_name,
      profile.email,
      profile.account_type,
      profile.role,
      profile.status,
      sub?.plan_key ?? 'starter',
      sub?.status ?? '',
      companyName ?? '',
      membership?.role ?? '',
      membership?.status ?? '',
      profile.created_at,
    ].map(csvEscape)
  })

  const csv = [headers.map(csvEscape), ...rows]
    .map((row) => row.join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="genim-users.csv"',
    },
  })
}