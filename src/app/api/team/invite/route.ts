import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const ALLOWED_INVITER_ROLES = ['owner', 'admin'] as const
const ALLOWED_MEMBER_ROLES = ['rep', 'manager', 'admin'] as const

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeRole(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function parseTeamSize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as {
      email?: string
      role?: string
    }

    const email = normalizeEmail(body.email)
    const role = normalizeRole(body.role) || 'rep'

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address' },
        { status: 400 }
      )
    }

    if (
      !ALLOWED_MEMBER_ROLES.includes(
        role as (typeof ALLOWED_MEMBER_ROLES)[number]
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      return NextResponse.json(
        { error: membershipError.message },
        { status: 400 }
      )
    }

    if (!membership?.company_id) {
      return NextResponse.json(
        { error: 'No active company membership found' },
        { status: 400 }
      )
    }

    if (
      !ALLOWED_INVITER_ROLES.includes(
        membership.role as (typeof ALLOWED_INVITER_ROLES)[number]
      )
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, team_size')
      .eq('id', membership.company_id)
      .maybeSingle()

    if (companyError || !company) {
      return NextResponse.json(
        { error: companyError?.message || 'Company not found' },
        { status: 400 }
      )
    }

    const { count: existingMemberCount, error: countError } = await supabase
      .from('company_members')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 400 }
      )
    }

    const teamLimit = parseTeamSize(company.team_size)
    if (teamLimit && (existingMemberCount ?? 0) >= teamLimit) {
      return NextResponse.json(
        {
          error:
            'This workspace has reached its current seat limit. Increase team capacity before inviting more members.',
        },
        { status: 400 }
      )
    }

    const { data: existingInvite, error: existingInviteError } = await supabase
      .from('company_members')
      .select('id, email, user_id, status')
      .eq('company_id', company.id)
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingInviteError) {
      return NextResponse.json(
        { error: existingInviteError.message },
        { status: 400 }
      )
    }

    if (existingInvite) {
      return NextResponse.json(
        { error: 'This email already exists in the workspace or has been invited.' },
        { status: 400 }
      )
    }

    const { data: existingProfile, error: profileLookupError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (profileLookupError) {
      return NextResponse.json(
        { error: profileLookupError.message },
        { status: 400 }
      )
    }

    if (existingProfile?.id) {
      const { data: existingUserMembership, error: existingUserMembershipError } =
        await supabase
          .from('company_members')
          .select('id, company_id, status')
          .eq('user_id', existingProfile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

      if (existingUserMembershipError) {
        return NextResponse.json(
          { error: existingUserMembershipError.message },
          { status: 400 }
        )
      }

      if (
        existingUserMembership &&
        existingUserMembership.company_id === company.id
      ) {
        return NextResponse.json(
          { error: 'This user is already linked to your workspace.' },
          { status: 400 }
        )
      }

      if (
        existingUserMembership &&
        existingUserMembership.company_id !== company.id &&
        existingUserMembership.status === 'active'
      ) {
        return NextResponse.json(
          {
            error:
              'This user already belongs to another active company workspace.',
          },
          { status: 400 }
        )
      }
    }

    const insertPayload: {
      company_id: string
      email: string
      role: string
      status: string
      user_id?: string
    } = {
      company_id: company.id,
      email,
      role,
      status: existingProfile?.id ? 'pending' : 'invited',
    }

    if (existingProfile?.id) {
      insertPayload.user_id = existingProfile.id
    }

    const { error: insertError } = await supabase
      .from('company_members')
      .insert(insertPayload)

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        ok: true,
        message:
          'Member record created, but email sending is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to enable invite emails.',
      })
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey)

    const redirectTo = `${getBaseUrl()}/auth/callback?next=/post-login`

    if (existingProfile?.id) {
      const { error: magicLinkError } = await adminSupabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo,
        },
      })

      if (magicLinkError) {
        return NextResponse.json({
          ok: true,
          message:
            'Member record created, but email link could not be sent. Check Auth email settings.',
        })
      }
    } else {
      const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo,
          data: {
            invited_to_company: company.id,
            invited_role: role,
            account_type: 'team',
          },
        }
      )

      if (inviteError) {
        return NextResponse.json({
          ok: true,
          message:
            'Invite record created, but auth invite email could not be sent. Check Auth email settings.',
        })
      }
    }

    return NextResponse.json({
      ok: true,
      message: existingProfile?.id
        ? 'Member added and login link sent successfully.'
        : 'Invite created and email sent successfully.',
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}