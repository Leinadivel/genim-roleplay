import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { SessionScore } from '@/types/roleplay'

type SessionScoreRow = Database['public']['Tables']['session_scores']['Row']

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function mapSessionScore(row: SessionScoreRow): SessionScore {
  return {
    id: row.id,
    session_id: row.session_id,
    rubric_item_id: row.rubric_item_id,
    category_key: row.category_key,
    category_label: row.category_label,
    score: row.score,
    max_score: row.max_score,
    feedback: row.feedback,
    evidence: toStringArray(row.evidence),
    created_at: row.created_at,
  }
}

export async function getSessionScores(
  sessionId: string
): Promise<SessionScore[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_scores')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load session scores: ${error.message}`)
  }

  return (data ?? []).map(mapSessionScore)
}