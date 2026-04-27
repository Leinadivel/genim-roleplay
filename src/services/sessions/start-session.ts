import { createClient } from '@/lib/supabase/server'
import {
  getScenarioBundleBySlug,
  getScenarioBundleForSelection,
} from '@/services/scenarios/get-scenario-bundle'
import type { Database } from '@/types/database'
import type {
  RoleplaySession,
  StartSessionInput,
  StartSessionResult,
} from '@/types/roleplay'

type RoleplaySessionRow =
  Database['public']['Tables']['roleplay_sessions']['Row']

type TeamRoleplayAssignmentRow =
  Database['public']['Tables']['team_roleplay_assignments']['Row']

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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

async function getBuyerPersonaForSelectedRole(input: {
  selectedBuyerRole: string | null
  selectedBuyerName: string | null
  selectedBuyerCompany: string | null
  selectedBuyerAvatar: string | null
  selectedIndustry: string | null
  selectedBuyerMood: string | null
}) {
  if (!input.selectedBuyerRole) return null

  const supabase = await createClient()

  if (input.selectedBuyerName) {
    const { data: exactPersona, error: exactPersonaError } = await supabase
      .from('buyer_personas')
      .select('id')
      .eq('name', input.selectedBuyerName)
      .eq('buyer_role', input.selectedBuyerRole)
      .eq('is_active', true)
      .maybeSingle()

    if (exactPersonaError) {
      throw new Error(
        `Failed to load exact buyer persona: ${exactPersonaError.message}`
      )
    }

    if (exactPersona?.id) {
      return exactPersona.id
    }
  }

  if (input.selectedBuyerRole) {
    const { data: rolePersona, error: rolePersonaError } = await supabase
      .from('buyer_personas')
      .select('id')
      .eq('buyer_role', input.selectedBuyerRole)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (rolePersonaError) {
      throw new Error(
        `Failed to load role-based buyer persona: ${rolePersonaError.message}`
      )
    }

    if (rolePersona?.id) {
      return rolePersona.id
    }
  }

  const firstName = input.selectedBuyerName?.trim().split(/\s+/)[0]?.toLowerCase()
  const gender =
    input.selectedBuyerAvatar?.includes('/women/') ||
    [
      'maya',
      'rachel',
      'emily',
      'sarah',
      'lena',
      'aisha',
      'priya',
      'sophia',
      'tara',
      'nina',
      'helen',
      'claire',
      'mia',
      'grace',
      'naomi',
      'bianca',
      'elena',
      'anita',
      'sophie',
      'victoria',
      'monica',
      'ivy',
      'laura',
      'nadia',
      'carmen',
      'olivia',
      'leah',
      'hannah',
      'molly',
      'jasmine',
      'tina',
      'amara',
      'renee',
      'celeste',
      'paige',
      'ariana',
      'melissa',
      'joanna',
      'isabel',
      'natalie',
      'claire',
      'julia',
      'megan',
    ].includes(firstName || '')
      ? 'female'
      : 'male'

  const voiceId = gender === 'female' ? 'nova' : 'onyx'

  const { data: createdPersona, error: createPersonaError } = await supabase
    .from('buyer_personas')
    .insert({
      scenario_id: null,
      name: input.selectedBuyerName || input.selectedBuyerRole,
      title: input.selectedBuyerRole,
      company_name: input.selectedBuyerCompany || 'Buyer company',
      company_size: null,
      avatar_url: input.selectedBuyerAvatar,
      buyer_role: input.selectedBuyerRole,
      industry: input.selectedIndustry,
      buyer_mood: input.selectedBuyerMood,
      gender,
      voice_id: voiceId,
      tone: input.selectedBuyerMood || 'professional',
      background: `${input.selectedBuyerName || 'This buyer'} is a ${input.selectedBuyerRole} at ${
        input.selectedBuyerCompany || 'their company'
      }.`,
      hidden_pain_points: [],
      common_objections: [],
      goals: [],
      constraints: [],
      is_active: true,
      priority: 50,
    })
    .select('id')
    .single()

  if (createPersonaError) {
    throw new Error(
      `Failed to create buyer persona from selected role: ${createPersonaError.message}`
    )
  }

  return createdPersona.id
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

  const assignmentId = input.assignmentId?.trim() || null

  let assignment: TeamRoleplayAssignmentRow | null = null

  if (assignmentId) {
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('team_roleplay_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('assigned_to_user_id', user.id)
      .in('status', ['assigned', 'in_progress', 'overdue'])
      .maybeSingle()

    if (assignmentError) {
      throw new Error(
        `Failed to validate assignment: ${assignmentError.message}`
      )
    }

    if (!assignmentData) {
      throw new Error('Assignment not found or not available to this user')
    }

    assignment = assignmentData
  }

  let scenarioBundle: StartSessionResult['scenarioBundle']

  if (assignment) {
    scenarioBundle = await getScenarioBundleForSelection({
      scenarioId: assignment.scenario_id,
      selectedIndustry: input.selectedIndustry ?? null,
      selectedBuyerRole: input.selectedBuyerRole ?? null,
      selectedBuyerMood: input.selectedBuyerMood ?? null,
      selectedDealSize: input.selectedDealSize ?? null,
      selectedPainLevel: input.selectedPainLevel ?? null,
      selectedCompanyStage: input.selectedCompanyStage ?? null,
      selectedTimePressure: input.selectedTimePressure ?? null,
    })
  } else if (isUuid(input.scenarioId)) {
    scenarioBundle = await getScenarioBundleForSelection({
      scenarioId: input.scenarioId,
      selectedIndustry: input.selectedIndustry ?? null,
      selectedBuyerRole: input.selectedBuyerRole ?? null,
      selectedBuyerMood: input.selectedBuyerMood ?? null,
      selectedDealSize: input.selectedDealSize ?? null,
      selectedPainLevel: input.selectedPainLevel ?? null,
      selectedCompanyStage: input.selectedCompanyStage ?? null,
      selectedTimePressure: input.selectedTimePressure ?? null,
    })
  } else {
    const baseScenarioBundle = await getScenarioBundleBySlug(input.scenarioId)

    scenarioBundle = await getScenarioBundleForSelection({
      scenarioId: baseScenarioBundle.scenario.id,
      selectedIndustry: input.selectedIndustry ?? null,
      selectedBuyerRole: input.selectedBuyerRole ?? null,
      selectedBuyerMood: input.selectedBuyerMood ?? null,
      selectedDealSize: input.selectedDealSize ?? null,
      selectedPainLevel: input.selectedPainLevel ?? null,
      selectedCompanyStage: input.selectedCompanyStage ?? null,
      selectedTimePressure: input.selectedTimePressure ?? null,
    })
  }

  let buyerPersonaId: string | null = null

  if (assignment?.buyer_persona_id) {
    const { data: assignedPersonaCheck, error: assignedPersonaCheckError } =
      await supabase
        .from('buyer_personas')
        .select('id')
        .eq('id', assignment.buyer_persona_id)
        .eq('is_active', true)
        .maybeSingle()

    if (assignedPersonaCheckError) {
      throw new Error(
        `Failed to validate assigned buyer persona: ${assignedPersonaCheckError.message}`
      )
    }

    buyerPersonaId = assignedPersonaCheck?.id ?? null
  } else {
    buyerPersonaId = await getBuyerPersonaForSelectedRole({
      selectedBuyerRole: input.selectedBuyerRole ?? null,
      selectedBuyerName: input.selectedBuyerName ?? null,
      selectedBuyerCompany: input.selectedBuyerCompany ?? null,
      selectedBuyerAvatar: input.selectedBuyerAvatar ?? null,
      selectedIndustry: input.selectedIndustry ?? null,
      selectedBuyerMood: input.selectedBuyerMood ?? null,
    })
  }

  const { data: session, error: sessionError } = await supabase
    .from('roleplay_sessions')
    .insert({
      user_id: user.id,
      scenario_id: scenarioBundle.scenario.id,
      buyer_persona_id: buyerPersonaId,
      rubric_id: scenarioBundle.rubricId,
      assignment_id: assignment?.id ?? null,
      mode: input.mode ?? 'voice',
      status: 'live',
      started_at: new Date().toISOString(),
      selected_industry: input.selectedIndustry ?? null,
      selected_roleplay_type: input.selectedRoleplayType ?? null,
      selected_buyer_mood: input.selectedBuyerMood ?? null,
      selected_buyer_role: input.selectedBuyerRole ?? null,
      selected_deal_size: input.selectedDealSize ?? null,
      selected_pain_level: input.selectedPainLevel ?? null,
      selected_company_stage: input.selectedCompanyStage ?? null,
      selected_time_pressure: input.selectedTimePressure ?? null,
      candidate_assessment_id: input.candidateAssessmentId ?? null,
    })
    .select('*')
    .single()

  if (sessionError) {
    throw new Error(`Failed to start session: ${sessionError.message}`)
  }

  if (assignment) {
    const { error: assignmentUpdateError } = await supabase
      .from('team_roleplay_assignments')
      .update({
        status: 'in_progress',
      })
      .eq('id', assignment.id)

    if (assignmentUpdateError) {
      throw new Error(
        `Session started but failed to update assignment: ${assignmentUpdateError.message}`
      )
    }
  }

  return {
    session: mapRoleplaySession(session),
    scenarioBundle,
  }
}