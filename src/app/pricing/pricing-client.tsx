'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

type BillingCycle = 'annual' | 'monthly'

type PaidPlan =
  | 'pro_monthly'
  | 'pro_yearly'
  | 'advanced_monthly'
  | 'advanced_yearly'

function PricingCard({
  title,
  badge,
  price,
  priceNote,
  description,
  features,
  highlight = false,
  ctaLabel,
  ctaHref,
}: {
  title: string
  badge?: string
  price: string
  priceNote: string
  description: string
  features: string[]
  highlight?: boolean
  ctaLabel: string
  ctaHref: string
  planKey?: PaidPlan
}) {
  return (
    <div
      className={`relative rounded-[32px] border bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)] ${
        highlight
          ? 'border-[#d6612d] shadow-[0_22px_60px_rgba(214,97,45,0.14)]'
          : 'border-[#e8ded3]'
      }`}
    >
      {badge ? (
        <div className="absolute -top-3 left-7">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm ${
              highlight ? 'bg-[#d6612d]' : 'bg-[#1f4d38]'
            }`}
          >
            {badge}
          </span>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#181815]">
            {title}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
            {description}
          </p>
        </div>

        {highlight ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
            <Crown className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      <div className="mt-7">
        <div className="text-5xl font-semibold tracking-[-0.05em] text-[#181815]">
          {price}
        </div>
        <div className="mt-2 min-h-[24px] text-sm text-[#666864]">
          {priceNote}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1f4d38]" />
            <span className="text-[15px] leading-7 text-[#4f514d]">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Link
        href={ctaHref}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition ${
          highlight
            ? 'bg-[#d6612d] text-white hover:opacity-95'
            : 'border border-[#d8d1c8] text-[#1f1f1c] hover:bg-[#faf7f3]'
        }`}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function PricingClient({
  isLoggedIn,
}: {
  isLoggedIn: boolean
}) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')
  const isAnnual = billingCycle === 'annual'

  const proPlan: PaidPlan = isAnnual ? 'pro_yearly' : 'pro_monthly'
  const advancedPlan: PaidPlan = isAnnual ? 'advanced_yearly' : 'advanced_monthly'

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2]/90 bg-[#f7f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="flex items-center pr-4 md:pr-6">
            <div className="flex h-10 items-center overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Genim Logo"
                className="h-[200px] w-auto max-w-none object-contain"
              />
            </div>
          </Link>

          <Link
            href={isLoggedIn ? '/scenarios' : '/'}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
          >
            <ArrowLeft className="h-4 w-4" />
            {isLoggedIn ? 'Back to app' : 'Back home'}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-100px] top-[-60px] h-[280px] w-[280px] rounded-full bg-[#d6612d]/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-70px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] px-6 py-16 text-center md:px-10 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <Sparkles className="h-4 w-4" />
            Genim pricing
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
            Choose the plan that fits your sales practice
          </h1>

          <p className="mx-auto mt-5 max-w-[820px] text-base leading-8 text-[#5b5d59] md:text-lg">
            Start free, then upgrade when you are ready for more roleplays,
            deeper practice, and consistent AI coaching. 
            Choose the plan that fits your training volume today, 
            then upgrade as your roleplay needs grow. Annual billing is selected by default for the best value.
          </p>

          <div className="mt-9 flex justify-center">
            <div className="inline-flex items-center rounded-full border border-[#e5dbcf] bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                  !isAnnual
                    ? 'bg-[#1f4d38] text-white'
                    : 'text-[#5f625d] hover:text-[#1f1f1c]'
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                  isAnnual
                    ? 'bg-[#d6612d] text-white'
                    : 'text-[#5f625d] hover:text-[#1f1f1c]'
                }`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-4">
          <PricingCard
            title="Starter"
            price="Free"
            priceNote="5 roleplays total"
            description="For first-time users who want to experience Genim before committing to regular sales practice."
            features={[
              '5 roleplays total',
              'Live AI roleplays',
              'Basic AI coaching',
              'Good for testing the platform',
            ]}
            ctaLabel="Start free"
            ctaHref={isLoggedIn ? '/scenarios' : '/register'}
          />

          <PricingCard
            title="Pro"
            badge={isAnnual ? 'Best value' : undefined}
            price={isAnnual ? '$10' : '$13'}
            priceNote={
              isAnnual ? 'per month, billed annually' : 'per month, billed monthly'
            }
            description="For reps who want consistent practice, stronger objection handling, and ongoing coaching."
            features={[
              '10 roleplays per week',
              'Live AI roleplays',
              'AI coaching',
              'Ideal for consistent weekly practice',
            ]}
            planKey={proPlan}
            ctaLabel={isAnnual ? 'Get Pro Annual' : 'Get Pro Monthly'}
            ctaHref={`/billing/checkout-start?plan=${proPlan}&returnTo=/scenarios`}
          />

          <PricingCard
            title="Advanced"
            badge="Popular"
            price={isAnnual ? '$20' : '$25'}
            priceNote={
              isAnnual ? 'per month, billed annually' : 'per month, billed monthly'
            }
            description="For serious reps who want unlimited repetition, deeper practice, and everything included in Pro."
            features={[
              'Everything in Pro',
              'Unlimited roleplays',
              'Unlimited scenarios',
              'Built for high-frequency practice',
            ]}
            highlight
            planKey={advancedPlan}
            ctaLabel={isAnnual ? 'Get Advanced Annual' : 'Get Advanced Monthly'}
            ctaHref={`/billing/checkout-start?plan=${advancedPlan}&returnTo=/scenarios`}
          />

          <PricingCard
            title="Teams"
            price="Custom"
            priceNote="Built around your team needs"
            description="For sales teams that need manager visibility, structured training, and scalable enablement workflows."
            features={[
              'Team roleplay workflows',
              'Hiring assessment support',
              'Manager reporting direction',
              'Custom rollout and enablement setup',
            ]}
            ctaLabel="Book Demo"
            ctaHref="/book-demo"
          />
        </div>

        <div className="mx-auto mt-10 grid max-w-[1100px] gap-5 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#1b1b18]">
              Upgrade anytime
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#5f625d]">
              Start with the free plan and move to Pro or Advanced when your
              training volume increases.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#1b1b18]">
              Built for practice
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#5f625d]">
              Each plan is designed around realistic sales conversations,
              feedback, and repeatable improvement.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#1b1b18]">
              Teams can scale later
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#5f625d]">
              Teams can book a demo for structured rollout, manager workflows,
              and hiring assessment use cases.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}