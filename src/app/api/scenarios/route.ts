import { NextResponse } from 'next/server'

import { listScenarios } from '@/services/scenarios/list-scenarios'

export async function GET() {
  try {
    const scenarios = await listScenarios()

    return NextResponse.json({
      ok: true,
      scenarios,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}