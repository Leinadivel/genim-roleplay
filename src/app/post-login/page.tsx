import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PostLoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, account_type, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/scenarios')
  }

  const normalizedEmail = profile.email?.trim().toLowerCase() ?? ''

  if (normalizedEmail) {
    const { data: pendingMemberships } = await supabase
      .from('company_members')
      .select('id, company_id, role, status, user_id, email')
      .eq('email', normalizedEmail)
      .in('status', ['invited', 'pending'])
      .order('created_at', { ascending: true })

    if (pendingMemberships && pendingMemberships.length > 0) {
      const membershipToActivate = pendingMemberships[0]

      await supabase
        .from('company_members')
        .update({
          user_id: user.id,
          status: 'active',
        })
        .eq('id', membershipToActivate.id)

      if (profile.account_type !== 'team' || profile.role !== 'owner') {
        await supabase
          .from('profiles')
          .update({
            account_type: 'team',
            role: membershipToActivate.role === 'admin' ? 'admin' : 'rep',
          })
          .eq('id', user.id)
      }

      redirect('/team')
    }
  }

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (membership) {
    redirect('/team')
  }

  if (profile.account_type === 'team' || profile.role === 'owner') {
    redirect('/team')
  }

  redirect('/scenarios')
}