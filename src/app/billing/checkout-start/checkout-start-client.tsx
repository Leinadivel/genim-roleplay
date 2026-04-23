'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function isPaidPlan(
  value: string | null
): value is
  | 'pro_monthly'
  | 'pro_yearly'
  | 'advanced_monthly'
  | 'advanced_yearly' {
  return (
    value === 'pro_monthly' ||
    value === 'pro_yearly' ||
    value === 'advanced_monthly' ||
    value === 'advanced_yearly'
  )
}

export default function CheckoutStartClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const plan = searchParams.get('plan')

  const returnTo = useMemo(() => {
    const value = searchParams.get('returnTo')
    return value && value.startsWith('/') ? value : '/scenarios'
  }, [searchParams])

  useEffect(() => {
    async function startCheckout() {
      if (!isPaidPlan(plan)) {
        router.replace(returnTo)
        return
      }

      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start checkout')
        }

        if (!data.url) {
          throw new Error('No checkout URL returned')
        }

        window.location.href = data.url
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start checkout')
      }
    }

    startCheckout()
  }, [plan, returnTo, router])

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-16 text-[#1f1f1c]">
      <div className="mx-auto max-w-[760px] rounded-[28px] border border-[#e8ded3] bg-white p-8 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
        <div className="flex items-center gap-3 text-[#1f4d38]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">
            Starting secure checkout
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
          Redirecting you to Stripe
        </h1>

        <p className="mt-4 text-base leading-8 text-[#5b5d59]">
          Please wait while we prepare your secure subscription checkout.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  )
}