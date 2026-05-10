'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  LineChart,
  Mic,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import MarketingNavbar from '@/components/marketing-navbar'
import MarketingFooter from '@/components/marketing-footer'

function FeatureCard({
  icon: Icon,
  title,
  description,
  tone = 'orange',
}: {
  icon: any
  title: string
  description: string
  tone?: 'orange' | 'green' | 'blue'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-[#eef5f0] text-[#1f4d38]'
      : tone === 'blue'
        ? 'bg-[#eef4ff] text-[#355c9a]'
        : 'bg-[#f7ede6] text-[#d6612d]'

  return (
    <div className="rounded-[30px] bg-white p-7 shadow-[0_14px_45px_rgba(25,25,20,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(25,25,20,0.08)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#171714]">
        {title}
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
        {description}
      </p>
    </div>
  )
}

function OutcomeCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="rounded-[24px] bg-white/90 p-5 shadow-[0_10px_30px_rgba(25,25,20,0.06)]">
      <div className="text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
        {value}
      </div>
      <div className="mt-2 text-sm leading-6 text-[#666864]">{label}</div>
    </div>
  )
}

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <MarketingNavbar />

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-140px] top-[-90px] h-[360px] w-[360px] rounded-full bg-[#d6612d]/15 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[-90px] h-[340px] w-[340px] rounded-full bg-[#1f4d38]/12 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1400px] gap-14 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <Bot className="h-4 w-4" />
              AI sales coaching for teams
            </div>

            <h1 className="mt-6 text-[48px] font-semibold leading-[0.96] tracking-[-0.06em] text-[#171714] md:text-[48px]">
              Build a sales team that practises
              <span className="block italic text-[#d6612d]">
                before pipeline is at risk.
              </span>
            </h1>

            <p className="mt-6 max-w-[760px] text-lg leading-7 text-[#5b5d59] md:text-[18px]">
              Genim gives sales leaders a repeatable AI roleplay system for
              onboarding, coaching, hiring, and performance improvement — so reps
              get sharper before speaking with real prospects.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(214,97,45,0.22)]"
              >
                Request a team pilot
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[#d8d1c8] bg-white px-8 py-4 text-sm font-semibold text-[#1f1f1c]"
              >
                View team pricing
              </Link>
            </div>

            <div className="mt-10 grid max-w-[720px] gap-4 sm:grid-cols-3">
              <OutcomeCard value="7-day" label="pilot workspace for teams" />
              <OutcomeCard value="3 seats" label="owner plus two reps to start" />
              <OutcomeCard value="AI reports" label="scores, feedback, and coaching insight" />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[38px] bg-white p-4 shadow-[0_30px_100px_rgba(31,31,28,0.12)]">
              <div className="relative overflow-hidden rounded-[30px] bg-[#111]">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
                  alt="Sales team collaborating"
                  className="h-[460px] w-full object-cover opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-[24px] bg-white/92 p-5 shadow-xl backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Live team insight
                      </div>

                      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#171714]">
                        Reps are improving after repeated AI practice
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#666864]">
                        Managers can see roleplay completion, score trends, and
                        coaching gaps before real calls happen.
                      </p>
                    </div>

                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d] sm:flex">
                      <BrainCircuit className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -top-4 hidden rounded-[22px] bg-white px-5 py-4 shadow-[0_18px_45px_rgba(25,25,20,0.12)] md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#355c9a]">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171714]">
                    AI buyer roleplay
                  </div>
                  <div className="text-xs text-[#666864]">
                    Discovery call in progress
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-[22px] bg-white px-5 py-4 shadow-[0_18px_45px_rgba(25,25,20,0.12)] md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171714]">
                    Team average: 74%
                  </div>
                  <div className="text-xs text-[#666864]">
                    Coaching gap detected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1300px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <Zap className="h-4 w-4" />
              Why sales teams choose Genim
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-5xl">
              Give every rep a safe place to practise the hard conversations.
            </h2>

            <p className="mt-4 text-lg leading-8 text-[#5b5d59]">
              Most teams only discover rep weaknesses after pipeline has already
              been affected. Genim helps managers catch those gaps earlier.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={ClipboardList}
              title="Assign realistic roleplays"
              description="Managers can assign cold calls, discovery calls, objections, demos, pricing conversations, and closing practice."
            />

            <FeatureCard
              icon={Bot}
              title="AI buyers that push back"
              description="Reps practise with AI buyers who challenge, stall, object, ask questions, and respond like real prospects."
              tone="green"
            />

            <FeatureCard
              icon={BarChart3}
              title="See who needs coaching"
              description="Track scores, completion, latest sessions, and rep-by-rep performance so coaching becomes clearer."
              tone="blue"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[36px] bg-[#1f4d38] p-8 text-white md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
              <LineChart className="h-4 w-4" />
              Team performance
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Stop guessing who is ready for real buyer conversations.
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Genim turns practice into measurable performance. Managers can
              review rep scores, feedback summaries, completed sessions, and
              coaching opportunities from one workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Average team score',
                'Latest rep activity',
                'Completed sessions',
                'Hiring reports',
                'Roleplay assignments',
                'Coaching gaps',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-6 shadow-[0_18px_55px_rgba(25,25,20,0.08)] md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
                  Manager dashboard
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
                  Rep performance overview
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
                <BrainCircuit className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  name: 'Amaka Johnson',
                  role: 'SDR',
                  score: '86%',
                  note: 'Strong discovery and clear next step',
                },
                {
                  name: 'Michael Ade',
                  role: 'BDR',
                  score: '72%',
                  note: 'Good opener, needs stronger objection handling',
                },
                {
                  name: 'Tolu Martins',
                  role: 'Account Executive',
                  score: '58%',
                  note: 'Needs coaching on pricing confidence',
                },
              ].map((rep) => (
                <div
                  key={rep.name}
                  className="rounded-[22px] bg-[#faf8f5] p-5 shadow-[inset_0_0_0_1px_rgba(232,222,211,0.7)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-[#171714]">
                        {rep.name}
                      </div>
                      <div className="mt-1 text-xs text-[#777a75]">
                        {rep.role}
                      </div>
                    </div>

                    <div className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                      {rep.score}
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-6 text-[#666864]">
                    {rep.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1300px]">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <Target className="h-4 w-4" />
                Use cases
              </div>

              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-5xl">
                One platform for training, onboarding, and hiring.
              </h2>

              <p className="mt-5 text-lg leading-8 text-[#5b5d59]">
                Genim helps teams create practical sales practice systems across
                the moments that matter most.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  title: 'New rep onboarding',
                  text: 'Help new reps practise calls before they speak to real prospects.',
                  icon: Users,
                },
                {
                  title: 'Objection handling drills',
                  text: 'Train reps on pricing, competitors, timing, hesitation, and pushback.',
                  icon: ShieldCheck,
                },
                {
                  title: 'Manager-led coaching',
                  text: 'Use AI reports to guide more specific 1:1 coaching conversations.',
                  icon: BrainCircuit,
                },
                {
                  title: 'Candidate assessment',
                  text: 'Assess sales candidates with realistic roleplays before hiring.',
                  icon: Trophy,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] bg-white p-6 shadow-[0_12px_35px_rgba(25,25,20,0.055)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                    <item.icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-[#171714]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#666864]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-3">
          <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_18px_55px_rgba(25,25,20,0.08)] lg:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
              alt="Sales team workshop"
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div className="rounded-[34px] bg-white p-8 shadow-[0_18px_55px_rgba(25,25,20,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
              <Sparkles className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
              Built for the way modern sales teams learn.
            </h2>

            <p className="mt-4 text-[15px] leading-8 text-[#5f625d]">
              Your best reps did not become good by reading sales theory alone.
              They improved through repetition, feedback, confidence, and
              exposure to hard conversations. Genim brings that loop into one
              platform.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto max-w-[1300px] overflow-hidden rounded-[40px] bg-[#1f4d38] text-white shadow-[0_24px_80px_rgba(31,77,56,0.18)]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="p-8 md:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                Team pilot
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                Start with a small team. Prove the value in 7 days.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
                Set up an owner and two reps, assign realistic roleplays, and
                review the first performance reports before moving to a paid
                rollout.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#1f4d38]"
                >
                  Request team pilot
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/hiring-assessments"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white"
                >
                  Explore hiring assessments
                </Link>
              </div>
            </div>

            <div className="hidden h-full lg:block">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80"
                alt="Team planning sales training"
                className="h-full min-h-[420px] w-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}