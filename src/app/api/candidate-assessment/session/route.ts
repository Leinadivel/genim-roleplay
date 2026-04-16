import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')?.trim()
    const sessionId = searchParams.get('sessionId')?.trim()

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: 'token and sessionId are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: assessment, error: assessmentError } = await admin
      .from('candidate_roleplay_assessments')
      .select('id, completed_session_id')
      .eq('access_token', token)
      .maybeSingle()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Candidate assessment not found' },
        { status: 404 }
      )
    }

    const { data: sessionRow, error: sessionError } = await admin
      .from('roleplay_sessions')
      .select(`
        id,
        selected_industry,
        selected_roleplay_type,
        selected_buyer_mood,
        selected_buyer_role,
        selected_deal_size,
        selected_pain_level,
        selected_company_stage,
        selected_time_pressure,
        buyer_persona_id
      `)
      .eq('id', sessionId)
      .eq('candidate_assessment_id', assessment.id)
      .maybeSingle()

    if (sessionError || !sessionRow) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    let buyerPersona: {
      id: string
      name: string
      title: string | null
      company_name: string | null
      company_size: string | null
      avatar_url: string | null
    } | null = null

    if (sessionRow.buyer_persona_id) {
      const { data: personaRow } = await admin
        .from('buyer_personas')
        .select('id, name, title, company_name, company_size, avatar_url')
        .eq('id', sessionRow.buyer_persona_id)
        .maybeSingle()

      if (personaRow) {
        buyerPersona = personaRow
      }
    }

    return NextResponse.json({
      session: {
        id: sessionRow.id,
        selected_industry: sessionRow.selected_industry,
        selected_roleplay_type: sessionRow.selected_roleplay_type,
        selected_buyer_mood: sessionRow.selected_buyer_mood,
        selected_buyer_role: sessionRow.selected_buyer_role,
        selected_deal_size: sessionRow.selected_deal_size,
        selected_pain_level: sessionRow.selected_pain_level,
        selected_company_stage: sessionRow.selected_company_stage,
        selected_time_pressure: sessionRow.selected_time_pressure,
        should_ring_first: true,
        buyer_persona: buyerPersona,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to load session',
      },
      { status: 500 }
    )
  }
}