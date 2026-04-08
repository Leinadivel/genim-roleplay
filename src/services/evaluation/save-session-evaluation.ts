import { createClient } from '@/lib/supabase/server'
import type { EvaluationResult } from '@/types/roleplay'

type SaveSessionEvaluationInput = {
  sessionId: string
  evaluation: EvaluationResult
  rubricItems?: Array<{
    id: string
    category_key: string
    category_label: string
    max_score: number
  }>
}

export async function saveSessionEvaluation(
  input: SaveSessionEvaluationInput
): Promise<void> {
  const supabase = await createClient()

  const { error: deleteScoresError } = await supabase
    .from('session_scores')
    .delete()
    .eq('session_id', input.sessionId)

  if (deleteScoresError) {
    throw new Error(
      `Failed to clear previous session scores: ${deleteScoresError.message}`
    )
  }

  const scoreRows = input.evaluation.categories.map((category) => {
    const matchingRubricItem =
      input.rubricItems?.find(
        (item) => item.category_key === category.category_key
      ) ?? null

    return {
      session_id: input.sessionId,
      rubric_item_id: matchingRubricItem?.id ?? null,
      category_key: category.category_key,
      category_label:
        category.category_label || matchingRubricItem?.category_label || '',
      score: category.score,
      max_score: category.max_score || matchingRubricItem?.max_score || 0,
      feedback: category.feedback,
      evidence: category.evidence,
    }
  })

  if (scoreRows.length > 0) {
    const { error: insertScoresError } = await supabase
      .from('session_scores')
      .insert(scoreRows)

    if (insertScoresError) {
      throw new Error(
        `Failed to save session scores: ${insertScoresError.message}`
      )
    }
  }

  const { error: updateSessionError } = await supabase
    .from('roleplay_sessions')
    .update({
      status: 'evaluated',
      overall_score: input.evaluation.overallScore,
      summary: input.evaluation.summary,
      strengths: input.evaluation.strengths,
      improvements: input.evaluation.improvements,
    })
    .eq('id', input.sessionId)

  if (updateSessionError) {
    throw new Error(
      `Failed to update session evaluation summary: ${updateSessionError.message}`
    )
  }
}