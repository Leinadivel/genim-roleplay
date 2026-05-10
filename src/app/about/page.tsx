'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import MarketingNavbar from '@/components/marketing-navbar'
import MarketingFooter from '@/components/marketing-footer'

function SectionTitle({
  badge,
  title,
  description,
}: {
  badge: string
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
        {badge}
      </div>

      <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-md leading-8 text-[#5b5d59]">
        {description}
      </p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <MarketingNavbar />

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-100px] top-[-60px] h-[280px] w-[280px] rounded-full bg-[#d6612d]/10 blur-3xl" />

        <div className="absolute bottom-[-80px] left-[-70px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] px-6 py-16 text-center md:px-10 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <Sparkles className="h-4 w-4" />
            About Genim
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#171714] md:text-4xl">
            Sales reps deserve <span className="italic text-[#d6612d]">real practice</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[860px] text-lg leading-7 text-[#5b5d59] md:text-[20px]">
            Genim was built around a simple belief:
            sales reps should be able to practise difficult conversations
            before they happen with real buyers.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
              <Brain className="h-4 w-4" />
              Why we started
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#171714]">
              Most reps are forced to learn during real calls
            </h2>

            <div className="mt-6 space-y-5 text-[17px] leading-9 text-[#5a5d58]">
              <p>
                In most companies, sales reps are expected to improve
                while talking to actual prospects. A few onboarding documents. Some shadowing.
                Maybe a mock call or two. Then suddenly they are expected to handle objections,
                pricing pressure, hesitation, discovery, and closing conversations
                with real buyers. That never made sense to us.
              </p>

              <p>
                Pilots train before flying. Athletes practise before competition.
                Doctors rehearse before surgery. <span className="font-semibold text-[#1f1f1c]">
                  Sales teams should train before revenue conversations too.</span>
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
            <div className="grid gap-5">
              {[
                'Realistic AI buyer conversations',
                'Structured roleplay scoring',
                'Repeatable rep coaching',
                'Sales onboarding support',
                'Hiring assessment workflows',
                'Manager visibility into rep growth',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-[#ece4da] bg-[#faf8f5] px-5 py-4"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[#1f4d38]" />

                  <span className="text-[15px] leading-7 text-[#4f514d]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1300px]">
          <SectionTitle
            badge="What Genim is becoming"
            title="Built for modern sales teams"
            description="Genim is evolving beyond individual practice into a full sales enablement and coaching platform."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-7">
              <Users className="h-8 w-8 text-[#d6612d]" />

              <h3 className="mt-5 text-xl font-semibold text-[#1b1b18]">
                Rep coaching
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
                Help reps practise difficult conversations repeatedly
                until confidence becomes natural.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-7">
              <Target className="h-8 w-8 text-[#1f4d38]" />

              <h3 className="mt-5 text-xl font-semibold text-[#1b1b18]">
                Hiring assessments
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
                Assess candidates using realistic roleplay scenarios instead
                of relying only on interviews.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-7">
              <Building2 className="h-8 w-8 text-[#d6612d]" />

              <h3 className="mt-5 text-xl font-semibold text-[#1b1b18]">
                Team enablement
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
                Give managers structured visibility into coaching,
                onboarding, and rep performance improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto max-w-[1300px] rounded-[36px] bg-[#1f4d38] px-8 py-12 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                Ready to start practising?
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Train for real conversations before they happen
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                Start roleplaying realistic sales conversations with AI buyers
                and structured coaching feedback.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#1f4d38]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/book-demo"
                className="inline-flex rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white"
              >
                Book demo
              </Link>
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}