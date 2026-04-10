import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/client'
import { getSessionMessages } from '@/services/sessions/get-session-messages'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId?: string }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
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
          content: `You are a sales coach.

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
          content: transcript,
        },
      ],
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content || '{}'

    let parsed: {
      score: number
      strengths: string[]
      improvements: string[]
      feedback: string
    }

    try {
      parsed = JSON.parse(raw) as {
        score: number
        strengths: string[]
        improvements: string[]
        feedback: string
      }
    } catch {
      throw new Error('Failed to parse evaluation response')
    }

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('roleplay_sessions')
      .update({
        overall_score: parsed.score,
        strengths: parsed.strengths,
        improvements: parsed.improvements,
        summary: parsed.feedback,
        status: 'evaluated',
      })
      .eq('id', sessionId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json({ evaluation: parsed })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Evaluation failed' },
      { status: 500 }
    )
  }
}