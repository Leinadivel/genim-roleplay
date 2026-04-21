import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageHiring(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function parseExpiryToUtc(expiresAtRaw: string): string | null {
  if (!expiresAtRaw) return null

  const parsed = new Date(expiresAtRaw)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const assessmentId = String(formData.get('assessmentId') || '').trim()
    const candidateName = String(formData.get('candidateName') || '').trim()
    const candidateEmail = String(formData.get('candidateEmail') || '')
      .trim()
      .toLowerCase()
    const scenarioId = String(formData.get('scenarioId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const note = String(formData.get('note') || '').trim()
    const expiresAtRaw = String(formData.get('expiresAt') || '').trim()
    const creatorTimezone = String(formData.get('creatorTimezone') || '').trim()

    if (!assessmentId || !candidateEmail || !scenarioId) {
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

    // 🔒 Load assessment to validate ownership + lock state
    const { data: existing, error: existingError } = await supabase
      .from('candidate_roleplay_assessments')
      .select(
        'id, company_id, status, completed_session_id'
      )
      .eq('id', assessmentId)
      .eq('company_id', membership.company_id)
      .maybeSingle()

    if (existingError || !existing) {
      return NextResponse.redirect(new URL('/team/hiring', request.url))
    }

    const isLocked =
      existing.status === 'completed' ||
      existing.status === 'archived' ||
      existing.status === 'cancelled'

    if (isLocked) {
      // silently block edits to protect data integrity
      return NextResponse.redirect(new URL('/team/hiring', request.url))
    }

    const expiresAt = parseExpiryToUtc(expiresAtRaw)

    const updatePayload: Record<string, unknown> = {
      candidate_name: candidateName || null,
      candidate_email: candidateEmail,
      scenario_id: scenarioId,
      title: title || null,
      note: note || null,
      expires_at: expiresAt,
    }

    // optional timezone tracking (safe if column exists)
    if (creatorTimezone) {
      updatePayload.creator_timezone = creatorTimezone
    }

    const { error: updateError } = await supabase
      .from('candidate_roleplay_assessments')
      .update(updatePayload)
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
            : 'Failed to update candidate assessment',
      },
      { status: 500 }
    )
  }
}