import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getGenimAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { user: null, admin: null }
  }

  const adminClient = createAdminClient()

  const { data: admin } = await adminClient
    .from('genim_admins')
    .select('id, email, full_name, role, is_active')
    .eq('email', user.email.trim().toLowerCase())
    .eq('is_active', true)
    .maybeSingle()

  return { user, admin }
}