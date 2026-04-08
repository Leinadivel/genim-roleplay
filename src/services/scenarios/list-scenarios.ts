import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { ScenarioListItem } from '@/types/roleplay'

type ScenarioRow = Database['public']['Tables']['scenarios']['Row']

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

export async function listScenarios(): Promise<ScenarioListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load scenarios: ${error.message}`)
  }

  return (data ?? []).map(mapScenario)
}