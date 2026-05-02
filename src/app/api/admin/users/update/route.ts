import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

function getPeriodEnd() {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString()
}

export async function POST(request: Request) {
  const { user, admin } = await getGenimAdmin()

  if (!user || !admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()

  const intent = String(formData.get('intent') || 'save')
  const userId = String(formData.get('userId') || '').trim()
  const fullName = String(formData.get('fullName') || '').trim()
  const role = String(formData.get('role') || 'rep')
  const accountType = String(formData.get('accountType') || 'individual')
  const status = String(formData.get('status') || 'active')
  const planKey = String(formData.get('planKey') || 'starter')
  const companyId = String(formData.get('companyId') || '').trim()

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  if (intent === 'delete') {
    await adminClient.from('subscriptions').delete().eq('user_id', userId)
    await adminClient.from('company_members').delete().eq('user_id', userId)
    await adminClient.from('profiles').delete().eq('id', userId)

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/admin/users?deleted=1', request.url), 303)
  }

  const { data: profile, error: profileLoadError } = await adminClient
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  if (profileLoadError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
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

  await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      full_name: fullName,
      role,
      account_type: accountType,
    },
    ban_duration: status === 'inactive' ? '876000h' : 'none',
  })

  if (planKey === 'starter') {
    await adminClient.from('subscriptions').upsert(
      {
        user_id: userId,
        plan_key: 'starter',
        status: 'active',
        current_period_end: null,
      },
      {
        onConflict: 'user_id',
      }
    )
  } else {
    const { error: subError } = await adminClient.from('subscriptions').upsert(
      {
        user_id: userId,
        plan_key: planKey,
        status: 'active',
        current_period_end: getPeriodEnd(),
      },
      {
        onConflict: 'user_id',
      }
    )

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }
  }

  if (companyId) {
    await adminClient.from('company_members').delete().eq('user_id', userId)

    const { error: memberError } = await adminClient
      .from('company_members')
      .insert({
        company_id: companyId,
        user_id: userId,
        email: profile.email,
        role,
        status: 'active',
      })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    await adminClient
      .from('profiles')
      .update({ account_type: 'team' })
      .eq('id', userId)
  }

  return NextResponse.redirect(new URL('/admin/users?saved=1', request.url), 303)
}