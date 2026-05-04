import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const token = String(formData.get('token') || '').trim()

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const admin = createAdminClient()

    const { data: assessment, error: assessmentError } = await admin
      .from('candidate_roleplay_assessments')
      .select('*')
      .eq('access_token', token)
      .maybeSingle()

    if (assessmentError || !assessment) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const expired =
      assessment.expires_at &&
      new Date(assessment.expires_at).getTime() < Date.now()

    if (
      expired ||
      assessment.status === 'completed' ||
      assessment.status === 'cancelled' ||
      assessment.status === 'expired'
    ) {
      return NextResponse.redirect(
        new URL(`/candidate-assessment/${token}`, request.url)
      )
    }

    let candidateProfileId: string | null = null

    const { data: existingProfile, error: profileLookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('email', assessment.candidate_email)
      .maybeSingle()

    if (profileLookupError) {
      throw new Error(profileLookupError.message)
    }

    if (existingProfile) {
      candidateProfileId = existingProfile.id
    } else {
      const tempPassword = `Genim-${randomUUID()}-Temp!`

      const { data: createdUser, error: createUserError } =
        await admin.auth.admin.createUser({
          email: assessment.candidate_email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: assessment.candidate_name || null,
            role: 'candidate',
            account_type: 'candidate',
          },
        })

      if (createUserError) {
        throw new Error(createUserError.message)
      }

      if (!createdUser.user) {
        throw new Error('Failed to create candidate auth user')
      }

      candidateProfileId = createdUser.user.id

      const { data: existingCreatedProfile, error: createdProfileLookupError } =
        await admin
          .from('profiles')
          .select('id')
          .eq('id', candidateProfileId)
          .maybeSingle()

      if (createdProfileLookupError) {
        throw new Error(createdProfileLookupError.message)
      }

      if (!existingCreatedProfile) {
        const { error: insertProfileError } = await admin.from('profiles').insert({
          id: candidateProfileId,
          full_name: assessment.candidate_name || null,
          email: assessment.candidate_email,
          role: 'candidate',
          account_type: 'candidate',
        })

        if (insertProfileError) {
          throw new Error(insertProfileError.message)
        }
      } else {
        const { error: updateProfileError } = await admin
          .from('profiles')
          .update({
            full_name: assessment.candidate_name || null,
            email: assessment.candidate_email,
            role: 'candidate',
            account_type: 'candidate',
          })
          .eq('id', candidateProfileId)

        if (updateProfileError) {
          throw new Error(updateProfileError.message)
        }
      }
    }

    const { data: personaCheck, error: personaCheckError } = assessment.buyer_persona_id
      ? await admin
          .from('buyer_personas')
          .select('id')
          .eq('id', assessment.buyer_persona_id)
          .eq('is_active', true)
          .maybeSingle()
      : { data: null, error: null as { message?: string } | null }

    if (personaCheckError) {
      throw new Error(personaCheckError.message || 'Failed to validate persona')
    }

    const { data: session, error: sessionError } = await admin
      .from('roleplay_sessions')
      .insert({
        user_id: candidateProfileId,
        scenario_id: assessment.scenario_id,
        buyer_persona_id: personaCheck?.id ?? null,
        candidate_assessment_id: assessment.id,
        mode: 'voice',
        status: 'live',
        started_at: new Date().toISOString(),

        selected_industry: assessment.selected_industry ?? null,
        selected_buyer_mood: assessment.selected_buyer_mood ?? null,
        selected_buyer_role: assessment.selected_buyer_role ?? null,
        selected_deal_size: assessment.selected_deal_size ?? null,
        selected_pain_level: assessment.selected_pain_level ?? null,
        selected_company_stage: assessment.selected_company_stage ?? null,
        selected_time_pressure: assessment.selected_time_pressure ?? null,
        selected_roleplay_type: assessment.selected_roleplay_type ?? null,
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      throw new Error(sessionError?.message || 'Failed to create candidate session')
    }

    const { error: updateAssessmentError } = await admin
      .from('candidate_roleplay_assessments')
      .update({
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .eq('id', assessment.id)

    if (updateAssessmentError) {
      throw new Error(updateAssessmentError.message)
    }

    return NextResponse.redirect(
      new URL(
        `/candidate-assessment/${token}/session?sessionId=${session.id}`,
        request.url
      )
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start candidate assessment',
      },
      { status: 500 }
    )
  }
}