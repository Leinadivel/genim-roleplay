import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageMembers(role: string | null) {
  return role === 'owner' || role === 'admin'
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const memberId = String(formData.get('memberId') || '').trim()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership || !canManageMembers(membership.role)) {
    return NextResponse.redirect(new URL('/team', request.url))
  }

  if (!memberId) {
    return NextResponse.redirect(new URL('/team', request.url))
  }

  await supabase
    .from('company_members')
    .update({ status: 'removed' })
    .eq('id', memberId)
    .eq('company_id', membership.company_id)

  return NextResponse.redirect(new URL('/team', request.url))
}