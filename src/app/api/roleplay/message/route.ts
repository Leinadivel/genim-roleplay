import { NextResponse } from 'next/server'

import { appendSessionMessage } from '@/services/sessions/append-session-message'
import { getSessionById } from '@/services/sessions/get-session-by-id'
import { getSessionMessages } from '@/services/sessions/get-session-messages'

type MessageRequestBody = {
  sessionId?: string
  messageText?: string
  startedAt?: string | null
  endedAt?: string | null
  audioUrl?: string | null
  metadata?: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MessageRequestBody

    const sessionId = body.sessionId?.trim()
    const messageText = body.messageText?.trim()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    if (!messageText) {
      return NextResponse.json(
        { error: 'messageText is required' },
        { status: 400 }
      )
    }

    const session = await getSessionById(sessionId)

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Only a live session can accept user messages' },
        { status: 400 }
      )
    }

    const messages = await getSessionMessages(sessionId)

    const nextTurnIndex =
      messages.length > 0
        ? Math.max(...messages.map((message) => message.turn_index)) + 1
        : 0

    const savedMessage = await appendSessionMessage({
      sessionId,
      speaker: 'user',
      messageText,
      turnIndex: nextTurnIndex,
      startedAt: body.startedAt ?? null,
      endedAt: body.endedAt ?? null,
      audioUrl: body.audioUrl ?? null,
      metadata: body.metadata ?? {},
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