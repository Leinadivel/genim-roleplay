import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/client'
import { getSessionMessages } from '@/services/sessions/get-session-messages'
import { createClient } from '@/lib/supabase/server'

type EvaluationPayload = {
  score: number
  strengths: string[]
  improvements: string[]
  feedback: string
}

function clampScore(value: unknown) {
  const score = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(score)) return 50

  return Math.max(0, Math.min(100, Math.round(score)))
}

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId?: string }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: session, error: sessionError } = await supabase
      .from('roleplay_sessions')
      .select(
        `
        id,
        selected_roleplay_type,
        selected_industry,
        selected_buyer_role,
        selected_buyer_mood,
        selected_deal_size,
        selected_pain_level,
        selected_company_stage,
        selected_time_pressure
      `
      )
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError || !session) {
      throw new Error(sessionError?.message || 'Session not found')
    }

    const messages = await getSessionMessages(sessionId)

    const transcript =
      messages.map((m) => `${m.speaker}: ${m.message_text}`).join('\n') || ''

    const openai = getOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a strict but fair sales roleplay evaluator.

You must evaluate the seller based on the selected roleplay type, objective, and actual outcome.

Critical scoring rules:
- If the selected roleplay type is Cold Call and the seller successfully books a meeting, demo, follow-up, or clear next step, the score should usually be 70 or above.
- Do not give a very low score if the seller achieved the main objective.
- A score below 30 should only happen if the seller barely engaged, was incoherent, ignored the buyer, or failed the conversation completely.
- Reward clear next steps, booked meetings, buyer engagement, relevant value communication, confident opening, and strong listening.
- Penalize weak discovery, generic pitching, poor objection handling, unclear value, or no next step.
- Be realistic, not overly harsh.

Return JSON ONLY in this format:
{
  "score": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "feedback": "string"
}`,
        },
        {
          role: 'user',
          content: `
Session context:
Roleplay type: ${session.selected_roleplay_type ?? 'Not specified'}
Industry: ${session.selected_industry ?? 'Not specified'}
Buyer role: ${session.selected_buyer_role ?? 'Not specified'}
Buyer mood: ${session.selected_buyer_mood ?? 'Not specified'}
Deal size: ${session.selected_deal_size ?? 'Not specified'}
Pain level: ${session.selected_pain_level ?? 'Not specified'}
Company stage: ${session.selected_company_stage ?? 'Not specified'}
Time pressure: ${session.selected_time_pressure ?? 'Not specified'}

Transcript:
${transcript}
`,
        },
      ],
      temperature: 0.4,
    })

    const raw = completion.choices[0]?.message?.content || '{}'

    let parsed: EvaluationPayload

    try {
      parsed = JSON.parse(raw) as EvaluationPayload
    } catch {
      throw new Error('Failed to parse evaluation response')
    }

    const score = clampScore(parsed.score)

    const { error: updateError } = await supabase
      .from('roleplay_sessions')
      .update({
        overall_score: score,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements
          : [],
        summary: parsed.feedback || '',
        status: 'evaluated',
      })
      .eq('id', sessionId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json({
      evaluation: {
        score,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements
          : [],
        feedback: parsed.feedback || '',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Evaluation failed' },
      { status: 500 }
    )
  }
}