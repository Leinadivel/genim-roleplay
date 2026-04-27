import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { BuyerPersona, RoleplaySession } from '@/types/roleplay'

type RoleplaySessionRow =
  Database['public']['Tables']['roleplay_sessions']['Row']

type BuyerPersonaRow =
  Database['public']['Tables']['buyer_personas']['Row']

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
    assignment_id: row.assignment_id,
    candidate_assessment_id: row.candidate_assessment_id,
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
    selected_industry: row.selected_industry,
    selected_roleplay_type: row.selected_roleplay_type,
    selected_buyer_mood: row.selected_buyer_mood,
    selected_buyer_role: row.selected_buyer_role,
    selected_deal_size: row.selected_deal_size,
    selected_pain_level: row.selected_pain_level,
    selected_company_stage: row.selected_company_stage,
    selected_time_pressure: row.selected_time_pressure,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapBuyerPersona(row: BuyerPersonaRow): BuyerPersona {
  return {
    id: row.id,
    scenario_id: row.scenario_id,
    name: row.name,
    title: row.title,
    company_name: row.company_name,
    company_size: row.company_size,
    avatar_url: row.avatar_url,
    gender: row.gender,
    voice_id: row.voice_id,
    tone: row.tone,
    background: row.background,
    hidden_pain_points: toStringArray(row.hidden_pain_points),
    common_objections: toStringArray(row.common_objections),
    goals: toStringArray(row.goals),
    constraints: toStringArray(row.constraints),
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
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load session: ${error.message}`)
  }

  if (!data) {
    throw new Error('Session not found or duplicate rows detected')
  }

  return mapRoleplaySession(data)
}

export async function getSessionWithPersona(sessionId: string): Promise<{
  session: RoleplaySession
  buyerPersona: BuyerPersona | null
}> {
  const supabase = await createClient()

  const { data: sessionData, error: sessionError } = await supabase
    .from('roleplay_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    throw new Error(`Failed to load session with persona: ${sessionError.message}`)
  }

  if (!sessionData) {
    throw new Error('Session not found')
  }

  let buyerPersona: BuyerPersona | null = null

  if (sessionData.buyer_persona_id) {
    const { data: personaData, error: personaError } = await supabase
      .from('buyer_personas')
      .select('*')
      .eq('id', sessionData.buyer_persona_id)
      .maybeSingle()

    if (personaError) {
      throw new Error(`Failed to load buyer persona: ${personaError.message}`)
    }

    buyerPersona = personaData ? mapBuyerPersona(personaData) : null
  }

  return {
    session: mapRoleplaySession(sessionData),
    buyerPersona,
  }
}