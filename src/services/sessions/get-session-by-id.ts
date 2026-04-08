import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { RoleplaySession } from '@/types/roleplay'

type RoleplaySessionRow = Database['public']['Tables']['roleplay_sessions']['Row']

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

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
    strengths: toStringArray(row.strengths),
    improvements: toStringArray(row.improvements),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function getSessionById(
  sessionId: string
): Promise<RoleplaySession> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roleplay_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    throw new Error(`Failed to load session: ${error.message}`)
  }

  if (!data) {
    throw new Error('Session not found')
  }

  return mapRoleplaySession(data)
}