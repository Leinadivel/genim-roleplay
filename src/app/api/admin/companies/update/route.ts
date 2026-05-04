import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

export async function POST(request: Request) {
  const { user, admin } = await getGenimAdmin()

  if (!user) redirect('/login')
  if (!admin) redirect('/scenarios')

  const formData = await request.formData()

  const intent = String(formData.get('intent') || 'save')
  const companyId = String(formData.get('companyId') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const slug = String(formData.get('slug') || '').trim()
  const teamSizeRaw = String(formData.get('teamSize') || '').trim()
  const subscriptionStatus = String(
    formData.get('subscriptionStatus') || 'not_active'
  ).trim()
  const seatLimitRaw = String(formData.get('seatLimit') || '').trim()
  const amountDueRaw = String(formData.get('amountDue') || '').trim()
  const currency = String(formData.get('currency') || 'usd').trim()
  const currentPeriodEndRaw = String(
    formData.get('currentPeriodEnd') || ''
  ).trim()

  if (!companyId) {
    return NextResponse.json({ error: 'Missing company id' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  if (intent === 'delete') {
    await adminClient.from('company_members').delete().eq('company_id', companyId)
    await adminClient
      .from('company_subscriptions')
      .delete()
      .eq('company_id', companyId)

    const { error: deleteError } = await adminClient
      .from('companies')
      .delete()
      .eq('id', companyId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    redirect('/admin/users/companies?deleted=1')
  }

  const teamSize = teamSizeRaw ? Number(teamSizeRaw) : null

  const { error: companyError } = await adminClient
    .from('companies')
    .update({
      name,
      slug: slug || null,
      team_size: teamSize,
    })
    .eq('id', companyId)

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 })
  }

  const seatLimit = seatLimitRaw ? Number(seatLimitRaw) : null
  const amountDue = amountDueRaw ? Number(amountDueRaw) : null
  const currentPeriodEnd = currentPeriodEndRaw
    ? new Date(currentPeriodEndRaw).toISOString()
    : null

  const { error: subError } = await adminClient
    .from('company_subscriptions')
    .upsert(
      {
        company_id: companyId,
        plan_name: 'team_custom',
        status:
          subscriptionStatus === 'not_active'
            ? 'inactive'
            : subscriptionStatus,
        seat_limit: seatLimit,
        amount_due: amountDue,
        currency,
        current_period_end: currentPeriodEnd,
      },
      {
        onConflict: 'company_id',
      }
    )

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 })
  }

  redirect(`/admin/companies/${companyId}?saved=1`)
}