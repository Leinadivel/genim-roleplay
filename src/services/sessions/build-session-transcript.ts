import type { SessionMessage } from '@/types/roleplay'

function labelSpeaker(speaker: SessionMessage['speaker']): string {
  switch (speaker) {
    case 'user':
      return 'Learner'
    case 'assistant':
      return 'Buyer'
    case 'system':
      return 'System'
    default:
      return 'Unknown'
  }
}

export function buildSessionTranscript(
  messages: SessionMessage[]
): string {
  return messages
    .slice()
    .sort((a, b) => {
      if (a.turn_index !== b.turn_index) {
        return a.turn_index - b.turn_index
      }

      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
    .map((message) => {
      const speaker = labelSpeaker(message.speaker)
      const text = message.message_text.trim()

      return `${speaker}: ${text}`
    })
    .join('\n\n')
}