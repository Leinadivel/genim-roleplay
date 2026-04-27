import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type SpeakRequestBody = {
  text?: string
  gender?: string | null
  voiceId?: string | null
  buyerName?: string | null
}

const FEMALE_NAME_HINTS = [
  'aisha',
  'sarah',
  'rachel',
  'maya',
  'emily',
  'lena',
  'priya',
  'tara',
  'nina',
  'helen',
  'claire',
  'mia',
  'grace',
  'naomi',
  'bianca',
  'elena',
  'anita',
  'sophie',
  'victoria',
  'monica',
  'ivy',
  'laura',
  'nadia',
  'carmen',
  'olivia',
  'leah',
  'hannah',
  'molly',
  'jasmine',
  'tina',
  'amara',
  'renee',
  'celeste',
  'paige',
  'ariana',
  'melissa',
  'joanna',
  'isabel',
  'natalie',
  'julia',
  'megan',
]

function inferGenderFromName(name: string | null | undefined) {
  if (!name) return null

  const firstName = name.trim().split(/\s+/)[0]?.toLowerCase()

  if (!firstName) return null

  if (FEMALE_NAME_HINTS.includes(firstName)) {
    return 'female'
  }

  return 'male'
}

function getVoice({
  gender,
  voiceId,
  buyerName,
}: {
  gender?: string | null
  voiceId?: string | null
  buyerName?: string | null
}) {
  if (voiceId) return voiceId

  const resolvedGender = gender || inferGenderFromName(buyerName)

  if (resolvedGender === 'female') {
    return 'nova'
  }

  return 'onyx'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SpeakRequestBody

    const text = body.text?.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const voice = getVoice({
      gender: body.gender,
      voiceId: body.voiceId,
      buyerName: body.buyerName,
    })

    const audio = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice,
      input: text,
      instructions:
        body.gender === 'female'
          ? 'Speak like a realistic professional female buyer in a sales conversation. Natural, concise, and human.'
          : 'Speak like a realistic professional male buyer in a sales conversation. Natural, concise, and human.',
    })

    const audioBuffer = Buffer.from(await audio.arrayBuffer())

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate voice',
      },
      { status: 500 }
    )
  }
}