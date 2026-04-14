import { NextResponse } from 'next/server'
import { getSessionWithPersona } from '@/services/sessions/get-session-by-id'

function isBookedCallType(roleplayType: string | null): boolean {
  return [
    'Upsell Call',
    'Pricing Negotiation Call',
    'Closing Call',
    'Renewal Call',
    'Demo Call',
  ].includes(roleplayType ?? '')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    const { session, buyerPersona } = await getSessionWithPersona(sessionId)

    return NextResponse.json({
      session: {
        id: session.id,
        selected_industry: session.selected_industry,
        selected_roleplay_type: session.selected_roleplay_type,
        selected_buyer_mood: session.selected_buyer_mood,
        selected_buyer_role: session.selected_buyer_role,
        selected_deal_size: session.selected_deal_size,
        selected_pain_level: session.selected_pain_level,
        selected_company_stage: session.selected_company_stage,
        selected_time_pressure: session.selected_time_pressure,
        should_ring_first: isBookedCallType(session.selected_roleplay_type),
        buyer_persona: buyerPersona
          ? {
              id: buyerPersona.id,
              name: buyerPersona.name,
              title: buyerPersona.title,
              company_name: buyerPersona.company_name,
              company_size: buyerPersona.company_size,
              avatar_url: buyerPersona.avatar_url,
            }
          : null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to load session',
      },
      { status: 500 }
    )
  }
}