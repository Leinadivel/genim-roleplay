import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageAssignments(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function canDeleteAssignment(status: string, completedSessionId: string | null) {
  return status === 'assigned' && !completedSessionId
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const assignmentId = String(formData.get('assignmentId') || '').trim()

    if (!assignmentId) {
      return NextResponse.redirect(new URL('/team/assignments', request.url))
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

    if (membershipError || !membership || !canManageAssignments(membership.role)) {
      return NextResponse.redirect(new URL('/team', request.url))
    }

    const { data: existing, error: existingError } = await supabase
      .from('team_roleplay_assignments')
      .select('id, company_id, status, completed_session_id')
      .eq('id', assignmentId)
      .eq('company_id', membership.company_id)
      .maybeSingle()

    if (existingError || !existing) {
      return NextResponse.redirect(new URL('/team/assignments', request.url))
    }

    if (!canDeleteAssignment(existing.status, existing.completed_session_id)) {
      return NextResponse.redirect(new URL('/team/assignments', request.url))
    }

    const { error: deleteError } = await supabase
      .from('team_roleplay_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('company_id', membership.company_id)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    return NextResponse.redirect(new URL('/team/assignments', request.url))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete assignment',
      },
      { status: 500 }
    )
  }
}