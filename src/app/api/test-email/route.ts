import { NextResponse } from 'next/server'
import { resend } from '@/lib/email/resend'

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: 'levidanielchinwendu@gmail.com',
      subject: 'Genim Email Test',
      html: `
        <h1>Genim Email Working</h1>
        <p>Your Resend setup is successful.</p>
      `,
    })

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error,
    })
  }
}