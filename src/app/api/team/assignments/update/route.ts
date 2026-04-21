import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageAssignments(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function parseDueAtToUtc(dueAtRaw: string): string | null {
  if (!dueAtRaw) return null

  const parsed = new Date(dueAtRaw)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const assignmentId = String(formData.get('assignmentId') || '').trim()
    const assignedToUserId = String(formData.get('assignedToUserId') || '').trim()
    const scenarioId = String(formData.get('scenarioId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const note = String(formData.get('note') || '').trim()
    const dueAtRaw = String(formData.get('dueAt') || '').trim()
    const creatorTimezone = String(formData.get('creatorTimezone') || '').trim()

    if (!assignmentId || !assignedToUserId || !scenarioId) {
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

    const isLocked =
      existing.status === 'completed' ||
      existing.status === 'archived' ||
      existing.status === 'cancelled'

    if (isLocked) {
      return NextResponse.redirect(new URL('/team/assignments', request.url))
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

    const dueAt = parseDueAtToUtc(dueAtRaw)

    const updatePayload: Record<string, unknown> = {
      assigned_to_user_id: assignedToUserId,
      scenario_id: scenarioId,
      title: title || null,
      note: note || null,
      due_at: dueAt,
    }

    if (creatorTimezone) {
      updatePayload.creator_timezone = creatorTimezone
    }

    const { error: updateError } = await supabase
      .from('team_roleplay_assignments')
      .update(updatePayload)
      .eq('id', assignmentId)
      .eq('company_id', membership.company_id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.redirect(new URL('/team/assignments', request.url))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update assignment',
      },
      { status: 500 }
    )
  }
}