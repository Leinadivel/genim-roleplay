'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Building2, Crown, Loader2, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PlanResponse = {
  plan_key: string | null
  status: string | null
  current_period_end: string | null
}

type TeamContext = {
  companyName: string | null
  role: string | null
  status: string | null
  subscriptionStatus: string | null
  currentPeriodEnd: string | null
}

function formatPlan(plan: string | null) {
  if (!plan) return 'Starter'

  return plan
    .replace('_', ' ')
    .replace('pro', 'Pro')
    .replace('advanced', 'Advanced')
    .replace('monthly', 'Monthly')
    .replace('yearly', 'Annual')
}

function formatRole(role: string | null) {
  if (!role) return 'Team member'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatDate(value: string | null) {
  if (!value) return 'No expiry'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function isActiveTeamSubscription(team: TeamContext | null) {
  if (!team) return false
  if (team.subscriptionStatus !== 'active') return false
  if (!team.currentPeriodEnd) return true

  return new Date(team.currentPeriodEnd).getTime() > Date.now()
}

export default function CurrentPlanCard() {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [team, setTeam] = useState<TeamContext | null>(null)

  useEffect(() => {
    async function loadPlan() {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: membership } = await supabase
          .from('company_members')
          .select('company_id, role, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        const teamRes = await fetch('/api/billing/team-context', {
          cache: 'no-store',
        })

        const teamData = await teamRes.json()

        if (teamRes.ok && teamData.team) {
          setTeam(teamData.team)
          return
        }

        const res = await fetch('/api/billing/current-plan', {
          cache: 'no-store',
        })

        const data = await res.json()

        if (res.ok) {
          setPlan(data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [])

  if (team) {
    const active = isActiveTeamSubscription(team)

    return (
      <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Team access
            </div>

            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#181815]">
              <Building2 className="h-5 w-5 text-[#1f4d38]" />
              {team.companyName || 'Team workspace'}
            </div>

            <p className="mt-2 flex items-center gap-2 text-sm text-[#666864]">
              <UserRound className="h-4 w-4 text-[#d6612d]" />
              {formatRole(team.role)} · {active ? 'Active team' : 'Billing required'}
            </p>
          </div>

          <button
            className="inline-flex shrink-0 rounded-full bg-[#1f4d38] px-5 py-3 text-sm font-semibold text-white transition"
          >
            Team member
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            Your plan
          </div>

          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#181815]">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 text-[#d6612d]" />
                {formatPlan(plan?.plan_key ?? null)}
              </>
            )}
          </div>

          <p className="mt-2 text-sm text-[#666864]">
            Expiry / renewal:{' '}
            <span className="font-medium text-[#1f1f1c]">
              {loading ? 'Checking...' : formatDate(plan?.current_period_end ?? null)}
            </span>
          </p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex shrink-0 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Upgrade / Switch
        </Link>
      </div>
    </div>
  )
}