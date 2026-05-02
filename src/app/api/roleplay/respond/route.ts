import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBuyerResponse } from '@/services/ai/generate-buyer-response'
import { getScenarioBundleById } from '@/services/scenarios/get-scenario-bundle'
import { appendSessionMessage } from '@/services/sessions/append-session-message'
import { getSessionMessages } from '@/services/sessions/get-session-messages'
import { getSessionWithPersona } from '@/services/sessions/get-session-by-id'

type RespondRequestBody = {
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RespondRequestBody
    const sessionId = body.sessionId?.trim()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { session, buyerPersona } = await getSessionWithPersona(sessionId)

    if (['completed', 'evaluated', 'cancelled'].includes(session.status)) {
      return NextResponse.json(
        { error: 'This session has already ended.' },
        { status: 400 }
      )
    }

    if (session.status !== 'live') {
      await supabase
        .from('roleplay_sessions')
        .update({ status: 'live' })
        .eq('id', sessionId)
    }

    const [baseScenarioBundle, messages] = await Promise.all([
      getScenarioBundleById(session.scenario_id),
      getSessionMessages(sessionId),
    ])

    const latestMessage = messages[messages.length - 1]

    if (!latestMessage || latestMessage.speaker !== 'user') {
      return NextResponse.json(
        { error: 'The seller must send a response before the buyer can reply.' },
        { status: 400 }
      )
    }

    const nextTurnIndex =
      messages.length > 0
        ? Math.max(...messages.map((message) => message.turn_index)) + 1
        : 0

    const scenarioBundle = {
      ...baseScenarioBundle,
      buyerPersona,
    }

    const buyerReply = await generateBuyerResponse({
      scenarioBundle,
      messages,
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

    if (!buyerReply || !buyerReply.trim()) {
      throw new Error('AI buyer returned an empty response.')
    }

    const savedMessage = await appendSessionMessage({
      sessionId,
      speaker: 'assistant',
      messageText: buyerReply.trim(),
      turnIndex: nextTurnIndex,
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

    return NextResponse.json({
      ok: true,
      message: savedMessage,
    })
  } catch (error) {
    console.error('Roleplay respond failed:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Buyer response failed',
      },
      { status: 500 }
    )
  }
}