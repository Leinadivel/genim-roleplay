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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_type, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/scenarios')
  }

  if (profile.account_type === 'team' || profile.role === 'owner') {
    redirect('/team')
  }

  redirect('/scenarios')
}