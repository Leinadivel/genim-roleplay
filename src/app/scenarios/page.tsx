'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Brain,
  Building2,
  ChevronLeft,
  Headphones,
  LogOut,
  Mic,
  ShieldCheck,
  Target,
  Users,
  AudioWaveform,
} from 'lucide-react'
import {
  BUYER_MOOD_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLEPLAY_TYPE_OPTIONS,
  type BuyerMood,
} from '@/types/roleplay'

type Scenario = {
  id: string
  slug: string
  title: string
  description: string | null
  industry: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  objective: string | null
}

const SCENARIOS: Scenario[] = [
  {
    id: 'cold-call-not-interested',
    slug: 'cold-call-not-interested',
    title: 'Cold Call — Not Interested',
    description:
      'Handle an impatient buyer who wants to end the call quickly.',
    industry: 'B2B Sales',
    difficulty: 'beginner',
    objective:
      'Keep the buyer engaged long enough to uncover pain and earn a next step.',
  },
  {
    id: 'discovery-surface-pain',
    slug: 'discovery-surface-pain',
    title: 'Discovery Call — Surface Pain',
    description:
      'Ask stronger questions to uncover the real business problem.',
    industry: 'B2B Sales',
    difficulty: 'intermediate',
    objective:
      'Identify pain, urgency, business impact, and the current gap.',
  },
  {
    id: 'objection-too-expensive',
    slug: 'objection-too-expensive',
    title: 'Pricing Objection — Too Expensive',
    description:
      'Handle pricing pushback without sounding defensive.',
    industry: 'B2B Sales',
    difficulty: 'intermediate',
    objective:
      'Defend value, reframe cost, and keep the deal moving.',
  },
  {
    id: 'demo-weak-engagement',
    slug: 'demo-weak-engagement',
    title: 'Demo Call — Weak Engagement',
    description:
      'Re-engage a distracted prospect during a product conversation.',
    industry: 'B2B Sales',
    difficulty: 'advanced',
    objective:
      'Make the conversation relevant and connect features to real pain.',
  },
  {
    id: 'closing-hesitation',
    slug: 'closing-hesitation',
    title: 'Closing Call — Hesitation',
    description:
      'Handle a buyer who is interested but keeps delaying.',
    industry: 'B2B Sales',
    difficulty: 'advanced',
    objective:
      'Reduce hesitation and secure a clear next step.',
  },
]

function ScenarioIcon({ slug }: { slug: string }) {
  if (slug.includes('cold')) {
    return <Mic className="h-6 w-6" />
  }

  if (slug.includes('discovery')) {
    return <Brain className="h-6 w-6" />
  }

  if (slug.includes('objection')) {
    return <ShieldCheck className="h-6 w-6" />
  }

  if (slug.includes('demo')) {
    return <AudioWaveform className="h-6 w-6" />
  }

  return <Target className="h-6 w-6" />
}

