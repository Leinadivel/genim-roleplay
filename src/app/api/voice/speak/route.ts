import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/client'

type SpeakRequestBody = {
  text?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SpeakRequestBody
    const text = body.text?.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }

    const openai = getOpenAIClient()

    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
      format: 'mp3',
    })

    const audioBuffer = Buffer.from(await response.arrayBuffer())

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}