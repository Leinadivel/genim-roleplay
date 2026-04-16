import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function canManageHiring(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const candidateName = String(formData.get('candidateName') || '').trim()
    const candidateEmail = String(formData.get('candidateEmail') || '').trim().toLowerCase()
    const scenarioId = String(formData.get('scenarioId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const note = String(formData.get('note') || '').trim()
    const expiresAtRaw = String(formData.get('expiresAt') || '').trim()

    if (!candidateEmail || !scenarioId) {
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

    const accessToken = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '')
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null

    const { error: insertError } = await supabase
      .from('candidate_roleplay_assessments')
      .insert({
        company_id: membership.company_id,
        created_by_user_id: user.id,
        candidate_name: candidateName || null,
        candidate_email: candidateEmail,
        scenario_id: scenarioId,
        title: title || null,
        note: note || null,
        access_token: accessToken,
        status: 'invited',
        expires_at: expiresAt,
      })

    if (insertError) {
      throw new Error(insertError.message)
    }

    return NextResponse.redirect(new URL('/team/hiring', request.url))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create candidate assessment',
      },
      { status: 500 }
    )
  }
}