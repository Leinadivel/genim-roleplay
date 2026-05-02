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

  const fullName = String(formData.get('fullName') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '').trim()
  const accountType = String(formData.get('accountType') || 'individual')
  const role = String(formData.get('role') || 'rep')
  const planKey = String(formData.get('planKey') || 'starter')
  const companyId = String(formData.get('companyId') || '').trim()

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: 'Full name, email, and password are required' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  const { data: createdUser, error: createUserError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        account_type: accountType,
        role,
      },
    })

  if (createUserError || !createdUser.user) {
    return NextResponse.json(
      { error: createUserError?.message || 'Failed to create user' },
      { status: 400 }
    )
  }

  const userId = createdUser.user.id

  const { error: profileError } = await adminClient.from('profiles').upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      account_type: accountType,
      role,
      status: 'active',
    },
    {
      onConflict: 'id',
    }
  )

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (planKey !== 'starter') {
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

  if (accountType === 'team' && companyId) {
    const { error: memberError } = await adminClient
      .from('company_members')
      .upsert(
        {
          company_id: companyId,
          user_id: userId,
          email,
          role,
          status: 'active',
        },
        {
          onConflict: 'company_id,user_id',
        }
      )

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }
  }

  return NextResponse.redirect(new URL('/admin/users?created=1', request.url), 303)
}