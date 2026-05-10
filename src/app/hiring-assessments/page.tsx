'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  Star,
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
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

export default function HiringAssessmentsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <MarketingNavbar />

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-100px] top-[-60px] h-[280px] w-[280px] rounded-full bg-[#d6612d]/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-70px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1300px] gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <Briefcase className="h-4 w-4" />
              Hiring assessments
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-[#171714] md:text-5xl">
              See how candidates sell
              <span className="block italic text-[#d6612d]">
                before you hire them.
              </span>
            </h1>

            <p className="mt-6 max-w-[760px] text-lg leading-7 text-[#5b5d59] md:text-[18px]">
              Genim helps hiring teams evaluate candidates through realistic
              AI-powered sales roleplays, not just CVs, interviews, or scripted
              answers.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-7 py-4 text-sm font-semibold text-white"
              >
                Request hiring pilot
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/teams"
                className="inline-flex items-center justify-center rounded-full border border-[#d8d1c8] bg-white px-7 py-4 text-sm font-semibold text-[#1f1f1c]"
              >
                Explore teams
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-[#ece4da] bg-white p-7 shadow-[0_30px_100px_rgba(31,31,28,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Candidate assessment flow
            </p>

            <div className="mt-6 space-y-4">
              {[
                ['1', 'Create candidate assessment link'],
                ['2', 'Candidate completes roleplay privately'],
                ['3', 'AI evaluates the sales conversation'],
                ['4', 'Company reviews score and report'],
              ].map(([number, text]) => (
                <div
                  key={number}
                  className="flex items-center gap-4 rounded-[22px] border border-[#ece4da] bg-[#faf8f5] p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f4d38] text-sm font-semibold text-white">
                    {number}
                  </div>

                  <div className="text-sm font-semibold text-[#171714]">
                    {text}
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
              <Sparkles className="h-4 w-4" />
              Better hiring signal
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-5xl">
              Assess real sales behaviour, not interview performance
            </h2>

            <p className="mt-4 text-lg leading-8 text-[#5b5d59]">
              Interviews tell you how candidates explain selling. Roleplays
              show you how they actually handle pressure.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Briefcase}
              title="Private candidate links"
              description="Send candidates assessment links they can complete without accessing your company dashboard."
            />

            <FeatureCard
              icon={Star}
              title="Scored roleplay reports"
              description="Review candidate scores, strengths, improvement areas, and overall roleplay feedback."
            />

            <FeatureCard
              icon={FileText}
              title="Clear hiring evidence"
              description="Use structured reports to support hiring decisions and reduce guesswork."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[32px] bg-[#1f4d38] p-8 text-white md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
              What you can evaluate
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              See how candidates handle the moments that matter.
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Genim helps hiring teams observe how candidates open, discover
              needs, respond to objections, communicate value, and control next
              steps.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              'Confidence and clarity under pressure',
              'Discovery quality and question control',
              'Objection handling and value communication',
              'Ability to book or secure a clear next step',
              'Professional tone, listening, and buyer empathy',
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
            <ClipboardCheck className="h-8 w-8 text-[#d6612d]" />
            <h3 className="mt-5 text-2xl font-semibold text-[#171714]">
              For SDR/BDR hiring
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
              Test cold call confidence, objection handling, and meeting
              booking ability before hiring.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <ShieldCheck className="h-8 w-8 text-[#1f4d38]" />
            <h3 className="mt-5 text-2xl font-semibold text-[#171714]">
              For sales managers
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
              Give managers better hiring evidence before moving candidates
              forward.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <FileText className="h-8 w-8 text-[#d6612d]" />
            <h3 className="mt-5 text-2xl font-semibold text-[#171714]">
              For founder-led teams
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
              Reduce hiring risk by seeing how candidates sell before giving
              them pipeline.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto max-w-[1300px] rounded-[36px] bg-white px-8 py-12 shadow-[0_16px_50px_rgba(28,28,20,0.05)] md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d6612d]">
                Ready to assess better?
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-5xl">
                Add roleplay evidence to your hiring process.
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5f625d]">
                Give candidates a realistic sales conversation and review the
                report inside your company workspace.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-7 py-4 text-sm font-semibold text-white"
            >
              Contact Genim
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}