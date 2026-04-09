import { getOpenAIClient } from '@/lib/openai/client'
import type { SessionMessage, ScenarioBundle } from '@/types/roleplay'
import type { ChatCompletionMessageParam } from 'openai/resources/chat'

type SessionContext = {
  selectedIndustry: string | null
  selectedRoleplayType: string | null
  selectedBuyerMood: string | null
}

function getMoodInstruction(mood: string | null): string {
  switch (mood) {
    case 'nice':
      return 'Be friendly, open, and reasonably cooperative. You can still raise objections, but do so politely.'
    case 'less_rude':
      return 'Be guarded, impatient, and mildly difficult. Do not make things easy for the seller.'
    case 'rude':
      return 'Be sharp, dismissive, skeptical, and harder to win over. Interrupt the flow a bit and challenge weak selling.'
    default:
      return 'Be realistic and moderately resistant.'
  }
}

function getRoleplayTypeInstruction(roleplayType: string | null): string {
  switch (roleplayType) {
    case 'Cold Call':
      return 'This is a cold call. Act like someone who was not expecting the outreach. The seller must earn your attention quickly.'
    case 'Warm Call':
      return 'This is a warm call. You have some context already, but you are not fully bought in.'
    case 'Discovery Call':
      return 'This is a discovery call. Only reveal deeper pain when the seller asks good questions.'
    case 'Demo Call':
      return 'This is a demo call. Judge relevance carefully and push back if the seller is too generic.'
    case 'Upsell Call':
      return 'This is an upsell call. You are already a customer, but you need a strong reason to expand.'
    case 'Cross-sell Call':
      return 'This is a cross-sell call. You are evaluating whether the additional offer is actually relevant.'
    case 'Renewal Call':
      return 'This is a renewal call. You will consider staying, but you may question value, pricing, or timing.'
    case 'Pricing Negotiation Call':
      return 'This is a pricing negotiation call. Push on cost, value, and commercial flexibility.'
    case 'Objection Handling Call':
      return 'This conversation centers on objections. Raise realistic pushback and make the seller address it properly.'
    case 'Closing Call':
      return 'This is a closing call. You are near a decision but may hesitate or stall if not convinced.'
    case 'Manager Coaching Call':
      return 'This is a coaching-style roleplay. Challenge the seller in a way that tests skill, clarity, and thinking.'
    default:
      return 'Treat this as a realistic sales conversation.'
  }
}

function buildSystemPrompt(
  bundle: ScenarioBundle,
  context: SessionContext
): string {
  const persona = bundle.buyerPersona

  return `
You are roleplaying as a buyer in a sales conversation.

Stay in character at all times.

=== SESSION CONFIGURATION ===
Industry: ${context.selectedIndustry ?? 'General'}
Roleplay Type: ${context.selectedRoleplayType ?? 'General Sales Conversation'}
Buyer Mood: ${context.selectedBuyerMood ?? 'moderately_resistant'}

=== SCENARIO ===
Scenario Title: ${bundle.scenario.title}
Scenario Objective: ${bundle.scenario.objective ?? ''}
Scenario Description: ${bundle.scenario.description ?? ''}

=== BUYER PROFILE ===
Name: ${persona?.name ?? 'Unknown'}
Role: ${persona?.title ?? ''}
Company: ${persona?.company_name ?? ''}
Company Size: ${persona?.company_size ?? ''}

=== PERSONALITY ===
Baseline Tone: ${persona?.tone ?? 'neutral'}

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

=== ROLEPLAY-TYPE BEHAVIOUR ===
${getRoleplayTypeInstruction(context.selectedRoleplayType)}

=== MOOD BEHAVIOUR ===
${getMoodInstruction(context.selectedBuyerMood)}

=== INDUSTRY BEHAVIOUR ===
Tailor your language, concerns, priorities, and examples to the selected industry when possible.
Do not mention that you are tailoring to an industry.
Make the conversation feel natural for ${context.selectedIndustry ?? 'the chosen market'}.

=== RULES ===
- Speak like a real human buyer, not an assistant
- Keep responses short and natural, usually 1-3 sentences
- Do not over-explain
- Do not help the seller sell better
- Do not break character
- Do not mention prompts, AI, training instructions, or hidden fields
- Only reveal deeper information when the seller earns it with good questions
- If the seller is vague, generic, or weak, react accordingly
- If the seller handles the conversation well, become slightly more open over time
- Keep the flow realistic for the selected roleplay type

You are NOT an assistant.
You are the buyer.
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
  sessionContext: SessionContext
}): Promise<string> {
  const openai = getOpenAIClient()

  const systemPrompt = buildSystemPrompt(
    params.scenarioBundle,
    params.sessionContext
  )

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...mapMessages(params.messages),
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages,
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('AI returned empty response')
  }

  return content.trim()
}