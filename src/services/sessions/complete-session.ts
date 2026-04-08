import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { CompleteSessionInput, RoleplaySession } from '@/types/roleplay'

type RoleplaySessionRow = Database['public']['Tables']['roleplay_sessions']['Row']

function mapRoleplaySession(row: RoleplaySessionRow): RoleplaySession {
  return {
    id: row.id,
    user_id: row.user_id,
    scenario_id: row.scenario_id,
    buyer_persona_id: row.buyer_persona_id,
    rubric_id: row.rubric_id,
    mode: row.mode,
    status: row.status,
    started_at: row.started_at,
    ended_at: row.ended_at,
    duration_seconds: row.duration_seconds,
    transcript_text: row.transcript_text,
    summary: row.summary,
    overall_score: row.overall_score,
    strengths: Array.isArray(row.strengths)
      ? row.strengths.filter((item): item is string => typeof item === 'string')
      : [],
    improvements: Array.isArray(row.improvements)
      ? row.improvements.filter(
          (item): item is string => typeof item === 'string'
        )
      : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function completeSession(
  input: CompleteSessionInput
): Promise<RoleplaySession> {
  const supabase = await createClient()

  const { data: existingSession, error: existingSessionError } = await supabase
    .from('roleplay_sessions')
    .select('*')
    .eq('id', input.sessionId)
    .single()

  if (existingSessionError) {
    throw new Error(
      `Failed to load session before completion: ${existingSessionError.message}`
    )
  }

  if (!existingSession) {
    throw new Error('Session not found')
  }

  if (existingSession.status !== 'live') {
    throw new Error('Only a live session can be completed')
  }

  const endedAt = input.endedAt ?? new Date().toISOString()

  const { data: updatedSession, error: updateError } = await supabase
    .from('roleplay_sessions')
    .update({
      status: 'completed',
      transcript_text: input.transcriptText,
      ended_at: endedAt,
      duration_seconds: input.durationSeconds ?? null,
    })
    .eq('id', input.sessionId)
    .select('*')
    .single()

  if (updateError) {
    throw new Error(`Failed to complete session: ${updateError.message}`)
  }

  return mapRoleplaySession(updatedSession)
}