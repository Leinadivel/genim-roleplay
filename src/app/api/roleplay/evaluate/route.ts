import { NextResponse } from 'next/server'

import { evaluateSession } from '@/services/ai/evaluate-session'
import { saveSessionEvaluation } from '@/services/evaluation/save-session-evaluation'
import { getScenarioBundleById } from '@/services/scenarios/get-scenario-bundle'
import { getSessionById } from '@/services/sessions/get-session-by-id'

type EvaluateRequestBody = {
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluateRequestBody
    const sessionId = body.sessionId?.trim()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const session = await getSessionById(sessionId)

    if (session.status !== 'completed' && session.status !== 'evaluated') {
      return NextResponse.json(
        { error: 'Only a completed session can be evaluated' },
        { status: 400 }
      )
    }

    if (!session.transcript_text?.trim()) {
      return NextResponse.json(
        { error: 'Session transcript is empty' },
        { status: 400 }
      )
    }

    const scenarioBundle = await getScenarioBundleById(session.scenario_id)

    const evaluation = await evaluateSession({
      transcript: session.transcript_text,
      rubricItems: scenarioBundle.rubricItems,
    })

    await saveSessionEvaluation({
      sessionId,
      evaluation,
      rubricItems: scenarioBundle.rubricItems.map((item) => ({
        id: item.id,
        category_key: item.category_key,
        category_label: item.category_label,
        max_score: item.max_score,
      })),
    })

    return NextResponse.json({
      ok: true,
      evaluation,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}