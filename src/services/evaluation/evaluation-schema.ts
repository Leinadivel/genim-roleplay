import type {
  EvaluationCategoryResult,
  EvaluationResult,
} from '@/types/roleplay'

export const DEFAULT_EVALUATION_CATEGORIES = [
  'opening_rapport',
  'discovery_questions',
  'active_listening',
  'value_communication',
  'objection_handling',
  'confidence_clarity',
  'closing_next_step',
] as const

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export function normalizeEvaluationCategory(
  value: unknown
): EvaluationCategoryResult {
  const category =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    category_key: toString(category.category_key),
    category_label: toString(category.category_label),
    score: toNumber(category.score),
    max_score: toNumber(category.max_score),
    feedback: toString(category.feedback),
    evidence: toStringArray(category.evidence),
  }
}

export function normalizeEvaluationResult(value: unknown): EvaluationResult {
  const result =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  const categories = Array.isArray(result.categories)
    ? result.categories.map(normalizeEvaluationCategory)
    : []

  return {
    overallScore: toNumber(result.overallScore),
    summary: toString(result.summary),
    strengths: toStringArray(result.strengths),
    improvements: toStringArray(result.improvements),
    categories,
  }
}