import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/send-welcome-email'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      name?: string | null
    }

    const email = body.email?.trim().toLowerCase()
    const name = body.name?.trim() || null

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await sendWelcomeEmail({
      email,
      name,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send welcome email',
      },
      { status: 500 }
    )
  }
}