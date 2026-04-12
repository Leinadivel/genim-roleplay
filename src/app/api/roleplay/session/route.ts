import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roleplay_sessions')
    .select(
      `
      id,
      selected_industry,
      selected_roleplay_type,
      selected_buyer_mood,
      selected_buyer_role,
      selected_deal_size,
      selected_pain_level,
      selected_company_stage,
      selected_time_pressure
      `
    )
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ session: data })
}