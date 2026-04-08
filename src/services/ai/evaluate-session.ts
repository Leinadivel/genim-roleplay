import { getOpenAIClient } from '@/lib/openai/client'
import type { RubricItem } from '@/types/roleplay'
import { normalizeEvaluationResult } from '@/services/evaluation/evaluation-schema'

function buildRubricText(rubricItems: RubricItem[]): string {
  if (rubricItems.length === 0) {
    return `
Use these default scoring categories:
- opening_rapport
- discovery_questions
- active_listening
- value_communication
- objection_handling
- confidence_clarity
- closing_next_step
`
  }

  return rubricItems
    .map((item) => {
      return `- ${item.category_key} | ${item.category_label} | max_score: ${item.max_score} | guidance: ${item.guidance ?? ''}`
    })
    .join('\n')
}

export async function evaluateSession(params: {
  transcript: string
  rubricItems: RubricItem[]
}){
  const openai = getOpenAIClient()

  const prompt = `
You are an expert sales coach evaluating a learner's sales roleplay session.

Your task:
- score the learner fairly and strictly
- use the provided rubric categories
- base your evaluation only on the transcript
- return valid JSON only
- do not wrap the JSON in markdown

Rubric:
${buildRubricText(params.rubricItems)}

Return JSON in this exact shape:
{
  "overallScore": number,
  "summary": "string",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "categories": [
    {
      "category_key": "string",
      "category_label": "string",
      "score": number,
      "max_score": number,
      "feedback": "string",
      "evidence": ["string"]
    }
  ]
}

Rules:
- overallScore should reflect the total performance across all categories
- strengths must be specific
- improvements must be specific and actionable
- evidence must quote or closely reference moments from the transcript
- keep feedback concise but useful

Transcript:
${params.transcript}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict sales roleplay evaluator that returns JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('AI returned empty evaluation')
  }

  const parsed = JSON.parse(content) as unknown
  return normalizeEvaluationResult(parsed)
}