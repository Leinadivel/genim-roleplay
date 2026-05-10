'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import MarketingNavbar from '@/components/marketing-navbar'
import MarketingFooter from '@/components/marketing-footer'

function ContactCard({
  icon: Icon,
  title,
  description,
  email,
}: {
  icon: any
  title: string
  description: string
  email: string
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

      <a
        href={`mailto:${email}`}
        className="mt-6 inline-flex rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
      >
        {email}
      </a>
    </div>
  )
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <MarketingNavbar />

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-100px] top-[-60px] h-[280px] w-[280px] rounded-full bg-[#d6612d]/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-70px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] px-6 py-16 text-center md:px-10 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <Sparkles className="h-4 w-4" />
            Contact Genim
          </div>

          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-[#171714] md:text-5xl">
            Let’s talk about
            <span className="block italic text-[#d6612d]">
              better sales training.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[650px] text-lg leading-6 text-[#5b5d59] md:text-[18px]">
            Whether you want to train your team, assess candidates, run a pilot,
            or ask a technical question — reach out directly.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2">
          <ContactCard
            icon={Mail}
            title="General enquiries"
            description="For product questions, pilots, partnerships, customer support, and sales conversations."
            email="c@geniusnimble.com"
          />

          <ContactCard
            icon={MessageCircle}
            title="Technical contact"
            description="For platform questions, deployment, integrations, email setup, and technical support."
            email="daniel@geniusnimble.com"
          />
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[32px] bg-[#1f4d38] p-8 text-white md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
              Company pilots
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              Want to try Genim with your team?
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Email us with your company name, number of reps, and what you
              want to use Genim for. We can help you set up a pilot workspace.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              ['Company name', 'Tell us the company or team you want to onboard.'],
              ['Team size', 'Share the number of reps, managers, or candidates involved.'],
              ['Use case', 'Tell us if this is for rep training, hiring, onboarding, or coaching.'],
              ['Timeline', 'Let us know when you want to start the pilot.'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[22px] border border-[#e8ded3] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-[#d6612d]" />
                  <h3 className="text-base font-semibold text-[#171714]">
                    {title}
                  </h3>
                </div>

                <p className="mt-2 text-sm leading-7 text-[#666864]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto max-w-[1300px] rounded-[36px] bg-white px-8 py-12 shadow-[0_16px_50px_rgba(28,28,20,0.05)] md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
                <ShieldCheck className="h-4 w-4" />
                We read everything
              </div>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-5xl">
                Questions, feedback, or something that feels broken?
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5f625d]">
                Send it directly. Genim is being built with customers, teams,
                reps, and hiring managers — not in isolation.
              </p>
            </div>

            <Link
              href="mailto:c@geniusnimble.com"
              className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-7 py-4 text-sm font-semibold text-white"
            >
              Email us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  )
}