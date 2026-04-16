import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type MessageRequestBody = {
  token?: string
  sessionId?: string
  messageText?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MessageRequestBody

    const token = body.token?.trim()
    const sessionId = body.sessionId?.trim()
    const messageText = body.messageText?.trim()

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: 'token and sessionId are required' },
        { status: 400 }
      )
    }

    if (!messageText) {
      return NextResponse.json(
        { error: 'messageText is required' },
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
      .select('id, status')
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
        { error: 'Only a live session can accept candidate messages' },
        { status: 400 }
      )
    }

    const { data: existingMessages, error: messagesError } = await admin
      .from('session_messages')
      .select('turn_index')
      .eq('session_id', sessionId)

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      )
    }

    const nextTurnIndex =
      existingMessages && existingMessages.length > 0
        ? Math.max(...existingMessages.map((message) => message.turn_index)) + 1
        : 0

    const { data: savedMessage, error: insertError } = await admin
      .from('session_messages')
      .insert({
        session_id: sessionId,
        speaker: 'user',
        message_text: messageText,
        turn_index: nextTurnIndex,
        metadata: {},
      })
      .select('id, speaker, message_text')
      .single()

    if (insertError || !savedMessage) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to save message' },
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