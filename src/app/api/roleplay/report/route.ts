import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionMessages } from '@/services/sessions/get-session-messages'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')?.trim()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const [{ data, error }, messages] = await Promise.all([
      supabase
        .from('roleplay_sessions')
        .select(
          `
          id,
          overall_score,
          strengths,
          improvements,
          summary,
          status,
          selected_industry,
          selected_roleplay_type,
          selected_buyer_mood,
          scenarios (
            title
          )
        `
        )
        .eq('id', sessionId)
        .single(),
      getSessionMessages(sessionId),
    ])

    if (error) {
      throw new Error(error.message)
    }

    const scenarioTitle =
      Array.isArray(data.scenarios) && data.scenarios.length > 0
        ? (data.scenarios[0] as { title?: string }).title ?? null
        : !Array.isArray(data.scenarios) && data.scenarios
        ? (data.scenarios as { title?: string }).title ?? null
        : null

    return NextResponse.json({
      report: {
        score: data.overall_score,
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
        feedback: data.summary ?? '',
        status: data.status,
        scenarioTitle,
        selectedIndustry: data.selected_industry ?? null,
        selectedRoleplayType: data.selected_roleplay_type ?? null,
        selectedBuyerMood: data.selected_buyer_mood ?? null,
        transcript: messages.map((message) => ({
          id: message.id,
          speaker: message.speaker,
          text: message.message_text,
        })),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load report' },
      { status: 500 }
    )
  }
}