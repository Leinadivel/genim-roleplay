'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Crown, Loader2 } from 'lucide-react'

type PlanResponse = {
  plan_key: string | null
  status: string | null
  current_period_end: string | null
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

function formatDate(value: string | null) {
  if (!value) return 'No expiry'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default function CurrentPlanCard() {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<PlanResponse | null>(null)

  useEffect(() => {
    async function loadPlan() {
      try {
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