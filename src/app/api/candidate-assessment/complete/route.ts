import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSessionTranscript } from '@/services/sessions/build-session-transcript'
import { completeSession } from '@/services/sessions/complete-session'
import { getOpenAIClient } from '@/lib/openai/client'

type CompleteRequestBody = {
  token?: string
  sessionId?: string
}

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

async function evaluateCandidateSession({
  admin,
  sessionId,
  messages,
}: {
  admin: ReturnType<typeof createAdminClient>
  sessionId: string
  messages: { speaker: string; message_text: string }[]
}) {
  const { data: session, error: sessionError } = await admin
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
    throw new Error(sessionError?.message || 'Session not found for evaluation')
  }

  const sellerMessages = getSellerMessages(messages)

  if (sellerMessages.length === 0) {
    const feedback =
      'No seller response was recorded, so this candidate assessment cannot be evaluated as a completed roleplay.'

    const evaluation = {
      score: 0,
      strengths: [],
      improvements: [
        'The candidate did not give a seller response.',
        'The candidate needs to start the conversation before ending the assessment.',
      ],
      feedback,
    }

    await admin
      .from('roleplay_sessions')
      .update({
        overall_score: evaluation.score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        summary: evaluation.feedback,
        status: 'evaluated',
      })
      .eq('id', sessionId)

    return evaluation
  }

  const sellerWordCount = sellerMessages
    .map((message) => message.message_text.trim().split(/\s+/).length)
    .reduce((sum, count) => sum + count, 0)

  if (sellerWordCount < 8) {
    const feedback =
      'The candidate response was too short to evaluate meaningfully. A complete sales assessment needs enough conversation to judge opening, discovery, objection handling, value communication, and next-step control.'

    const evaluation = {
      score: 15,
      strengths: [],
      improvements: [
        'The candidate gave too little information to demonstrate sales ability.',
        'A stronger attempt would include discovery questions, value explanation, and a clear next step.',
      ],
      feedback,
    }

    await admin
      .from('roleplay_sessions')
      .update({
        overall_score: evaluation.score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        summary: evaluation.feedback,
        status: 'evaluated',
      })
      .eq('id', sessionId)

    return evaluation
  }

  const transcript = messages
    .map((message) => `${message.speaker}: ${message.message_text}`)
    .join('\n')

  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a senior sales hiring assessor and strict but fair sales coach.

Evaluate ONLY the candidate/seller. Do not reward the candidate for what the AI buyer said.

This report will be read by a company manager making a hiring decision, so the feedback must be specific, practical, and evidence-based.

Hard scoring rules:
- If the candidate gave no meaningful response, the score must be 0 to 15.
- If the candidate only gave a very short response, the score must stay below 30.
- Do not invent success. Only score based on what the candidate actually said.
- If the selected roleplay type is Cold Call and the candidate clearly earns a meeting, demo, follow-up, or clear next step, the score should usually be 70 or above.
- If the candidate meets the main objective well, the score should reflect that.
- A score below 30 should only happen if the candidate barely engaged, ignored the buyer, was incoherent, or failed the conversation.
- A score above 85 should only happen when the candidate shows strong opening, relevant discovery, value connection, objection handling, and clear next-step control.
- Penalize generic pitching, weak discovery, no budget/authority/need/timeline qualification, unclear value, weak objection handling, or ending without a next step.

Feedback quality rules:
- Strengths must reference specific things the candidate actually did.
- Improvements must be specific and practical.
- Do NOT say vague things like "ask better questions" without naming the missed area.
- Each improvement should include either the missed sales skill or an example of what the candidate could have said.
- Use plain human coaching language.
- Help the hiring manager understand whether this candidate can sell.

Return JSON ONLY:
{
  "score": number,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement with example", "specific improvement with example"],
  "feedback": "clear overall hiring assessment summary"
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

Candidate message count: ${sellerMessages.length}
Candidate word count: ${sellerWordCount}

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
    throw new Error('Failed to parse candidate evaluation response')
  }

  const evaluation = {
    score: clampScore(parsed.score),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements)
      ? parsed.improvements
      : [],
    feedback: parsed.feedback || '',
  }

  const { error: updateError } = await admin
    .from('roleplay_sessions')
    .update({
      overall_score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      summary: evaluation.feedback,
      status: 'evaluated',
    })
    .eq('id', sessionId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return evaluation
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompleteRequestBody
    const token = body.token?.trim()
    const sessionId = body.sessionId?.trim()

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: 'token and sessionId are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: assessment, error: assessmentError } = await admin
      .from('candidate_roleplay_assessments')
      .select('id')
      .eq('access_token', token)
      .maybeSingle()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Candidate assessment not found' },
        { status: 404 }
      )
    }

    const { data: session, error: sessionError } = await admin
      .from('roleplay_sessions')
      .select('id, status, candidate_assessment_id')
      .eq('id', sessionId)
      .eq('candidate_assessment_id', assessment.id)
      .maybeSingle()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Candidate session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Only a live session can be completed' },
        { status: 400 }
      )
    }

    const { data: messages, error: messagesError } = await admin
      .from('session_messages')
      .select('speaker, message_text')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      )
    }

    const messageRows = messages ?? []

    const transcriptText = buildSessionTranscript(
      messageRows.map((message, index) => ({
        id: String(index),
        session_id: sessionId,
        speaker: message.speaker,
        message_text: message.message_text,
        turn_index: index,
        started_at: null,
        ended_at: null,
        audio_url: null,
        metadata: {},
        created_at: new Date().toISOString(),
      }))
    )

    const updatedSession = await completeSession({
      sessionId,
      transcriptText,
      durationSeconds: null,
    })

    const evaluation = await evaluateCandidateSession({
      admin,
      sessionId,
      messages: messageRows,
    })

    const { error: candidateUpdateError } = await admin
      .from('candidate_roleplay_assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_session_id: sessionId,
      })
      .eq('id', assessment.id)

    if (candidateUpdateError) {
      return NextResponse.json(
        { error: candidateUpdateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      session: updatedSession,
      evaluation,
      transcriptText,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected server error',
      },
      { status: 500 }
    )
  }
}