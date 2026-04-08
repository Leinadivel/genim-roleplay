import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { AppendMessageInput, SessionMessage } from '@/types/roleplay'

type SessionMessageRow = Database['public']['Tables']['session_messages']['Row']

function mapSessionMessage(row: SessionMessageRow): SessionMessage {
  return {
    id: row.id,
    session_id: row.session_id,
    speaker: row.speaker,
    message_text: row.message_text,
    turn_index: row.turn_index,
    started_at: row.started_at,
    ended_at: row.ended_at,
    audio_url: row.audio_url,
    metadata:
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: row.created_at,
  }
}

export async function appendSessionMessage(
  input: AppendMessageInput
): Promise<SessionMessage> {
  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from('roleplay_sessions')
    .select('id, status')
    .eq('id', input.sessionId)
    .single()

  if (sessionError) {
    throw new Error(`Failed to verify session: ${sessionError.message}`)
  }

  if (!session) {
    throw new Error('Session not found')
  }

  if (session.status !== 'live') {
    throw new Error('You can only append messages to a live session')
  }

  const { data, error } = await supabase
    .from('session_messages')
    .insert({
      session_id: input.sessionId,
      speaker: input.speaker,
      message_text: input.messageText,
      turn_index: input.turnIndex,
      started_at: input.startedAt ?? null,
      ended_at: input.endedAt ?? null,
      audio_url: input.audioUrl ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to append session message: ${error.message}`)
  }

  return mapSessionMessage(data)
}