import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionMessages } from '@/services/sessions/get-session-messages'

type ScenarioRow = {
  title?: string | null
}

type BuyerPersonaRow = {
  id: string
  name: string | null
  title: string | null
  company_name: string | null
  company_size: string | null
  avatar_url?: string | null
}

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
          scenario_id,
          buyer_persona_id,
          overall_score,
          strengths,
          improvements,
          summary,
          status,
          selected_industry,
          selected_roleplay_type,
          selected_buyer_mood,
          selected_buyer_role,
          selected_deal_size,
          selected_pain_level,
          selected_company_stage,
          selected_time_pressure,
          scenarios (
            title
          )
        `
        )
        .eq('id', sessionId)
        .maybeSingle(),
      getSessionMessages(sessionId),
    ])

    if (error || !data) {
      throw new Error(error?.message || 'Failed to load session report')
    }

    const scenarioTitle =
      Array.isArray(data.scenarios) && data.scenarios.length > 0
        ? ((data.scenarios[0] as ScenarioRow).title ?? null)
        : !Array.isArray(data.scenarios) && data.scenarios
          ? ((data.scenarios as ScenarioRow).title ?? null)
          : null

    let buyerPersona: BuyerPersonaRow | null = null

    if (data.buyer_persona_id) {
      const { data: personaData, error: personaError } = await supabase
        .from('buyer_personas')
        .select('id, name, title, company_name, company_size, avatar_url')
        .eq('id', data.buyer_persona_id)
        .maybeSingle()

      if (personaError) {
        throw new Error(personaError.message)
      }

      buyerPersona = personaData
    }

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
        selectedBuyerRole: data.selected_buyer_role ?? null,
        selectedDealSize: data.selected_deal_size ?? null,
        selectedPainLevel: data.selected_pain_level ?? null,
        selectedCompanyStage: data.selected_company_stage ?? null,
        selectedTimePressure: data.selected_time_pressure ?? null,
        buyerPersona: buyerPersona
          ? {
              id: buyerPersona.id,
              name: buyerPersona.name,
              title: buyerPersona.title,
              company_name: buyerPersona.company_name,
              company_size: buyerPersona.company_size,
              avatar_url: buyerPersona.avatar_url ?? null,
            }
          : null,
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