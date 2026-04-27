import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateBuyerResponse } from '@/services/ai/generate-buyer-response'
import { getScenarioBundleById } from '@/services/scenarios/get-scenario-bundle'

type RespondRequestBody = {
  token?: string
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RespondRequestBody
    const token = body.token?.trim()
    const sessionId = body.sessionId?.trim()

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: 'token and sessionId are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: assessment, error: assessmentError } = await admin
      .from('candidate_roleplay_assessments')
      .select('id')
      .eq('access_token', token)
      .maybeSingle()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Candidate assessment not found' },
        { status: 404 }
      )
    }

    const { data: session, error: sessionError } = await admin
      .from('roleplay_sessions')
      .select(`
        id,
        scenario_id,
        buyer_persona_id,
        status,
        selected_industry,
        selected_roleplay_type,
        selected_buyer_mood,
        selected_buyer_role,
        selected_deal_size,
        selected_pain_level,
        selected_company_stage,
        selected_time_pressure,
        candidate_assessment_id
      `)
      .eq('id', sessionId)
      .eq('candidate_assessment_id', assessment.id)
      .maybeSingle()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Candidate session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Only a live session can receive AI responses' },
        { status: 400 }
      )
    }

    const [{ data: messages, error: messagesError }, baseScenarioBundleResult] =
      await Promise.all([
        admin
          .from('session_messages')
          .select(
            'id, session_id, speaker, message_text, turn_index, started_at, ended_at, audio_url, metadata, created_at'
          )
          .eq('session_id', sessionId)
          .order('turn_index', { ascending: true })
          .order('created_at', { ascending: true }),
        getScenarioBundleById(session.scenario_id),
      ])

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      )
    }

    let buyerPersona = baseScenarioBundleResult.buyerPersona

    if (session.buyer_persona_id) {
      const { data: personaRow } = await admin
        .from('buyer_personas')
        .select(`
          id,
          scenario_id,
          name,
          title,
          company_name,
          company_size,
          avatar_url,
          gender,
          voice_id,
          tone,
          background,
          hidden_pain_points,
          common_objections,
          goals,
          constraints
        `)
        .eq('id', session.buyer_persona_id)
        .maybeSingle()

      if (personaRow) {
        buyerPersona = {
          id: personaRow.id,
          scenario_id: personaRow.scenario_id,
          name: personaRow.name,
          title: personaRow.title,
          company_name: personaRow.company_name,
          company_size: personaRow.company_size,
          avatar_url: personaRow.avatar_url,
          gender: personaRow.gender,
          voice_id: personaRow.voice_id,
          tone: personaRow.tone,
          background: personaRow.background,
          hidden_pain_points: Array.isArray(personaRow.hidden_pain_points)
            ? personaRow.hidden_pain_points.filter((x): x is string => typeof x === 'string')
            : [],
          common_objections: Array.isArray(personaRow.common_objections)
            ? personaRow.common_objections.filter((x): x is string => typeof x === 'string')
            : [],
          goals: Array.isArray(personaRow.goals)
            ? personaRow.goals.filter((x): x is string => typeof x === 'string')
            : [],
          constraints: Array.isArray(personaRow.constraints)
            ? personaRow.constraints.filter((x): x is string => typeof x === 'string')
            : [],
        }
      }
    }

    const scenarioBundle = {
      ...baseScenarioBundleResult,
      buyerPersona,
    }

    const typedMessages = (messages ?? []).map((message) => ({
      id: message.id,
      session_id: message.session_id,
      speaker: message.speaker,
      message_text: message.message_text,
      turn_index: message.turn_index,
      started_at: message.started_at,
      ended_at: message.ended_at,
      audio_url: message.audio_url,
      metadata:
        message.metadata && typeof message.metadata === 'object'
          ? (message.metadata as Record<string, unknown>)
          : {},
      created_at: message.created_at,
    }))

    const nextTurnIndex =
      typedMessages.length > 0
        ? Math.max(...typedMessages.map((message) => message.turn_index)) + 1
        : 0

    const buyerReply = await generateBuyerResponse({
      scenarioBundle,
      messages: typedMessages,
      sessionContext: {
        selectedIndustry: session.selected_industry,
        selectedRoleplayType: session.selected_roleplay_type,
        selectedBuyerMood: session.selected_buyer_mood,
        selectedBuyerRole: session.selected_buyer_role,
        selectedDealSize: session.selected_deal_size,
        selectedPainLevel: session.selected_pain_level,
        selectedCompanyStage: session.selected_company_stage,
        selectedTimePressure: session.selected_time_pressure,
      },
    })

    const { data: savedMessage, error: insertError } = await admin
      .from('session_messages')
      .insert({
        session_id: sessionId,
        speaker: 'assistant',
        message_text: buyerReply,
        turn_index: nextTurnIndex,
        metadata: {
          source: 'openai',
          buyerPersonaId: scenarioBundle.buyerPersona?.id ?? null,
          buyerPersonaName: scenarioBundle.buyerPersona?.name ?? null,
          buyerPersonaTitle: scenarioBundle.buyerPersona?.title ?? null,
          buyerPersonaCompany: scenarioBundle.buyerPersona?.company_name ?? null,
          selectedIndustry: session.selected_industry,
          selectedRoleplayType: session.selected_roleplay_type,
          selectedBuyerMood: session.selected_buyer_mood,
          selectedBuyerRole: session.selected_buyer_role,
          selectedDealSize: session.selected_deal_size,
          selectedPainLevel: session.selected_pain_level,
          selectedCompanyStage: session.selected_company_stage,
          selectedTimePressure: session.selected_time_pressure,
        },
      })
      .select('id, speaker, message_text')
      .single()

    if (insertError || !savedMessage) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to save AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: savedMessage,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected server error',
      },
      { status: 500 }
    )
  }
}