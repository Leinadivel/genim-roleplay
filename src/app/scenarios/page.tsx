'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  AudioWaveform,
  Brain,
  Headphones,
  LogOut,
  Mic,
  ShieldCheck,
  Target,
  UserRound,
  DollarSign,
  AlertTriangle,
  Building2,
  Clock3,
} from 'lucide-react'
import {
  BUYER_MOOD_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLEPLAY_TYPE_OPTIONS,
  BUYER_ROLE_OPTIONS,
  DEAL_SIZE_OPTIONS,
  PAIN_LEVEL_OPTIONS,
  COMPANY_STAGE_OPTIONS,
  TIME_PRESSURE_OPTIONS,
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
    title: 'Cold Call',
    description: 'Handle an impatient buyer who wants to end the call quickly.',
    industry: 'B2B Sales',
    difficulty: 'beginner',
    objective: 'Keep the buyer engaged and earn a next step.',
  },
  {
    id: 'discovery-surface-pain',
    slug: 'discovery-surface-pain',
    title: 'Discovery',
    description: 'Ask stronger questions to uncover the real business problem.',
    industry: 'B2B Sales',
    difficulty: 'intermediate',
    objective: 'Identify pain, urgency, impact, and current gaps.',
  },
  {
    id: 'objection-too-expensive',
    slug: 'objection-too-expensive',
    title: 'Pricing Objection',
    description: 'Handle pricing pushback without sounding defensive.',
    industry: 'B2B Sales',
    difficulty: 'intermediate',
    objective: 'Defend value and keep the deal moving.',
  },
  {
    id: 'demo-weak-engagement',
    slug: 'demo-weak-engagement',
    title: 'Demo Call',
    description: 'Re-engage a distracted prospect during a product conversation.',
    industry: 'B2B Sales',
    difficulty: 'advanced',
    objective: 'Make the conversation relevant and regain attention.',
  },
  {
    id: 'closing-hesitation',
    slug: 'closing-hesitation',
    title: 'Closing',
    description: 'Handle a buyer who is interested but keeps delaying.',
    industry: 'B2B Sales',
    difficulty: 'advanced',
    objective: 'Reduce hesitation and secure a clear next step.',
  },
]

function ScenarioIcon({ slug }: { slug: string }) {
  if (slug.includes('cold')) return <Mic className="h-5 w-5" />
  if (slug.includes('discovery')) return <Brain className="h-5 w-5" />
  if (slug.includes('objection')) return <ShieldCheck className="h-5 w-5" />
  if (slug.includes('demo')) return <AudioWaveform className="h-5 w-5" />
  return <Target className="h-5 w-5" />
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-3">
      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
        {title}
      </div>
      <div className="mt-1 text-sm text-[#666864]">{subtitle}</div>
    </div>
  )
}

