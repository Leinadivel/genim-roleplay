import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { SessionMessage } from '@/types/roleplay'

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
      row.metadata &&
      typeof row.metadata === 'object' &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: row.created_at,
  }
}

export async function getSessionMessages(
  sessionId: string
): Promise<SessionMessage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load session messages: ${error.message}`)
  }

  return (data ?? []).map(mapSessionMessage)
}