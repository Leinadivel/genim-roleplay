import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type {
  BuyerPersona,
  RubricItem,
  ScenarioBundle,
  ScenarioListItem,
} from '@/types/roleplay'

type ScenarioRow = Database['public']['Tables']['scenarios']['Row']
type BuyerPersonaRow = Database['public']['Tables']['buyer_personas']['Row']
type ScoringRubricRow = Database['public']['Tables']['scoring_rubrics']['Row']
type ScoringRubricItemRow =
  Database['public']['Tables']['scoring_rubric_items']['Row']

type PersonaMatchInput = {
  scenarioId: string
  selectedIndustry?: string | null
  selectedBuyerRole?: string | null
  selectedBuyerMood?: string | null
  selectedDealSize?: string | null
  selectedPainLevel?: string | null
  selectedCompanyStage?: string | null
  selectedTimePressure?: string | null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function mapScenario(row: ScenarioRow): ScenarioListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    industry: row.industry,
    difficulty: row.difficulty,
    objective: row.objective,
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
    tone: row.tone,
    background: row.background,
    hidden_pain_points: toStringArray(row.hidden_pain_points),
    common_objections: toStringArray(row.common_objections),
    goals: toStringArray(row.goals),
    constraints: toStringArray(row.constraints),
  }
}

function mapRubricItem(row: ScoringRubricItemRow): RubricItem {
  return {
    id: row.id,
    rubric_id: row.rubric_id,
    category_key: row.category_key,
    category_label: row.category_label,
    max_score: row.max_score,
    weight: row.weight,
    sort_order: row.sort_order,
    guidance: row.guidance,
  }
}

function scorePersonaMatch(
  persona: BuyerPersonaRow,
  input: PersonaMatchInput
): number {
  let score = 0

  if (persona.industry && input.selectedIndustry) {
    if (persona.industry === input.selectedIndustry) score += 30
  }

  if (persona.buyer_role && input.selectedBuyerRole) {
    if (persona.buyer_role === input.selectedBuyerRole) score += 25
  }

  if (persona.buyer_mood && input.selectedBuyerMood) {
    if (persona.buyer_mood === input.selectedBuyerMood) score += 20
  }

  if (persona.deal_size && input.selectedDealSize) {
    if (persona.deal_size === input.selectedDealSize) score += 10
  }

  if (persona.pain_level && input.selectedPainLevel) {
    if (persona.pain_level === input.selectedPainLevel) score += 10
  }

  if (persona.company_stage && input.selectedCompanyStage) {
    if (persona.company_stage === input.selectedCompanyStage) score += 8
  }

  if (persona.time_pressure && input.selectedTimePressure) {
    if (persona.time_pressure === input.selectedTimePressure) score += 7
  }

  score += Math.max(0, 100 - (persona.priority ?? 100))

  return score
}

async function getScenarioById(scenarioId: string): Promise<ScenarioRow> {
  const supabase = await createClient()

  const { data: scenario, error: scenarioError } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', scenarioId)
    .eq('active', true)
    .maybeSingle()

  if (scenarioError) {
    throw new Error(`Failed to load scenario: ${scenarioError.message}`)
  }

  if (!scenario) {
    throw new Error('Scenario not found')
  }

  return scenario
}

async function getRubricBundle(
  scenarioId: string
): Promise<{ rubricId: string | null; rubricItems: RubricItem[] }> {
  const supabase = await createClient()

  const { data: rubric, error: rubricError } = await supabase
    .from('scoring_rubrics')
    .select('*')
    .eq('scenario_id', scenarioId)
    .eq('active', true)
    .maybeSingle()

  if (rubricError) {
    throw new Error(`Failed to load scoring rubric: ${rubricError.message}`)
  }

  let rubricItems: RubricItem[] = []

  if (rubric) {
    const { data: items, error: itemsError } = await supabase
      .from('scoring_rubric_items')
      .select('*')
      .eq('rubric_id', rubric.id)
      .order('sort_order', { ascending: true })

    if (itemsError) {
      throw new Error(`Failed to load rubric items: ${itemsError.message}`)
    }

    rubricItems = (items ?? []).map(mapRubricItem)
  }

  return {
    rubricId: (rubric as ScoringRubricRow | null)?.id ?? null,
    rubricItems,
  }
}

async function getBestMatchingBuyerPersona(
  input: PersonaMatchInput
): Promise<BuyerPersona | null> {
  const supabase = await createClient()

  const { data: personas, error } = await supabase
    .from('buyer_personas')
    .select('*')
    .eq('scenario_id', input.scenarioId)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  if (error) {
    throw new Error(`Failed to load buyer personas: ${error.message}`)
  }

  if (!personas || personas.length === 0) {
    return null
  }

  const ranked = [...personas].sort((a, b) => {
    const scoreA = scorePersonaMatch(a, input)
    const scoreB = scorePersonaMatch(b, input)

    if (scoreA !== scoreB) return scoreB - scoreA

    return (a.priority ?? 100) - (b.priority ?? 100)
  })

  return mapBuyerPersona(ranked[0])
}

export async function getScenarioBundleById(
  scenarioId: string
): Promise<ScenarioBundle> {
  const scenario = await getScenarioById(scenarioId)
  const { rubricId, rubricItems } = await getRubricBundle(scenario.id)
  const buyerPersona = await getBestMatchingBuyerPersona({
    scenarioId: scenario.id,
  })

  return {
    scenario: mapScenario(scenario),
    buyerPersona,
    rubricId,
    rubricItems,
  }
}

export async function getScenarioBundleBySlug(
  slug: string
): Promise<ScenarioBundle> {
  const supabase = await createClient()

  const { data: scenario, error: scenarioError } = await supabase
    .from('scenarios')
    .select('id')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (scenarioError) {
    throw new Error(`Failed to load scenario by slug: ${scenarioError.message}`)
  }

  if (!scenario) {
    throw new Error('Scenario not found')
  }

  return getScenarioBundleById(scenario.id)
}

export async function getScenarioBundleForSelection(
  input: PersonaMatchInput
): Promise<ScenarioBundle> {
  const scenario = await getScenarioById(input.scenarioId)
  const { rubricId, rubricItems } = await getRubricBundle(scenario.id)
  const buyerPersona = await getBestMatchingBuyerPersona(input)

  return {
    scenario: mapScenario(scenario),
    buyerPersona,
    rubricId,
    rubricItems,
  }
}