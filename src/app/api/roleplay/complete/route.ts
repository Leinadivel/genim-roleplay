import { NextResponse } from 'next/server'

import { completeSession } from '@/services/sessions/complete-session'
import { buildSessionTranscript } from '@/services/sessions/build-session-transcript'
import { getSessionById } from '@/services/sessions/get-session-by-id'
import { getSessionMessages } from '@/services/sessions/get-session-messages'

type CompleteRequestBody = {
  sessionId?: string
  endedAt?: string
  durationSeconds?: number | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompleteRequestBody

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
        { error: 'Only a live session can be completed' },
        { status: 400 }
      )
    }

    const messages = await getSessionMessages(sessionId)
    const transcriptText = buildSessionTranscript(messages)

    const updatedSession = await completeSession({
      sessionId,
      transcriptText,
      endedAt: body.endedAt,
      durationSeconds: body.durationSeconds ?? null,
    })

    return NextResponse.json({
      ok: true,
      session: updatedSession,
      transcriptText,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}