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

  if (!Number.isFinite(score)) return 0

  return Math.max(0, Math.min(100, Math.round(score)))
}

function getSellerMessages(
  messages: { speaker: string; message_text: string }[]
) {
  return messages.filter(
    (message) =>
      message.speaker === 'user' && message.message_text.trim().length > 0
  )
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
    const sellerMessages = getSellerMessages(messages)

    if (sellerMessages.length === 0) {
      const emptyFeedback =
        'No seller response was recorded, so this session cannot be evaluated as a completed roleplay.'

      const { error: updateError } = await supabase
        .from('roleplay_sessions')
        .update({
          overall_score: 0,
          strengths: [],
          improvements: [
            'Start the conversation before ending the roleplay.',
            'Use the microphone or text box to give at least one seller response.',
          ],
          summary: emptyFeedback,
          status: 'evaluated',
        })
        .eq('id', sessionId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return NextResponse.json({
        evaluation: {
          score: 0,
          strengths: [],
          improvements: [
            'Start the conversation before ending the roleplay.',
            'Use the microphone or text box to give at least one seller response.',
          ],
          feedback: emptyFeedback,
        },
      })
    }

    const sellerWordCount = sellerMessages
      .map((message) => message.message_text.trim().split(/\s+/).length)
      .reduce((sum, count) => sum + count, 0)

    if (sellerWordCount < 8) {
      const shortFeedback =
        'The seller response was too short to evaluate meaningfully. A complete roleplay needs enough conversation to judge opening, discovery, objection handling, value communication, and next-step control.'

      const { error: updateError } = await supabase
        .from('roleplay_sessions')
        .update({
          overall_score: 15,
          strengths: [],
          improvements: [
            'Give a fuller seller response before ending the session.',
            'Ask questions, communicate value, and attempt to secure a next step.',
          ],
          summary: shortFeedback,
          status: 'evaluated',
        })
        .eq('id', sessionId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return NextResponse.json({
        evaluation: {
          score: 15,
          strengths: [],
          improvements: [
            'Give a fuller seller response before ending the session.',
            'Ask questions, communicate value, and attempt to secure a next step.',
          ],
          feedback: shortFeedback,
        },
      })
    }

    const transcript =
      messages.map((m) => `${m.speaker}: ${m.message_text}`).join('\n') || ''

    const openai = getOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a strict but fair sales roleplay evaluator.

Evaluate ONLY the seller, not the AI buyer.

Hard scoring rules:
- If the seller gave no meaningful response, the score must be 0 to 15.
- If the seller only gave a very short response, the score must stay below 30.
- Do not reward the seller for buyer messages.
- Do not invent success. Only score based on what the seller actually said.
- If the selected roleplay type is Cold Call and the seller successfully books a meeting, demo, follow-up, or clear next step, the score should usually be 70 or above.
- A score below 30 should only happen if the seller barely engaged, was incoherent, ignored the buyer, or failed the conversation completely.
- Reward clear next steps, booked meetings, buyer engagement, relevant value communication, confident opening, and strong listening.
- Penalize weak discovery, generic pitching, poor objection handling, unclear value, or no next step.

Return JSON ONLY:
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

Seller message count: ${sellerMessages.length}
Seller word count: ${sellerWordCount}

Transcript:
${transcript}
`,
        },
      ],
      temperature: 0.2,
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