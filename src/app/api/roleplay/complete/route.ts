import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

    if (updatedSession.assignment_id) {
      const supabase = await createClient()

      const { error: assignmentUpdateError } = await supabase
        .from('team_roleplay_assignments')
        .update({
          status: 'completed',
          completed_session_id: sessionId,
        })
        .eq('id', updatedSession.assignment_id)

      if (assignmentUpdateError) {
        throw new Error(
          `Session completed but failed to update assignment: ${assignmentUpdateError.message}`
        )
      }
    }

    if (updatedSession.candidate_assessment_id) {
      const admin = createAdminClient()

      const { error: candidateUpdateError } = await admin
        .from('candidate_roleplay_assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_session_id: sessionId,
        })
        .eq('id', updatedSession.candidate_assessment_id)

      if (candidateUpdateError) {
        throw new Error(
          `Session completed but failed to update candidate assessment: ${candidateUpdateError.message}`
        )
      }
    }

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