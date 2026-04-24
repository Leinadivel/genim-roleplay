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

function isActiveTeamSubscription(subscription: {
  status: string | null
  current_period_end: string | null
}) {
  if (subscription.status !== 'active') return false
  if (!subscription.current_period_end) return true

  return new Date(subscription.current_period_end).getTime() > Date.now()
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const assignedToUserId = String(formData.get('assignedToUserId') || '').trim()
    const scenarioId = String(formData.get('scenarioId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const note = String(formData.get('note') || '').trim()
    const dueAtRaw = String(formData.get('dueAt') || '').trim()
    const creatorTimezone = String(formData.get('creatorTimezone') || '').trim()

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

    const { data: teamSubscription, error: teamSubscriptionError } =
      await supabase
        .from('company_subscriptions')
        .select('status, current_period_end')
        .eq('company_id', membership.company_id)
        .maybeSingle()

    if (teamSubscriptionError || !teamSubscription || !isActiveTeamSubscription(teamSubscription)) {
      return NextResponse.redirect(new URL('/team?billing_required=1', request.url))
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

    const insertPayload: Record<string, unknown> = {
      company_id: membership.company_id,
      assigned_to_user_id: assignedToUserId,
      assigned_by_user_id: user.id,
      scenario_id: scenarioId,
      title: title || null,
      note: note || null,
      due_at: dueAt,
      status: 'assigned',
    }

    if (creatorTimezone) {
      insertPayload.creator_timezone = creatorTimezone
    }

    const { error: insertError } = await supabase
      .from('team_roleplay_assignments')
      .insert(insertPayload)

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