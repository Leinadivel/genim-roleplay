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
  const userId = String(formData.get('userId') || '').trim()
  const fullName = String(formData.get('fullName') || '').trim()
  const role = String(formData.get('role') || 'rep').trim()
  const accountType = String(formData.get('accountType') || 'individual').trim()
  const status = String(formData.get('status') || 'active').trim()
  const planKey = String(formData.get('planKey') || 'starter').trim()
  const companyId = String(formData.get('companyId') || '').trim()
  const currentPeriodEndRaw = String(
    formData.get('currentPeriodEnd') || ''
  ).trim()

  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  if (intent === 'delete') {
    await adminClient.from('company_members').delete().eq('user_id', userId)
    await adminClient.from('subscriptions').delete().eq('user_id', userId)

    const { error: profileDeleteError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      return NextResponse.json(
        { error: profileDeleteError.message },
        { status: 500 }
      )
    }

    redirect('/admin/users/individuals?deleted=1')
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      full_name: fullName || null,
      role,
      account_type: accountType,
      status,
    })
    .eq('id', userId)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const currentPeriodEnd = currentPeriodEndRaw
    ? new Date(currentPeriodEndRaw).toISOString()
    : null

  const subscriptionStatus = planKey === 'starter' ? 'inactive' : 'active'

  const { error: subError } = await adminClient.from('subscriptions').upsert(
    {
      user_id: userId,
      plan_key: planKey,
      status: subscriptionStatus,
      current_period_end: currentPeriodEnd,
    },
    {
      onConflict: 'user_id',
    }
  )

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 })
  }

  await adminClient.from('company_members').delete().eq('user_id', userId)

  if (companyId) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    const { error: memberError } = await adminClient
      .from('company_members')
      .upsert(
        {
          company_id: companyId,
          user_id: userId,
          email: profile?.email ?? null,
          role,
          status,
        },
        {
          onConflict: 'company_id,user_id',
        }
      )

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }
  }

  redirect(`/admin/users/individuals/${userId}?saved=1`)
}