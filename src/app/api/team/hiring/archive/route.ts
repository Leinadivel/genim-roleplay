import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageHiring(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const assessmentId = String(formData.get('assessmentId') || '').trim()

    if (!assessmentId) {
      return NextResponse.redirect(new URL('/team/hiring', request.url))
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (membershipError || !membership || !canManageHiring(membership.role)) {
      return NextResponse.redirect(new URL('/team', request.url))
    }

    const { data: existing, error: existingError } = await supabase
      .from('candidate_roleplay_assessments')
      .select('id, company_id, status')
      .eq('id', assessmentId)
      .eq('company_id', membership.company_id)
      .maybeSingle()

    if (existingError || !existing) {
      return NextResponse.redirect(new URL('/team/hiring', request.url))
    }

    if (existing.status === 'archived' || existing.status === 'cancelled') {
      return NextResponse.redirect(new URL('/team/hiring', request.url))
    }

    const { error: updateError } = await supabase
      .from('candidate_roleplay_assessments')
      .update({
        status: 'archived',
      })
      .eq('id', assessmentId)
      .eq('company_id', membership.company_id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.redirect(new URL('/team/hiring', request.url))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to archive candidate assessment',
      },
      { status: 500 }
    )
  }
}