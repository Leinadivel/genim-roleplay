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
  const q = searchParams.get('q')?.trim() || ''

  let companiesQuery = adminClient
    .from('companies')
    .select('id, name, slug, team_size, created_at')
    .order('created_at', { ascending: false })

  if (q) {
    companiesQuery = companiesQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
  }

  if (from) {
    companiesQuery = companiesQuery.gte(
      'created_at',
      new Date(from).toISOString()
    )
  }

  if (to) {
    const toDate = new Date(to)
    toDate.setDate(toDate.getDate() + 1)
    companiesQuery = companiesQuery.lt('created_at', toDate.toISOString())
  }

  const { data: companies, error } = await companiesQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: memberships } = await adminClient
    .from('company_members')
    .select('company_id, user_id, email, role, status')

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, email, full_name')

  const { data: companySubs } = await adminClient
    .from('company_subscriptions')
    .select(
      'company_id, status, seat_limit, amount_due, currency, current_period_end'
    )

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const subMap = new Map(
    (companySubs ?? []).map((sub) => [sub.company_id, sub])
  )

  const headers = [
    'Company Name',
    'Slug',
    'Team Size',
    'Owner Emails',
    'Manager Emails',
    'Admin Emails',
    'Active Members',
    'Subscription Status',
    'Seat Limit',
    'Amount Due',
    'Currency',
    'Current Period End',
    'Created At',
  ]

  const getMemberEmail = (member: {
    user_id: string | null
    email: string | null
  }) => {
    const profile = member.user_id ? profileMap.get(member.user_id) : null
    return member.email || profile?.email || ''
  }

  const rows = (companies ?? []).map((company) => {
    const companyMembers = (memberships ?? []).filter(
      (member) => member.company_id === company.id
    )

    const owners = companyMembers
      .filter((member) => member.role === 'owner')
      .map(getMemberEmail)
      .filter(Boolean)
      .join('; ')

    const managers = companyMembers
      .filter((member) => member.role === 'manager')
      .map(getMemberEmail)
      .filter(Boolean)
      .join('; ')

    const admins = companyMembers
      .filter((member) => member.role === 'admin')
      .map(getMemberEmail)
      .filter(Boolean)
      .join('; ')

    const activeMembers = companyMembers.filter(
      (member) => member.status === 'active'
    ).length

    const sub = subMap.get(company.id)

    return [
      company.name,
      company.slug,
      company.team_size,
      owners,
      managers,
      admins,
      activeMembers,
      sub?.status ?? '',
      sub?.seat_limit ?? '',
      sub?.amount_due ?? '',
      sub?.currency ?? '',
      sub?.current_period_end ?? '',
      company.created_at,
    ].map(csvEscape)
  })

  const csv = [headers.map(csvEscape), ...rows]
    .map((row) => row.join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="genim-companies.csv"',
    },
  })
}