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
          content: `You are a senior sales coach and strict but fair roleplay evaluator.

          Evaluate ONLY the seller. Do not reward the seller for what the AI buyer said.

          Your job is to produce useful coaching, not generic feedback.

          Hard scoring rules:
          - If the seller gave no meaningful response, the score must be 0 to 15.
          - If the seller only gave a very short response, the score must stay below 30.
          - Do not invent success. Only score based on what the seller actually said.
          - If the selected roleplay type is Cold Call and the seller clearly earns a meeting, demo, follow-up, or next step, the score should usually be 70 or above.
          - If the seller meets the main objective well, the score should reflect that.
          - A score below 30 should only happen if the seller barely engaged, ignored the buyer, was incoherent, or failed the conversation.
          - A score above 85 should only happen when the seller shows strong opening, relevant discovery, value connection, objection handling, and clear next-step control.
          - Penalize generic pitching, weak discovery, no budget/authority/need/timeline qualification, unclear value, weak objection handling, or ending without a next step.

          Feedback quality rules:
          - Strengths must reference specific things the seller actually did.
          - Improvements must be specific and practical.
          - Do NOT say vague things like "ask better questions" without naming the missed area.
          - Each improvement should include either:
            1. the missed sales skill, or
            2. an example of what the seller could have said.
          - Use plain human coaching language.
          - Be concise but useful.
          - For hiring assessments, feedback should help a manager understand whether the person can sell, not just whether they spoke well.

          Examples of good improvement wording:
          - "You missed budget qualification. You could have asked: 'What budget range have you set aside for solving this problem?'"
          - "You handled the objection too quickly. A stronger response would be: 'I understand price matters. Can I ask what you are comparing this against?'"
          - "You did not secure a clear next step. You could have said: 'Would it make sense to book 20 minutes on Tuesday to review this with your team?'"
          - "You pitched before discovery. Ask one or two pain questions before explaining the solution."

          Return JSON ONLY:
          {
            "score": number,
            "strengths": ["specific strength 1", "specific strength 2"],
            "improvements": ["specific improvement with example", "specific improvement with example"],
            "feedback": "clear overall coaching summary"
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