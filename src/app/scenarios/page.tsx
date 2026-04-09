import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Headphones,
  LogOut,
  Mic,
  ShieldCheck,
  Target,
  Users,
  AudioWaveform,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { listScenarios } from '@/services/scenarios/list-scenarios'

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-[#eef5f0] text-[#1f4d38] border-[#cfe0d5]',
  intermediate: 'bg-[#f7ede6] text-[#d6612d] border-[#efc7b7]',
  advanced: 'bg-[#f4ecef] text-[#8d3d57] border-[#e6c7d2]',
}

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

export default async function ScenariosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const scenarios = await listScenarios()

  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() || 'there'

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="text-[28px] font-semibold tracking-[-0.04em]">
            <span className="text-[#1b1b18]">Gen</span>
            <span className="italic text-[#d6612d]">im</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#5d605b] md:inline">
              Signed in as {user.email}
            </span>
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
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
              Roleplay scenarios
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1] tracking-[-0.04em] text-[#141412] md:text-6xl">
              Welcome back, {fullName}.
            </h1>

            <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#5c5f5a]">
              Choose a scenario and step into a realistic sales conversation.
              Each session is designed to help you practise the moments that
              matter most: discovery, objections, positioning, and closing.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-[#e2d8cd] bg-white px-5 py-4">
                <div className="text-2xl font-semibold text-[#171714]">
                  {scenarios.length}
                </div>
                <div className="mt-1 text-sm text-[#666864]">
                  Available scenarios
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2d8cd] bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-2xl font-semibold text-[#171714]">
                  <Headphones className="h-5 w-5 text-[#1f4d38]" />
                  Voice-first
                </div>
                <div className="mt-1 text-sm text-[#666864]">
                  Built for realistic practice
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2d8cd] bg-white px-5 py-4">
                <div className="flex items-center gap-2 text-2xl font-semibold text-[#171714]">
                  <Users className="h-5 w-5 text-[#d6612d]" />
                  Team-ready
                </div>
                <div className="mt-1 text-sm text-[#666864]">
                  Designed to scale for sales teams
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e6ddd2] bg-white p-7 shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b7e79]">
              What partners should see
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#171714]">
              The product structure is now clear
            </h2>

            <div className="mt-6 space-y-4">
              {[
                'A premium landing page for the public-facing product',
                'A proper login and registration flow',
                'A dedicated scenarios hub after login',
                'A real roleplay session flow ready for API billing',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1f4d38]" />
                  <span className="text-[15px] leading-7 text-[#565954]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-[#cfe0d5] bg-[#eef5f0] p-5">
              <p className="text-sm font-medium text-[#385244]">
                Once OpenAI billing is enabled, this screen connects directly to
                live AI roleplay responses and evaluation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Scenario library
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
                Start practising now
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-[#646661]">
              Select a scenario to begin a session. The roleplay screen is built
              to handle the actual learner-to-buyer conversation flow.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="rounded-[30px] border border-[#e8ded3] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.04)]"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                    <ScenarioIcon slug={scenario.slug} />
                  </div>

                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      difficultyStyles[scenario.difficulty] ??
                      'bg-[#f3f3f1] text-[#4a4c48] border-[#deded9]'
                    }`}
                  >
                    {scenario.difficulty}
                  </div>
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#181815]">
                  {scenario.title}
                </h3>

                <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
                  {scenario.description ?? 'No description available yet.'}
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#eee6dc] bg-[#faf8f5] px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      Industry
                    </div>
                    <div className="mt-2 text-sm font-medium text-[#252623]">
                      {scenario.industry ?? 'N/A'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#eee6dc] bg-[#faf8f5] px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      Objective
                    </div>
                    <div className="mt-2 text-sm font-medium text-[#252623]">
                      {scenario.objective ?? 'Practice roleplay'}
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/session/new?scenarioId=${scenario.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Start scenario
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] px-6 py-3 text-sm font-semibold text-[#2b2c2a]"
                  >
                    View details
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {scenarios.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-[#e8ded3] bg-white p-8 text-center text-[#666864]">
              No scenarios found yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}