'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react'

type TranscriptMessage = {
  id: string
  speaker: 'user' | 'assistant' | 'system'
  text: string
}

type Evaluation = {
  score: number | null
  strengths: string[]
  improvements: string[]
  feedback: string
  status?: string
  scenarioTitle?: string | null
  selectedIndustry?: string | null
  selectedRoleplayType?: string | null
  selectedBuyerMood?: string | null
  selectedBuyerRole?: string | null
  transcript?: TranscriptMessage[]
}

type ReportState = {
  loading: boolean
  error: string | null
  evaluation: Evaluation | null
}

function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score))
  const angle = (safeScore / 100) * 360

  return (
    <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#1f4d38 0deg ${angle}deg, #e8ede9 ${angle}deg 360deg)`,
        }}
      />
      <div className="absolute inset-[12px] rounded-full bg-[#f7f3ee]" />
      <div className="relative z-10 text-center">
        <div className="text-5xl font-semibold tracking-[-0.04em] text-[#171714]">
          {safeScore}%
        </div>
        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7c7f79]">
          Overall score
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_12px_30px_rgba(25,25,20,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
        {icon}
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#1a1a17]">
        {value}
      </div>
      <div className="mt-1 text-sm text-[#666864]">{subtitle}</div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
      <div className="mb-5">
        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
          {title}
        </div>
        <div className="mt-1 text-sm text-[#666864]">{subtitle}</div>
      </div>
      {children}
    </div>
  )
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [state, setState] = useState<ReportState>({
    loading: true,
    error: null,
    evaluation: null,
  })

  async function fetchSavedReport(): Promise<Evaluation | null> {
    const res = await fetch(`/api/roleplay/report?sessionId=${sessionId}`, {
      cache: 'no-store',
    })

    const data = (await res.json()) as {
      report?: Evaluation
      error?: string
    }

    if (!res.ok) {
      throw new Error(data.error || 'Failed to load saved report')
    }

    const report = data.report ?? null

    if (
      report &&
      typeof report.score === 'number' &&
      (report.feedback ||
        report.strengths.length > 0 ||
        report.improvements.length > 0)
    ) {
      return report
    }

    return report
  }

  async function generateEvaluation(): Promise<Evaluation> {
    const res = await fetch('/api/roleplay/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })

    const data = (await res.json()) as {
      evaluation?: Evaluation
      error?: string
    }

    if (!res.ok) {
      throw new Error(data.error || 'Failed to evaluate session')
    }

    if (!data.evaluation) {
      throw new Error('No evaluation returned')
    }

    return data.evaluation
  }

  async function loadReport({
    forceRefresh = false,
  }: { forceRefresh?: boolean } = {}) {
    try {
      setState({
        loading: true,
        error: null,
        evaluation: null,
      })

      const saved = await fetchSavedReport()

      if (saved && !forceRefresh && typeof saved.score === 'number') {
        setState({
          loading: false,
          error: null,
          evaluation: saved,
        })
        return
      }

      const generated = await generateEvaluation()
      const refreshed = await fetchSavedReport()

      setState({
        loading: false,
        error: null,
        evaluation: refreshed ?? generated,
      })
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load report',
        evaluation: null,
      })
    }
  }

  useEffect(() => {
    void loadReport()
  }, [sessionId])

  const scoreLabel = useMemo(() => {
    const score = state.evaluation?.score ?? 0

    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Strong'
    if (score >= 55) return 'Promising'
    return 'Needs work'
  }, [state.evaluation])

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to scenarios
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadReport({ forceRefresh: true })}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate report
            </button>

            <button
              type="button"
              onClick={() => router.push(`/session/${sessionId}`)}
              className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              Back to session
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="mx-auto max-w-[1240px] px-6 py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                Session report
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
                Performance review
              </h1>

              <p className="mt-4 max-w-[720px] text-base leading-8 text-[#5b5d59] md:text-lg">
                Review the session outcome, identify what worked, and see where
                the seller needs sharper execution.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e2d8cd] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Session summary
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                    Scenario
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#2b2c2a]">
                    {state.evaluation?.scenarioTitle || '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                    Industry
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#2b2c2a]">
                    {state.evaluation?.selectedIndustry || '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                    Type
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#2b2c2a]">
                    {state.evaluation?.selectedRoleplayType || '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                    Buyer mood
                  </div>
                  <div className="mt-1 text-sm font-medium capitalize text-[#2b2c2a]">
                    {state.evaluation?.selectedBuyerMood?.replace('_', ' ') ||
                      '—'}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                    Buyer role
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#2b2c2a]">
                    {state.evaluation?.selectedBuyerRole || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[1240px]">
          {state.loading ? (
            <div className="flex min-h-[340px] items-center justify-center rounded-[28px] border border-[#e8ded3] bg-white shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex items-center gap-3 text-[#555854]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Generating report...</span>
              </div>
            </div>
          ) : state.error ? (
            <div className="rounded-[28px] border border-red-300 bg-white p-8 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-red-600">
                Report unavailable
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
                The evaluation could not be generated
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f625d]">
                {state.error}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void loadReport({ forceRefresh: true })}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry report
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/session/${sessionId}`)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a]"
                >
                  Back to session
                </button>
              </div>
            </div>
          ) : state.evaluation ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-6">
                  <SectionCard
                    title="Overall score"
                    subtitle="The top-line result for this session"
                  >
                    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
                      <ScoreRing score={state.evaluation.score ?? 0} />

                      <div className="flex-1">
                        <div className="inline-flex rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-semibold text-[#1f4d38]">
                          {scoreLabel}
                        </div>

                        <p className="mt-4 text-base leading-8 text-[#555854]">
                          This score reflects how well the seller handled the
                          roleplay overall based on the generated coaching
                          review.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <StatCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            title="Strengths"
                            value={String(state.evaluation.strengths.length)}
                            subtitle="Positive points identified"
                          />
                          <StatCard
                            icon={<Target className="h-5 w-5" />}
                            title="Improvements"
                            value={String(state.evaluation.improvements.length)}
                            subtitle="Coaching opportunities found"
                          />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Strengths"
                    subtitle="What the seller did well in this session"
                  >
                    <div className="space-y-3">
                      {state.evaluation.strengths.length > 0 ? (
                        state.evaluation.strengths.map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="flex items-start gap-3 rounded-[18px] border border-[#dce9e1] bg-[#f6fbf8] px-4 py-4"
                          >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1f4d38]" />
                            <span className="text-sm leading-7 text-[#2f4339]">
                              {item}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                          No strengths returned.
                        </div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Coach feedback"
                    subtitle="Summary guidance for this roleplay"
                  >
                    <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-5 py-5 text-sm leading-8 text-[#494b47]">
                      {state.evaluation.feedback}
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-6">
                  <SectionCard
                    title="Improvement areas"
                    subtitle="What to work on next"
                  >
                    <div className="space-y-3">
                      {state.evaluation.improvements.length > 0 ? (
                        state.evaluation.improvements.map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="rounded-[18px] border border-[#f0dfd7] bg-[#fff7f3] px-4 py-4"
                          >
                            <div className="flex items-start gap-3">
                              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#d6612d]" />
                              <span className="text-sm leading-7 text-[#5a473d]">
                                {item}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                          No improvement items returned.
                        </div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Next actions"
                    subtitle="Suggested next move for the seller"
                  >
                    <div className="space-y-3">
                      <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                        <div className="text-sm font-semibold text-[#1a1a17]">
                          Review this session and practise again
                        </div>
                        <div className="mt-1 text-sm leading-7 text-[#5f625d]">
                          Run a second session with the same setup to improve
                          weak moments and reinforce stronger habits.
                        </div>
                      </div>

                      <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                        <div className="text-sm font-semibold text-[#1a1a17]">
                          Change buyer mood or call type
                        </div>
                        <div className="mt-1 text-sm leading-7 text-[#5f625d]">
                          Test the seller against a harder or different roleplay
                          condition to expand range.
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => router.push('/scenarios')}
                        className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
                      >
                        Start another roleplay
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/session/${sessionId}`)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a]"
                      >
                        Return to session
                      </button>
                    </div>
                  </SectionCard>
                </div>
              </div>

              <SectionCard
                title="Transcript"
                subtitle="Review the full roleplay conversation"
              >
                <div className="space-y-4">
                  {state.evaluation.transcript &&
                  state.evaluation.transcript.length > 0 ? (
                    state.evaluation.transcript.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.speaker === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[82%] rounded-[18px] px-4 py-3 text-sm leading-7 shadow-sm ${
                            message.speaker === 'user'
                              ? 'bg-[#d6612d] text-white'
                              : message.speaker === 'assistant'
                              ? 'border border-[#ece4da] bg-white text-[#232320]'
                              : 'border border-[#d8d1c8] bg-[#faf8f5] text-[#555854]'
                          }`}
                        >
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
                            {message.speaker === 'user'
                              ? 'Seller'
                              : message.speaker === 'assistant'
                              ? 'Buyer'
                              : 'System'}
                          </div>
                          <div>{message.text}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                      No transcript available.
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}