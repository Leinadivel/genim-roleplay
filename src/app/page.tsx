import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Headphones,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  AudioWaveform,
} from 'lucide-react'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-[16px] font-medium text-[#41433f] transition hover:text-black"
    >
      {children}
    </a>
  )
}

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
      <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-[#5b5d59]">{description}</p>
    </div>
  )
}

function FeedbackBar({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="grid grid-cols-[120px_1fr_42px] items-center gap-3 text-sm">
      <span className="text-[#385244]">{label}</span>
      <div className="h-2 rounded-full bg-[#dbe6df]">
        <div
          className="h-2 rounded-full bg-[#1f4d38]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right font-semibold text-[#385244]">{value}</span>
    </div>
  )
}

function StatCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="rounded-[24px] border border-[#e8ded3] bg-white p-6 shadow-[0_10px_30px_rgba(26,26,20,0.04)]">
      <div className="text-3xl font-semibold tracking-[-0.03em] text-[#181815]">
        {value}
      </div>
      <div className="mt-2 text-sm text-[#646661]">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[#1b1b18]">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f4d38] text-sm font-semibold text-white">
        {number}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[#1c1c19]">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">{description}</p>
    </div>
  )
}

function PricingCard({
  title,
  price,
  description,
  features,
  highlight = false,
}: {
  title: string
  price: string
  description: string
  features: string[]
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-[30px] border p-7 ${
        highlight
          ? 'border-[#d6612d] bg-white shadow-[0_18px_50px_rgba(214,97,45,0.12)]'
          : 'border-[#e8ded3] bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold text-[#181815]">{title}</h3>
        {highlight ? (
          <span className="rounded-full bg-[#f7ede6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#d6612d]">
            Most popular
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-[15px] leading-7 text-[#63655f]">{description}</p>

      <div className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-[#181815]">
        {price}
      </div>
      <div className="mt-1 text-sm text-[#666864]">per month</div>

      <div className="mt-8 space-y-4">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1f4d38]" />
            <span className="text-[15px] leading-7 text-[#4f514d]">{feature}</span>
          </div>
        ))}
      </div>

      <Link
        href="/register"
        className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-sm font-semibold transition ${
          highlight
            ? 'bg-[#d6612d] text-white hover:opacity-95'
            : 'border border-[#d8d1c8] text-[#1f1f1c] hover:bg-[#faf7f3]'
        }`}
      >
        Start free trial
      </Link>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="sticky top-0 z-50 border-b border-[#e6ddd2]/90 bg-[#f7f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="text-[28px] font-semibold tracking-[-0.04em]">
            <span className="text-[#1b1b18]">Gen</span>
            <span className="italic text-[#d6612d]">im</span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#teams">For teams</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-3 text-sm font-medium text-[#41433f] transition hover:text-black md:inline-flex"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="inline-flex rounded-full bg-[#d6612d] px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-[620px] w-[45%] bg-[radial-gradient(circle_at_top_left,_rgba(223,122,72,0.18),_transparent_60%)]" />
        <div className="mx-auto grid max-w-[1400px] gap-16 px-6 py-16 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
              AI-powered sales training
            </div>

            <h1 className="mt-8 text-[60px] font-semibold leading-[0.94] tracking-[-0.05em] text-[#121210] md:text-[88px] lg:text-[100px]">
              <span className="block">Practice selling.</span>
              <span className="block italic text-[#d6612d]">Close more</span>
              <span className="block text-[#1f4d38]">in real life.</span>
            </h1>

            <p className="mt-8 max-w-[740px] text-[22px] leading-[1.7] text-[#4e504c]">
              Genim puts your reps in realistic sales conversations with AI
              buyers who object, challenge, stall, and push back — so when the
              real conversation happens, they know exactly how to respond.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-full bg-[#d6612d] px-8 py-5 text-xl font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Start roleplaying free
                <ArrowRight className="h-5 w-5" />
              </Link>

              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full border border-[#d8d1c8] bg-[#f7f3ee] px-8 py-5 text-xl font-semibold text-[#20211f] transition hover:bg-white"
              >
                <Play className="h-5 w-5" />
                Watch a demo
              </button>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-5">
              <div className="flex -space-x-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7f3ee] bg-[#d6612d] text-sm font-semibold text-white">
                  AK
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7f3ee] bg-[#1f4d38] text-sm font-semibold text-white">
                  MS
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7f3ee] bg-[#5f79c9] text-sm font-semibold text-white">
                  JR
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7f3ee] bg-[#8a6ccf] text-sm font-semibold text-white">
                  LP
                </div>
              </div>

              <p className="text-[28px] font-semibold tracking-[-0.02em] text-[#232320]">
                2,400+ reps{' '}
                <span className="font-normal text-[#666864]">
                  already training on Genim
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[640px] rounded-[30px] border border-[#ece4da] bg-white shadow-[0_24px_80px_rgba(31,31,28,0.08)]">
              <div className="flex items-center justify-between rounded-t-[30px] border-b border-[#ece7df] px-6 py-5">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#f06d5f]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#f2c14f]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#79c26d]" />
                </div>

                <span className="text-lg font-medium text-[#74716d]">
                  Genim Roleplay Session
                </span>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#7b7e79]">
                  Scenario: SaaS — Cold Outreach Call
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f4d38] text-sm font-semibold text-white">
                      AI
                    </div>
                    <div className="max-w-[88%] rounded-[18px] bg-[#f1eee9] px-5 py-4 text-[18px] leading-[1.45] text-[#232320]">
                      Look, I appreciate the call, but we already use Salesforce.
                      I don&apos;t see why we&apos;d switch.
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[88%] rounded-[18px] bg-[#d6612d] px-5 py-4 text-[18px] leading-[1.45] text-white">
                      That&apos;s totally fair — most of our customers came from
                      Salesforce. Can I ask what you wish it did better?
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d6612d] text-sm font-semibold text-white">
                      You
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f4d38] text-sm font-semibold text-white">
                      AI
                    </div>
                    <div className="max-w-[88%] rounded-[18px] bg-[#f1eee9] px-5 py-4 text-[18px] leading-[1.45] text-[#232320]">
                      Honestly? The reporting is a nightmare. It takes my team
                      hours to pull basic pipeline data.
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[18px] border border-[#cfe0d5] bg-[#eef5f0] p-5">
                  <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#385244]">
                    AI Coach Feedback
                  </p>

                  <div className="mt-4 space-y-3">
                    <FeedbackBar label="Objection" value={88} />
                    <FeedbackBar label="Discovery" value={74} />
                    <FeedbackBar label="Tone" value={91} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-6">
        <div className="mx-auto grid max-w-[1400px] gap-5 px-6 md:grid-cols-2 lg:grid-cols-4 md:px-10">
          <StatCard value="5 core scenarios" label="Cold call, discovery, objections, demo, and closing practice" />
          <StatCard value="Instant coaching" label="Structured evaluation with feedback after each session" />
          <StatCard value="Voice-first roadmap" label="Built to feel like a realistic live sales conversation" />
          <StatCard value="Team-ready" label="Designed for reps, managers, and sales enablement teams" />
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <SectionTitle
            badge="How it works"
            title="A simple training loop reps will actually use"
            description="Genim is designed to make deliberate practice feel natural. Start a scenario, handle a realistic buyer, then review exactly what to improve."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StepCard
              number="01"
              title="Pick a scenario"
              description="Choose the exact sales situation you want to practice, from cold outreach to closing hesitation."
            />
            <StepCard
              number="02"
              title="Roleplay with AI"
              description="Talk through a realistic conversation with an AI buyer who thinks, reacts, and pushes back like a real prospect."
            />
            <StepCard
              number="03"
              title="Get scored fast"
              description="Review your opening, discovery, objection handling, confidence, and close with structured feedback."
            />
            <StepCard
              number="04"
              title="Improve over time"
              description="Repeat practice consistently so reps build confidence before live calls, demos, and negotiations."
            />
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <SectionTitle
            badge="Features"
            title="Built for modern sales practice"
            description="This is not generic chatbot talk. Genim is built around the real moments sales teams care about: buyer resistance, message clarity, discovery depth, and next-step control."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <FeatureCard
              icon={<Mic className="h-6 w-6" />}
              title="Voice roleplay foundation"
              description="Designed for natural sales conversations with a voice-first product direction, while keeping structured transcript and scoring behind the scenes."
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Realistic buyer behaviour"
              description="Practice against buyers with different tones, pain points, objections, and levels of resistance instead of robotic, predictable responses."
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Objection coaching"
              description="Train reps to handle pricing pressure, competitor comparisons, hesitation, and weak engagement with more control and confidence."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Instant performance feedback"
              description="Review score breakdowns, strengths, missed opportunities, and category-specific coaching after every completed session."
            />
            <FeatureCard
              icon={<AudioWaveform className="h-6 w-6" />}
              title="Transcript-driven analysis"
              description="Every roleplay can be stored, reviewed, and evaluated so learning becomes measurable instead of anecdotal."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Structured training system"
              description="Built with scenario logic, rubrics, session history, and coaching data so the product is useful for individuals and scalable for teams."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-[#eadfd4] bg-white p-8 shadow-[0_18px_50px_rgba(26,26,20,0.05)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
              <Sparkles className="h-4 w-4" />
              AI coaching focus
            </div>

            <h3 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#171714]">
              Train the moments where reps usually lose the deal
            </h3>

            <p className="mt-5 text-lg leading-8 text-[#5a5d58]">
              Most reps do not fail because they lack enthusiasm. They fail when
              a buyer pushes back, goes quiet, questions pricing, or asks
              something unexpected. Genim is built to strengthen those exact
              moments with repeatable practice.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Cold outreach conversations with immediate resistance',
                'Discovery calls where the buyer is vague or guarded',
                'Price objection conversations with skeptical decision-makers',
                'Demo conversations with distracted or unconvinced prospects',
                'Closing conversations where buyers hesitate or stall',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#d6612d]" />
                  <span className="text-[15px] leading-7 text-[#51534e]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-[#eadfd4] bg-[#f5ede6] p-7">
              <Headphones className="h-8 w-8 text-[#d6612d]" />
              <h4 className="mt-5 text-2xl font-semibold text-[#1b1b18]">
                Practice before live calls
              </h4>
              <p className="mt-3 text-[15px] leading-7 text-[#595c57]">
                Give reps a place to rehearse high-pressure conversations before
                speaking to real prospects.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#eadfd4] bg-white p-7">
              <Users className="h-8 w-8 text-[#1f4d38]" />
              <h4 className="mt-5 text-2xl font-semibold text-[#1b1b18]">
                Great for managers too
              </h4>
              <p className="mt-3 text-[15px] leading-7 text-[#595c57]">
                Sales leaders can use Genim to standardise coaching and make rep
                development more consistent.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#eadfd4] bg-white p-7">
              <Target className="h-8 w-8 text-[#d6612d]" />
              <h4 className="mt-5 text-2xl font-semibold text-[#1b1b18]">
                Focused on conversion moments
              </h4>
              <p className="mt-3 text-[15px] leading-7 text-[#595c57]">
                Every scenario is designed around realistic sales pressure, not
                generic conversation practice.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#eadfd4] bg-[#eef5f0] p-7">
              <BarChart3 className="h-8 w-8 text-[#1f4d38]" />
              <h4 className="mt-5 text-2xl font-semibold text-[#1b1b18]">
                Measurable improvement
              </h4>
              <p className="mt-3 text-[15px] leading-7 text-[#595c57]">
                Turn practice into progress with repeatable scoring, feedback
                loops, and reportable performance trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <SectionTitle
            badge="Pricing"
            title="Simple pricing for reps and teams"
            description="Start with individual practice, then expand into team training once your reps and managers want more structure, reporting, and custom scenarios."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <PricingCard
              title="Starter"
              price="₦0"
              description="For first-time users who want to experience the roleplay workflow and coaching format."
              features={[
                'Access to selected practice scenarios',
                'Basic session flow',
                'Limited evaluation access',
                'Good for initial product trial',
              ]}
            />
            <PricingCard
              title="Pro"
              price="₦7,000"
              description="For individual reps who want consistent practice, better objection handling, and stronger sales confidence."
              features={[
                'Full scenario access',
                'Structured AI feedback',
                'Transcript-based session review',
                'Designed for solo reps and job seekers',
              ]}
              highlight
            />
            <PricingCard
              title="Teams"
              price="Custom"
              description="For sales teams that want manager visibility, shared training structure, and scalable rep development."
              features={[
                'Multi-rep training workflows',
                'Manager reporting direction',
                'Team scenario rollout',
                'Custom enablement setup',
              ]}
            />
          </div>
        </div>
      </section>

      <section id="teams" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1400px] rounded-[36px] border border-[#e4d9cf] bg-white p-8 shadow-[0_16px_50px_rgba(28,28,20,0.05)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
                <Users className="h-4 w-4" />
                For teams
              </div>

              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#171714] md:text-5xl">
                Give your sales team a repeatable coaching system
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5b5d59]">
                Genim is built to become more than a single-user practice tool.
                It can evolve into a structured team training platform for
                onboarding, objection practice, call readiness, and manager-led
                coaching.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  'Shared scenario library',
                  'Consistent rep coaching',
                  'Manager visibility into performance',
                  'Structured onboarding practice',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm font-medium text-[#454744]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-7 py-4 text-sm font-semibold text-white"
                >
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex rounded-full border border-[#d8d1c8] px-7 py-4 text-sm font-semibold text-[#1f1f1c]"
                >
                  Existing account
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-[#f7f3ee] p-7">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7c7d77]">
                Why teams care
              </div>

              <div className="mt-6 space-y-5">
                {[
                  {
                    title: 'Better readiness before live calls',
                    body: 'Reps can rehearse difficult conversations before they happen with real prospects.',
                  },
                  {
                    title: 'More consistent coaching',
                    body: 'Feedback becomes structured instead of depending entirely on manager time and memory.',
                  },
                  {
                    title: 'Faster rep improvement',
                    body: 'Practice can happen daily, not only when a manager is available for roleplay sessions.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#e6ddd2] bg-white p-5"
                  >
                    <h3 className="text-lg font-semibold text-[#1c1c19]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-7 text-[#5c5f5a]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto max-w-[1400px] rounded-[36px] bg-[#1f4d38] px-8 py-12 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                Ready to build stronger reps?
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Start practising real sales conversations with Genim
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                Help reps improve faster with realistic AI roleplay, clearer
                feedback, and a training flow they can actually use.
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
                href="/login"
                className="inline-flex rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}