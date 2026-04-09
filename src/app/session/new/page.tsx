import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { startSession } from '@/services/sessions/start-session'

type SessionNewPageProps = {
  searchParams: Promise<{
    scenarioId?: string
    mode?: 'voice' | 'text'
  }>
}

export default async function SessionNewPage({
  searchParams,
}: SessionNewPageProps) {
  const params = await searchParams
  const scenarioId = params.scenarioId?.trim()
  const mode = params.mode === 'text' ? 'text' : 'voice'

  if (!scenarioId) {
    redirect('/scenarios')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await startSession({
    scenarioId,
    mode,
  })

  redirect(`/session/${result.session.id}`)
}