export default function ScenariosPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    SCENARIOS[0].id
  )
  const [selectedIndustry, setSelectedIndustry] = useState<string>('SaaS')
  const [selectedRoleplayType, setSelectedRoleplayType] =
    useState<string>('Cold Call')
  const [selectedBuyerMood, setSelectedBuyerMood] =
    useState<BuyerMood>('nice')
  const [selectedBuyerRole, setSelectedBuyerRole] =
    useState<string>('Head of Sales')
  const [selectedDealSize, setSelectedDealSize] = useState<string>('$10k')
  const [selectedPainLevel, setSelectedPainLevel] =
    useState<string>('moderate')
  const [selectedCompanyStage, setSelectedCompanyStage] =
    useState<string>('Series A & B')
  const [selectedTimePressure, setSelectedTimePressure] =
    useState<string>('15_min')
  const [starting, setStarting] = useState(false)

  const selectedScenario = useMemo(
    () =>
      SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ??
      SCENARIOS[0],
    [selectedScenarioId]
  )

  const selectedPainLevelLabel =
    PAIN_LEVEL_OPTIONS.find((item) => item.value === selectedPainLevel)?.label ??
    selectedPainLevel

  const selectedTimePressureLabel =
    TIME_PRESSURE_OPTIONS.find((item) => item.value === selectedTimePressure)
      ?.label ?? selectedTimePressure

  async function handleStartSession() {
    try {
      setStarting(true)

      const url = `/session/new?scenarioId=${encodeURIComponent(
        selectedScenario.id
      )}&mode=voice&selectedIndustry=${encodeURIComponent(
        selectedIndustry
      )}&selectedRoleplayType=${encodeURIComponent(
        selectedRoleplayType
      )}&selectedBuyerMood=${encodeURIComponent(
        selectedBuyerMood
      )}&selectedBuyerRole=${encodeURIComponent(
        selectedBuyerRole
      )}&selectedDealSize=${encodeURIComponent(
        selectedDealSize
      )}&selectedPainLevel=${encodeURIComponent(
        selectedPainLevel
      )}&selectedCompanyStage=${encodeURIComponent(
        selectedCompanyStage
      )}&selectedTimePressure=${encodeURIComponent(selectedTimePressure)}`

      window.location.href = url
    } finally {
      setStarting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[28px] font-semibold tracking-[-0.04em]"
            >
              <span className="text-[#1b1b18]">Gen</span>
              <span className="italic text-[#d6612d]">im</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-[#ddd4ca] bg-white px-4 py-2 text-sm text-[#555854] md:block">
              Session builder
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
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[920px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                Roleplay setup
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-0.04em] text-[#141412] md:text-6xl">
                Configure the roleplay
                <span className="mt-2 block italic text-[#d6612d]">
                  on one screen.
                </span>
              </h1>

              <p className="mt-4 max-w-[860px] text-base leading-8 text-[#5c5f5a] md:text-lg">
                Choose the market, buyer attitude, buyer role, deal pressure,
                company context, call type, and scenario in one compact layout.
                Every choice updates the live summary instantly.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e2d8cd] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="flex items-center gap-2 text-lg font-semibold text-[#171714]">
                <Headphones className="h-5 w-5 text-[#1f4d38]" />
                Voice-first simulation
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Fast setup, realistic roleplay
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-6 md:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Industry"
                subtitle="Choose the market context"
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                {INDUSTRY_OPTIONS.map((industry) => {
                  const active = industry === selectedIndustry

                  return (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => setSelectedIndustry(industry)}
                      className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
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

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Buyer mood"
                subtitle="Control how friendly or difficult the buyer is"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {BUYER_MOOD_OPTIONS.map((mood) => {
                  const active = mood.value === selectedBuyerMood

                  return (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedBuyerMood(mood.value)}
                      className={`rounded-[16px] border p-4 text-left transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                      }`}
                    >
                      <div className="text-base font-semibold text-[#1a1a17]">
                        {mood.label}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[#5f625d]">
                        {mood.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Buyer role"
                subtitle="Choose who you are selling to"
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {BUYER_ROLE_OPTIONS.map((role) => {
                  const active = role === selectedBuyerRole

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedBuyerRole(role)}
                      className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                        active
                          ? 'border-[#1f4d38] bg-[#eef5f0] text-[#1f4d38]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{role}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Deal size"
                  subtitle="Control commercial weight"
                />
                <div className="grid grid-cols-2 gap-3">
                  {DEAL_SIZE_OPTIONS.map((dealSize) => {
                    const active = dealSize === selectedDealSize

                    return (
                      <button
                        key={dealSize}
                        type="button"
                        onClick={() => setSelectedDealSize(dealSize)}
                        className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'border-[#d6612d] bg-[#fcf3ee] text-[#a84922]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{dealSize}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Pain level"
                  subtitle="Control urgency and buyer pressure"
                />
                <div className="grid grid-cols-1 gap-3">
                  {PAIN_LEVEL_OPTIONS.map((pain) => {
                    const active = pain.value === selectedPainLevel

                    return (
                      <button
                        key={pain.value}
                        type="button"
                        onClick={() => setSelectedPainLevel(pain.value)}
                        className={`rounded-[16px] border p-4 text-left transition ${
                          active
                            ? 'border-[#d6612d] bg-[#fcf3ee]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium text-[#1a1a17]">
                            {pain.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Company stage"
                  subtitle="Add company maturity context"
                />
                <div className="grid grid-cols-2 gap-3">
                  {COMPANY_STAGE_OPTIONS.map((stage) => {
                    const active = stage === selectedCompanyStage

                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedCompanyStage(stage)}
                        className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'border-[#1f4d38] bg-[#eef5f0] text-[#1f4d38]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{stage}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Time pressure"
                  subtitle="Add realism and call pressure"
                />
                <div className="grid grid-cols-1 gap-3">
                  {TIME_PRESSURE_OPTIONS.map((time) => {
                    const active = time.value === selectedTimePressure

                    return (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => setSelectedTimePressure(time.value)}
                        className={`rounded-[16px] border p-4 text-left transition ${
                          active
                            ? 'border-[#1f4d38] bg-[#eef5f0]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium text-[#1a1a17]">
                            {time.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Roleplay type"
                subtitle="Choose the kind of conversation"
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                {ROLEPLAY_TYPE_OPTIONS.map((type) => {
                  const active = type === selectedRoleplayType

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedRoleplayType(type)}
                      className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
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

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Scenario"
                subtitle="Pick the training challenge"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {SCENARIOS.map((scenario) => {
                  const active = scenario.id === selectedScenarioId

                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setSelectedScenarioId(scenario.id)}
                      className={`rounded-[18px] border p-4 text-left transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            active
                              ? 'bg-[#f7e6dc] text-[#d6612d]'
                              : 'bg-white text-[#8d6a55]'
                          }`}
                        >
                          <ScenarioIcon slug={scenario.slug} />
                        </div>

                        <div className="min-w-0">
                          <div className="text-base font-semibold text-[#1a1a17]">
                            {scenario.title}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-[#5f625d]">
                            {scenario.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-6 rounded-[28px] border border-[#e6ddd2] bg-white p-5 shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b7e79]">
                Session summary
              </p>

              <div className="mt-5 rounded-[22px] border border-[#ece4da] bg-[#faf8f5] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                    <ScenarioIcon slug={selectedScenario.slug} />
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-[#181815]">
                      {selectedScenario.title}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[#5f625d]">
                      {selectedScenario.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Industry
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedIndustry}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Buyer mood
                  </div>
                  <div className="mt-1.5 text-sm font-semibold capitalize text-[#1b1b18]">
                    {selectedBuyerMood.replace('_', ' ')}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Buyer role
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedBuyerRole}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Roleplay type
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedRoleplayType}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Deal size
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedDealSize}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Pain level
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedPainLevelLabel}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Company stage
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedCompanyStage}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Time pressure
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {selectedTimePressureLabel}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] border border-[#cfe0d5] bg-[#eef5f0] p-3">
                <div className="text-sm font-semibold text-[#385244]">
                  Training objective
                </div>
                <div className="mt-1.5 text-sm leading-6 text-[#4f6155]">
                  {selectedScenario.objective}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartSession}
                disabled={starting}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {starting ? 'Starting session...' : 'Start roleplay'}
                {!starting ? <ArrowRight className="h-4 w-4" /> : null}
              </button>

              <div className="mt-4 text-center text-xs leading-6 text-[#777a75]">
                Every change on the left updates this summary instantly.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}