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

export async function getScenarioBundleById(
  scenarioId: string
): Promise<ScenarioBundle> {
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

  const { data: buyerPersona, error: buyerPersonaError } = await supabase
    .from('buyer_personas')
    .select('*')
    .eq('scenario_id', scenario.id)
    .eq('is_active', true)
    .maybeSingle()

  if (buyerPersonaError) {
    throw new Error(
      `Failed to load buyer persona: ${buyerPersonaError.message}`
    )
  }

  const { data: rubric, error: rubricError } = await supabase
    .from('scoring_rubrics')
    .select('*')
    .eq('scenario_id', scenario.id)
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
    scenario: mapScenario(scenario),
    buyerPersona: buyerPersona ? mapBuyerPersona(buyerPersona) : null,
    rubricId: (rubric as ScoringRubricRow | null)?.id ?? null,
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