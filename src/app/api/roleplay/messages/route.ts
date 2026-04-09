import { NextResponse } from 'next/server'
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

    const messages = await getSessionMessages(sessionId)

    return NextResponse.json({
      ok: true,
      messages,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}