export default function ScenariosPage() {
  const router = useRouter()

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    SCENARIOS[0].id
  )
  const [selectedIndustry, setSelectedIndustry] = useState<string>('SaaS')
  const [selectedRoleplayType, setSelectedRoleplayType] =
    useState<string>('Cold Call')
  const [selectedBuyerMood, setSelectedBuyerMood] =
    useState<BuyerMood>('nice')
  const [starting, setStarting] = useState(false)

  const selectedScenario = useMemo(
    () => SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? SCENARIOS[0],
    [selectedScenarioId]
  )

  async function handleStartSession() {
    try {
      setStarting(true)

      const response = await fetch(
        `/session/new?scenarioId=${encodeURIComponent(
          selectedScenario.id
        )}&mode=voice&selectedIndustry=${encodeURIComponent(
          selectedIndustry
        )}&selectedRoleplayType=${encodeURIComponent(
          selectedRoleplayType
        )}&selectedBuyerMood=${encodeURIComponent(selectedBuyerMood)}`
      )

      if (response.redirected) {
        window.location.href = response.url
        return
      }

      window.location.href = `/session/new?scenarioId=${encodeURIComponent(
        selectedScenario.id
      )}&mode=voice&selectedIndustry=${encodeURIComponent(
        selectedIndustry
      )}&selectedRoleplayType=${encodeURIComponent(
        selectedRoleplayType
      )}&selectedBuyerMood=${encodeURIComponent(selectedBuyerMood)}`
    } finally {
      setStarting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[28px] font-semibold tracking-[-0.04em]"
            >
              <span className="text-[#1b1b18]">Gen</span>
              <span className="italic text-[#d6612d]">im</span>
            </Link>

            <Link
              href="/"
              className="hidden items-center gap-2 text-sm font-medium text-[#5d605b] md:inline-flex"
            >
              <ChevronLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-[#ddd4ca] bg-white px-4 py-2 text-sm text-[#555854] md:block">
              Voice-first roleplay training
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-14 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
              Session setup
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1] tracking-[-0.04em] text-[#141412] md:text-6xl">
              Build the roleplay before
              <span className="mt-2 block italic text-[#d6612d]">
                the call begins.
              </span>
            </h1>

            <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#5c5f5a]">
              Choose the training situation, the industry context, and the
              buyer’s attitude. This makes the roleplay feel far more realistic
              for sellers and sales teams.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#e2d8cd] bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#171714]">
                  <Building2 className="h-5 w-5 text-[#d6612d]" />
                  Industry
                </div>
                <div className="mt-1 text-sm text-[#666864]">
                  Match the market you sell into
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2d8cd] bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#171714]">
                  <Headphones className="h-5 w-5 text-[#1f4d38]" />
                  Call type
                </div>
                <div className="mt-1 text-sm text-[#666864]">
                  Choose the sales moment to practise
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2d8cd] bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#171714]">
                  <Users className="h-5 w-5 text-[#d6612d]" />
                  Buyer mood
                </div>
                <div className="mt-1 text-sm text-[#666864]">
                  Control how friendly or difficult they are
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e6ddd2] bg-white p-7 shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b7e79]">
              Current setup
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-[#ece4da] bg-[#faf8f5] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Scenario
                </div>
                <div className="mt-2 text-lg font-semibold text-[#181815]">
                  {selectedScenario.title}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ece4da] bg-[#faf8f5] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Industry
                </div>
                <div className="mt-2 text-lg font-semibold text-[#181815]">
                  {selectedIndustry}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ece4da] bg-[#faf8f5] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Roleplay type
                </div>
                <div className="mt-2 text-lg font-semibold text-[#181815]">
                  {selectedRoleplayType}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ece4da] bg-[#faf8f5] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Buyer mood
                </div>
                <div className="mt-2 text-lg font-semibold capitalize text-[#181815]">
                  {selectedBuyerMood.replace('_', ' ')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartSession}
              disabled={starting}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {starting ? 'Starting session...' : 'Start voice roleplay'}
              {!starting ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[30px] border border-[#e8ded3] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.04)]">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              1. Choose a scenario
            </p>
            <div className="mt-6 space-y-4">
              {SCENARIOS.map((scenario) => {
                const active = scenario.id === selectedScenarioId

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`w-full rounded-[24px] border p-5 text-left transition ${
                      active
                        ? 'border-[#d6612d] bg-[#fcf3ee]'
                        : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          active
                            ? 'bg-[#f7e6dc] text-[#d6612d]'
                            : 'bg-white text-[#8d6a55]'
                        }`}
                      >
                        <ScenarioIcon slug={scenario.slug} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-[#1a1a17]">
                          {scenario.title}
                        </div>
                        <div className="mt-1 text-sm leading-7 text-[#5f625d]">
                          {scenario.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[30px] border border-[#e8ded3] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                2. Choose the industry
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {INDUSTRY_OPTIONS.map((industry) => {
                  const active = industry === selectedIndustry

                  return (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => setSelectedIndustry(industry)}
                      className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee] text-[#a84922]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                      }`}
                    >
                      {industry}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#e8ded3] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                3. Choose the roleplay type
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ROLEPLAY_TYPE_OPTIONS.map((type) => {
                  const active = type === selectedRoleplayType

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedRoleplayType(type)}
                      className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                        active
                          ? 'border-[#1f4d38] bg-[#eef5f0] text-[#1f4d38]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#e8ded3] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                4. Choose the buyer mood
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {BUYER_MOOD_OPTIONS.map((mood) => {
                  const active = mood.value === selectedBuyerMood

                  return (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedBuyerMood(mood.value)}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                      }`}
                    >
                      <div className="text-lg font-semibold capitalize text-[#1a1a17]">
                        {mood.label}
                      </div>
                      <div className="mt-2 text-sm leading-7 text-[#5f625d]">
                        {mood.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}