import { createClient } from '@/lib/supabase/server'
import { getScenarioBundleById } from '@/services/scenarios/get-scenario-bundle'
import type { Database } from '@/types/database'
import type {
  RoleplaySession,
  StartSessionInput,
  StartSessionResult,
} from '@/types/roleplay'

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

export async function startSession(
  input: StartSessionInput
): Promise<StartSessionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw new Error(`Failed to get authenticated user: ${authError.message}`)
  }

  if (!user) {
    throw new Error('You must be signed in to start a session')
  }

  const scenarioBundle = await getScenarioBundleById(input.scenarioId)

  const { data: session, error: sessionError } = await supabase
    .from('roleplay_sessions')
    .insert({
      user_id: user.id,
      scenario_id: scenarioBundle.scenario.id,
      buyer_persona_id: scenarioBundle.buyerPersona?.id ?? null,
      rubric_id: scenarioBundle.rubricId,
      mode: input.mode ?? 'voice',
      status: 'live',
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (sessionError) {
    throw new Error(`Failed to start session: ${sessionError.message}`)
  }

  return {
    session: mapRoleplaySession(session),
    scenarioBundle,
  }
}