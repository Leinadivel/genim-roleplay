import { getOpenAIClient } from '@/lib/openai/client'
import type { SessionMessage, ScenarioBundle } from '@/types/roleplay'
import type { ChatCompletionMessageParam } from 'openai/resources/chat'

function buildSystemPrompt(bundle: ScenarioBundle): string {
  const persona = bundle.buyerPersona

  return `
You are roleplaying as a buyer in a sales conversation.

Stay in character at all times.

=== BUYER PROFILE ===
Name: ${persona?.name ?? 'Unknown'}
Role: ${persona?.title ?? ''}
Company: ${persona?.company_name ?? ''}
Company Size: ${persona?.company_size ?? ''}

=== PERSONALITY ===
Tone: ${persona?.tone ?? 'neutral'}

=== BACKGROUND ===
${persona?.background ?? ''}

=== HIDDEN PAIN POINTS ===
${(persona?.hidden_pain_points ?? []).join(', ')}

=== COMMON OBJECTIONS ===
${(persona?.common_objections ?? []).join(', ')}

=== GOALS ===
${(persona?.goals ?? []).join(', ')}

=== CONSTRAINTS ===
${(persona?.constraints ?? []).join(', ')}

=== RULES ===
- Speak like a real human (natural, slightly informal)
- Keep responses short (1–3 sentences)
- Do NOT explain yourself as an AI
- Do NOT break character
- Do NOT help the user sell better
- Be realistic, sometimes resistant
- Only reveal information if asked correctly

You are NOT an assistant.
You are a buyer being spoken to by a sales rep.
`.trim()
}

function mapMessages(
  messages: SessionMessage[]
): ChatCompletionMessageParam[] {
  return messages.map((message): ChatCompletionMessageParam => {
    if (message.speaker === 'user') {
      return {
        role: 'user',
        content: message.message_text,
      }
    }

    if (message.speaker === 'assistant') {
      return {
        role: 'assistant',
        content: message.message_text,
      }
    }

    return {
      role: 'system',
      content: message.message_text,
    }
  })
}

export async function generateBuyerResponse(params: {
  scenarioBundle: ScenarioBundle
  messages: SessionMessage[]
}): Promise<string> {
  const openai = getOpenAIClient()

  const systemPrompt = buildSystemPrompt(params.scenarioBundle)

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...mapMessages(params.messages),
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages,
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('AI returned empty response')
  }

  return content.trim()
}