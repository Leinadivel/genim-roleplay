import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type ActiveMembership = {
  id: string
  company_id: string
  role: string
  status: string
  user_id: string | null
  email: string | null
}

function mapMembershipRoleToProfileRole(role: string | null) {
  switch (role) {
    case 'owner':
      return 'owner'
    case 'admin':
      return 'admin'
    case 'manager':
      return 'manager'
    default:
      return 'rep'
  }
}

function canAccessTeamWorkspace(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

export default async function PostLoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select('id, email, full_name, account_type, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/scenarios')
  }

  const authEmail = normalizeEmail(user.email)
  const profileEmail = normalizeEmail(profile.email)
  const normalizedEmail = profileEmail || authEmail

  let activeMembership: ActiveMembership | null = null

  if (normalizedEmail) {
    const { data: pendingMemberships, error: pendingMembershipsError } =
      await supabase
        .from('company_members')
        .select('id, company_id, role, status, user_id, email')
        .eq('email', normalizedEmail)
        .in('status', ['invited', 'pending'])
        .order('created_at', { ascending: true })

    if (pendingMembershipsError) {
      throw new Error(
        `Failed to load pending memberships: ${pendingMembershipsError.message}`
      )
    }

    if (pendingMemberships && pendingMemberships.length > 0) {
      const membershipToActivate = pendingMemberships[0]

      const { error: activateMembershipError } = await supabase
        .from('company_members')
        .update({
          user_id: user.id,
          status: 'active',
        })
        .eq('id', membershipToActivate.id)

      if (activateMembershipError) {
        throw new Error(
          `Failed to activate membership: ${activateMembershipError.message}`
        )
      }

      activeMembership = {
        ...membershipToActivate,
        user_id: user.id,
        status: 'active',
      }
    }
  }

  if (!activeMembership) {
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('id, company_id, role, status, user_id, email')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      throw new Error(`Failed to load active membership: ${membershipError.message}`)
    }

    activeMembership = membership
  }

  if (activeMembership) {
    const nextProfileRole = mapMembershipRoleToProfileRole(activeMembership.role)

    const { error: syncProfileError } = await supabase
      .from('profiles')
      .update({
        email: normalizedEmail || profile.email,
        account_type: 'team',
        role: nextProfileRole,
      })
      .eq('id', user.id)

    if (syncProfileError) {
      throw new Error(`Failed to sync profile: ${syncProfileError.message}`)
    }

    const needsName = !profile.full_name || !profile.full_name.trim()

    if (needsName) {
      redirect('/complete-profile')
    }

    if (canAccessTeamWorkspace(activeMembership.role)) {
      redirect('/team')
    }

    redirect('/scenarios')
  }

  const needsName = !profile.full_name || !profile.full_name.trim()

  if (needsName) {
    redirect('/complete-profile')
  }

  if (profile.account_type === 'team' && canAccessTeamWorkspace(profile.role)) {
    redirect('/team')
  }

  redirect('/scenarios')
}