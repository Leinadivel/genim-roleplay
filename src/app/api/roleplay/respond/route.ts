import { NextResponse } from 'next/server'

import { generateBuyerResponse } from '@/services/ai/generate-buyer-response'
import { getScenarioBundleById } from '@/services/scenarios/get-scenario-bundle'
import { appendSessionMessage } from '@/services/sessions/append-session-message'
import { getSessionById } from '@/services/sessions/get-session-by-id'
import { getSessionMessages } from '@/services/sessions/get-session-messages'

type RespondRequestBody = {
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RespondRequestBody
    const sessionId = body.sessionId?.trim()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const session = await getSessionById(sessionId)

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Only a live session can receive AI responses' },
        { status: 400 }
      )
    }

    const [scenarioBundle, messages] = await Promise.all([
      getScenarioBundleById(session.scenario_id),
      getSessionMessages(sessionId),
    ])

    const nextTurnIndex =
      messages.length > 0
        ? Math.max(...messages.map((message) => message.turn_index)) + 1
        : 0

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

    const savedMessage = await appendSessionMessage({
      sessionId,
      speaker: 'assistant',
      messageText: buyerReply,
      turnIndex: nextTurnIndex,
      metadata: {
        source: 'openai',
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
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}