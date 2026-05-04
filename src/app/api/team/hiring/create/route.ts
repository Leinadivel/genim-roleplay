import { randomUUID } from 'crypto'
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

    const candidateName = String(formData.get('candidateName') || '').trim()
    const candidateEmail = String(formData.get('candidateEmail') || '')
      .trim()
      .toLowerCase()
    const scenarioId = String(formData.get('scenarioId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const note = String(formData.get('note') || '').trim()
    const expiresAtRaw = String(formData.get('expiresAt') || '').trim()
    const creatorTimezone = String(formData.get('creatorTimezone') || '').trim()
    const selectedIndustry = String(formData.get('selectedIndustry') || '').trim()
    const selectedBuyerMood = String(formData.get('selectedBuyerMood') || '').trim()
    const selectedBuyerRole = String(formData.get('selectedBuyerRole') || '').trim()
    const selectedDealSize = String(formData.get('selectedDealSize') || '').trim()
    const selectedPainLevel = String(formData.get('selectedPainLevel') || '').trim()
    const selectedCompanyStage = String(formData.get('selectedCompanyStage') || '').trim()
    const selectedTimePressure = String(formData.get('selectedTimePressure') || '').trim()
    const selectedRoleplayType = String(formData.get('selectedRoleplayType') || '').trim()

    if (
      !candidateEmail ||
      !scenarioId ||
      !selectedIndustry ||
      !selectedBuyerMood ||
      !selectedBuyerRole ||
      !selectedPainLevel ||
      !selectedCompanyStage ||
      !selectedTimePressure ||
      !selectedRoleplayType
    ) {
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

    const { data: teamSubscription, error: teamSubscriptionError } =
      await supabase
        .from('company_subscriptions')
        .select('status, current_period_end')
        .eq('company_id', membership.company_id)
        .maybeSingle()

    if (teamSubscriptionError || !teamSubscription || !isActiveTeamSubscription(teamSubscription)) {
      return NextResponse.redirect(new URL('/team?billing_required=1', request.url))
    }

    const accessToken =
      randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '')

    const expiresAt = parseExpiryToUtc(expiresAtRaw)

    const insertPayload: Record<string, unknown> = {
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
      selected_industry: selectedIndustry,
      selected_buyer_mood: selectedBuyerMood,
      selected_buyer_role: selectedBuyerRole,
      selected_deal_size: selectedDealSize || null,
      selected_pain_level: selectedPainLevel,
      selected_company_stage: selectedCompanyStage,
      selected_time_pressure: selectedTimePressure,
      selected_roleplay_type: selectedRoleplayType,
    }

    if (creatorTimezone) {
      insertPayload.creator_timezone = creatorTimezone
    }

    const { error: insertError } = await supabase
      .from('candidate_roleplay_assessments')
      .insert(insertPayload)

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