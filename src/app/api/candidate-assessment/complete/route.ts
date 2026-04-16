import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSessionTranscript } from '@/services/sessions/build-session-transcript'
import { completeSession } from '@/services/sessions/complete-session'

type CompleteRequestBody = {
  token?: string
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompleteRequestBody
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
      .select('id, status, candidate_assessment_id')
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
        { error: 'Only a live session can be completed' },
        { status: 400 }
      )
    }

    const { data: messages, error: messagesError } = await admin
      .from('session_messages')
      .select('speaker, message_text')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      )
    }

    const transcriptText = buildSessionTranscript(
      (messages ?? []).map((message, index) => ({
        id: String(index),
        session_id: sessionId,
        speaker: message.speaker,
        message_text: message.message_text,
        turn_index: index,
        started_at: null,
        ended_at: null,
        audio_url: null,
        metadata: {},
        created_at: new Date().toISOString(),
      }))
    )

    const updatedSession = await completeSession({
      sessionId,
      transcriptText,
      durationSeconds: null,
    })

    const { error: candidateUpdateError } = await admin
      .from('candidate_roleplay_assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_session_id: sessionId,
      })
      .eq('id', assessment.id)

    if (candidateUpdateError) {
      return NextResponse.json(
        { error: candidateUpdateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      session: updatedSession,
      transcriptText,
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