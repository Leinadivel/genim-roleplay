import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageAssignments(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const assignedToUserId = String(formData.get('assignedToUserId') || '').trim()
    const scenarioId = String(formData.get('scenarioId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const note = String(formData.get('note') || '').trim()
    const dueAtRaw = String(formData.get('dueAt') || '').trim()

    if (!assignedToUserId || !scenarioId) {
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

    const { data: targetMember, error: targetMemberError } = await supabase
      .from('company_members')
      .select('user_id, company_id, status, role')
      .eq('company_id', membership.company_id)
      .eq('user_id', assignedToUserId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (targetMemberError || !targetMember) {
      return NextResponse.redirect(new URL('/team/assignments', request.url))
    }

    const dueAt = dueAtRaw ? new Date(dueAtRaw).toISOString() : null

    const { error: insertError } = await supabase
      .from('team_roleplay_assignments')
      .insert({
        company_id: membership.company_id,
        assigned_to_user_id: assignedToUserId,
        assigned_by_user_id: user.id,
        scenario_id: scenarioId,
        title: title || null,
        note: note || null,
        due_at: dueAt,
        status: 'assigned',
      })

    if (insertError) {
      throw new Error(insertError.message)
    }

    return NextResponse.redirect(new URL('/team/assignments', request.url))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create assignment',
      },
      { status: 500 }
    )
  }
}