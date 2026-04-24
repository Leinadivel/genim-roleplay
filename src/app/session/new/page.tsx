import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { startSession } from '@/services/sessions/start-session'
import type { BuyerMood } from '@/types/roleplay'

type SessionNewPageProps = {
  searchParams: Promise<{
    scenarioId?: string
    mode?: 'voice' | 'text'
    assignmentId?: string
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

type ActivePlan =
  | 'starter'
  | 'pro_monthly'
  | 'pro_yearly'
  | 'advanced_monthly'
  | 'advanced_yearly'

function isActivePaidSubscription(subscription: {
  status: string | null
  current_period_end: string | null
}) {
  if (subscription.status !== 'active') return false

  if (!subscription.current_period_end) return true

  return new Date(subscription.current_period_end).getTime() > Date.now()
}

function getWeekStartDate() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  return monday.toISOString()
}

async function getUserActivePlan(userId: string): Promise<ActivePlan> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_key, status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  if (!subscription || !isActivePaidSubscription(subscription)) {
    return 'starter'
  }

  if (
    subscription.plan_key === 'pro_monthly' ||
    subscription.plan_key === 'pro_yearly' ||
    subscription.plan_key === 'advanced_monthly' ||
    subscription.plan_key === 'advanced_yearly'
  ) {
    return subscription.plan_key
  }

  return 'starter'
}

async function enforceRoleplayLimit(userId: string, assignmentId: string | null) {
  const supabase = await createClient()
  const plan = await getUserActivePlan(userId)

  // Assigned roleplays should be allowed for team workflows.
  // If you want assignments to also consume limits, remove this block.
  if (assignmentId) {
    return
  }

  if (plan === 'advanced_monthly' || plan === 'advanced_yearly') {
    return
  }

  if (plan === 'pro_monthly' || plan === 'pro_yearly') {
    const weekStart = getWeekStartDate()

    const { count, error } = await supabase
      .from('roleplay_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStart)

    if (error) {
      throw new Error(`Failed to check weekly roleplay usage: ${error.message}`)
    }

    if ((count ?? 0) >= 10) {
      redirect('/pricing?limit=weekly')
    }

    return
  }

  const { count, error } = await supabase
    .from('roleplay_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to check roleplay usage: ${error.message}`)
  }

  if ((count ?? 0) >= 5) {
    redirect('/pricing?limit=starter')
  }
}

export default async function SessionNewPage({
  searchParams,
}: SessionNewPageProps) {
  const params = await searchParams

  const scenarioId = params.scenarioId?.trim()
  const mode = params.mode === 'text' ? 'text' : 'voice'
  const assignmentId = params.assignmentId?.trim() || null

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

  await enforceRoleplayLimit(user.id, assignmentId)

  const result = await startSession({
    scenarioId,
    mode,
    assignmentId,
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