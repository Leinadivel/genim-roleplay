import { NextResponse } from 'next/server'

import { startSession } from '@/services/sessions/start-session'

type StartRequestBody = {
  scenarioId?: string
  mode?: 'voice' | 'text'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartRequestBody

    const scenarioId = body.scenarioId?.trim()
    const mode = body.mode ?? 'voice'

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'scenarioId is required' },
        { status: 400 }
      )
    }

    if (mode !== 'voice' && mode !== 'text') {
      return NextResponse.json(
        { error: 'mode must be either voice or text' },
        { status: 400 }
      )
    }

    const result = await startSession({
      scenarioId,
      mode,
    })

    return NextResponse.json({
      ok: true,
      session: result.session,
      scenarioBundle: result.scenarioBundle,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}