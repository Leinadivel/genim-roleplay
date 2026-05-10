'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Repeat,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import MarketingNavbar from '@/components/marketing-navbar'
import MarketingFooter from '@/components/marketing-footer'

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className="rounded-[28px] border border-[#e8ded3] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-[#1b1b18]">
        {title}
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
        {description}
      </p>
    </div>
  )
}

export default function SalesCoachingPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <MarketingNavbar />

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-100px] top-[-60px] h-[280px] w-[280px] rounded-full bg-[#d6612d]/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-70px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1300px] gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <Sparkles className="h-4 w-4" />
              Sales coaching
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-[#171714] md:text-5xl">
              Practise the sales moments
              <span className="block italic text-[#d6612d]">
                that decide deals.
              </span>
            </h1>

            <p className="mt-6 max-w-[760px] text-lg leading-7 text-[#5b5d59] md:text-[18px]">
              Genim helps reps practise cold calls, discovery, objections,
              demos, negotiation, and closing conversations with AI buyers and
              structured feedback.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-7 py-4 text-sm font-semibold text-white"
              >
                Start practising
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[#d8d1c8] bg-white px-7 py-4 text-sm font-semibold text-[#1f1f1c]"
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-[#ece4da] bg-white p-7 shadow-[0_30px_100px_rgba(31,31,28,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Coaching loop
            </p>

            <div className="mt-6 space-y-4">
              {[
                ['Choose scenario', 'Cold call, discovery, demo, pricing, or closing'],
                ['Speak to buyer', 'Handle objections, questions, and pushback'],
                ['Get evaluated', 'Review score, strengths, and improvements'],
                ['Repeat', 'Practise until confidence improves'],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-[22px] border border-[#ece4da] bg-[#faf8f5] p-5"
                >
                  <div className="text-lg font-semibold text-[#171714]">
                    {title}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-[#666864]">
                    {body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1300px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <Target className="h-4 w-4" />
              Built for practical improvement
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-4xl">
              Better reps are built through repetition
            </h2>

            <p className="mt-4 text-lg leading-8 text-[#5b5d59]">
              Reading scripts is not enough. Reps need repeated conversations,
              pressure, feedback, and clear improvement loops.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={MessageSquare}
              title="Realistic conversations"
              description="Practise with AI buyers who challenge, stall, object, and react based on your setup."
            />

            <FeatureCard
              icon={TrendingUp}
              title="Feedback that helps"
              description="Get specific feedback on opening, discovery, value communication, objections, and next steps."
            />

            <FeatureCard
              icon={Repeat}
              title="Repeatable improvement"
              description="Retry sessions, improve scores, and build confidence before speaking with real prospects."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[32px] bg-[#1f4d38] p-8 text-white md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
              Coaching focus
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              Train the points where reps usually lose control.
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Genim is designed around the difficult moments: vague buyers,
              pricing pressure, weak discovery, no next step, and poor
              objection handling.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              'Cold outreach and first-call confidence',
              'Discovery depth and qualification clarity',
              'Pricing and competitor objections',
              'Demo conversation control',
              'Negotiation and closing hesitation',
              'Next-step commitment and follow-up discipline',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[22px] border border-[#e8ded3] bg-white px-5 py-5"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#d6612d]" />
                <span className="text-[15px] leading-7 text-[#4f514d]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-6 md:grid-cols-3">
          <div className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <BarChart3 className="h-8 w-8 text-[#d6612d]" />
            <h3 className="mt-5 text-2xl font-semibold text-[#171714]">
              Scorecards
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
              See how each roleplay was evaluated and where improvement is
              needed.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <Target className="h-8 w-8 text-[#1f4d38]" />
            <h3 className="mt-5 text-2xl font-semibold text-[#171714]">
              Practice scenarios
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
              Focus practice on the exact conversations reps struggle with.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <Repeat className="h-8 w-8 text-[#d6612d]" />
            <h3 className="mt-5 text-2xl font-semibold text-[#171714]">
              Retry and improve
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
              Sales skill improves when reps practise often and review what
              to fix.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto max-w-[1300px] rounded-[36px] bg-[#1f4d38] px-8 py-12 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                Ready to practise?
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Build confidence before the buyer conversation.
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                Start roleplaying realistic sales conversations and get
                feedback after every session.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#1f4d38]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}