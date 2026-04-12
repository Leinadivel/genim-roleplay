import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { startSession } from '@/services/sessions/start-session'
import type { BuyerMood } from '@/types/roleplay'

type SessionNewPageProps = {
  searchParams: Promise<{
    scenarioId?: string
    mode?: 'voice' | 'text'
    selectedIndustry?: string
    selectedRoleplayType?: string
    selectedBuyerMood?: BuyerMood
    selectedBuyerRole?: string
    selectedDealSize?: string
    selectedPainLevel?: string
    selectedCompanyStage?: string
    selectedTimePressure?: string
  }>
}

export default async function SessionNewPage({
  searchParams,
}: SessionNewPageProps) {
  const params = await searchParams

  const scenarioId = params.scenarioId?.trim()
  const mode = params.mode === 'text' ? 'text' : 'voice'

  const selectedIndustry = params.selectedIndustry?.trim() || null
  const selectedRoleplayType = params.selectedRoleplayType?.trim() || null
  const selectedBuyerRole = params.selectedBuyerRole?.trim() || null
  const selectedDealSize = params.selectedDealSize?.trim() || null
  const selectedPainLevel = params.selectedPainLevel?.trim() || null
  const selectedCompanyStage = params.selectedCompanyStage?.trim() || null
  const selectedTimePressure = params.selectedTimePressure?.trim() || null

  const validMoods: BuyerMood[] = ['nice', 'less_rude', 'rude']
  const selectedBuyerMood = validMoods.includes(
    params.selectedBuyerMood as BuyerMood
  )
    ? (params.selectedBuyerMood as BuyerMood)
    : null

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
    selectedIndustry,
    selectedRoleplayType,
    selectedBuyerMood,
    selectedBuyerRole,
    selectedDealSize,
    selectedPainLevel,
    selectedCompanyStage,
    selectedTimePressure,
  })

  redirect(`/session/${result.session.id}`)
}