import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  MessageSquare,
  Sparkles,
  Video,
} from 'lucide-react'

const socialProofPeople = [
  { name: 'Aisha', role: 'Founder' },
  { name: 'Marcus', role: 'Revenue Lead' },
  { name: 'Sophie', role: 'Sales Manager' },
  { name: 'Daniel', role: 'CEO' },
  { name: 'Tara', role: 'Enablement' },
  { name: 'Jordan', role: 'Ops Lead' },
  { name: 'Claire', role: 'Team Lead' },
  { name: 'Victor', role: 'VP Sales' },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ProofAvatar({
  name,
  index,
}: {
  name: string
  index: number
}) {
  const palette = [
    'bg-[#d6612d] text-white',
    'bg-[#1f4d38] text-white',
    'bg-[#5f79c9] text-white',
    'bg-[#8a6ccf] text-white',
    'bg-[#cc8b3d] text-white',
    'bg-[#3b7a6c] text-white',
  ]

  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-sm font-semibold shadow-sm ${
        palette[index % palette.length]
      }`}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}

function ValueCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#1b1b18]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#5f625d]">{body}</p>
    </div>
  )
}

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />

      <header className="sticky top-0 z-40 border-b border-[#e6ddd2]/90 bg-[#f7f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="flex items-center pr-4 md:pr-6">
            <div className="flex h-10 items-center overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Genim Logo"
                className="h-[200px] w-auto max-w-none object-contain"
              />
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="absolute right-[-80px] top-[-40px] h-[240px] w-[240px] rounded-full bg-[#d6612d]/10 blur-3xl" />
        <div className="absolute left-[-50px] bottom-[-60px] h-[220px] w-[220px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] px-6 py-16 text-center md:px-10 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e5db] bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
            <Sparkles className="h-4 w-4" />
            Speak to the founder
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
            See Genim in action
          </h1>

          <p className="mx-auto mt-5 max-w-[760px] text-base leading-8 text-[#5b5d59] md:text-lg">
            Book a short call to see how Genim can help your reps practise real
            sales conversations, improve objection handling, and build a more
            consistent coaching system across your team.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="flex -space-x-2">
              {socialProofPeople.map((person, index) => (
                <ProofAvatar
                  key={person.name}
                  name={person.name}
                  index={index}
                />
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm text-[#6a6c67]">
            Founders, team leads, and sales managers already exploring Genim
          </p>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-8 xl:grid-cols-[0.38fr_0.62fr]">
          <aside className="space-y-6">
            <div className="rounded-[30px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1f4d38] text-lg font-semibold text-white shadow-sm">
                  CE
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Your host
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#181815]">
                    Chika Emmanuel
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Founder, Genim
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-[#ece4da] bg-[#faf8f5] p-5">
                <h2 className="text-2xl font-semibold text-[#1a1a17]">
                  Genim Intro Chat
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
                  A short conversation to understand your sales training needs,
                  show you how the product works, and explore whether Genim is a
                  fit for your team or workflow.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#4f514d]">
                    <Clock3 className="h-4 w-4 text-[#d6612d]" />
                    15-minute intro call
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#4f514d]">
                    <Video className="h-4 w-4 text-[#1f4d38]" />
                    Google Meet
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#4f514d]">
                    <CalendarDays className="h-4 w-4 text-[#d6612d]" />
                    Pick the time that works for you
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1f4d38]" />
                  <span className="text-sm leading-7 text-[#4f514d]">
                    See the roleplay product live instead of guessing from a
                    landing page
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1f4d38]" />
                  <span className="text-sm leading-7 text-[#4f514d]">
                    Ask questions about individual plans, teams, hiring
                    assessments, and rollout
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1f4d38]" />
                  <span className="text-sm leading-7 text-[#4f514d]">
                    Get clarity on the best starting point for your use case
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <ValueCard
                icon={<Headphones className="h-5 w-5" />}
                title="Live product walkthrough"
                body="See how reps practise with AI buyers and how managers can use the platform more strategically."
              />
              <ValueCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="Straight answers"
                body="Use the call to ask about pricing, onboarding, roleplays, hiring flows, and what is best for your team."
              />
            </div>
          </aside>

          <section className="rounded-[30px] border border-[#e8ded3] bg-white p-4 shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-6">
            <div className="mb-4 px-2">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Pick a time
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                Book your intro call
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                Choose a date and time below. Once booked, you’ll get the
                meeting details automatically.
              </p>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#ece4da] bg-[#fcfaf8]">
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/chikaodi-emmanuel1/genim-intro-chat"
                style={{ minWidth: '320px', height: '780px' }}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}