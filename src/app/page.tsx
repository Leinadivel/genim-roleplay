import Link from 'next/link'

function AvatarPill({
  initials,
  className,
}: {
  initials: string
  className: string
}) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-sm font-semibold text-white shadow-sm ${className}`}
    >
      {initials}
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
    <div className="grid grid-cols-[84px_1fr_40px] items-center gap-3 text-sm">
      <span className="text-[#385244]">{label}</span>
      <div className="h-1.5 rounded-full bg-[#dbe6df]">
        <div
          className="h-1.5 rounded-full bg-[#1f4d38]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right font-medium text-[#385244]">{value}</span>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e4ddd4]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="text-[28px] font-semibold tracking-tight">
            <span className="text-[#1d1d1b]">Gen</span>
            <span className="italic text-[#d6612d]">im</span>
          </Link>

          <nav className="hidden items-center gap-10 text-[17px] text-[#3f433f] md:flex">
            <a href="#how-it-works" className="transition hover:text-black">
              How it works
            </a>
            <a href="#features" className="transition hover:text-black">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-black">
              Pricing
            </a>
            <a href="#teams" className="transition hover:text-black">
              For teams
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-3 text-sm font-medium text-[#3f433f] transition hover:text-black md:inline-flex"
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
        <div className="absolute right-0 top-0 h-[540px] w-[42%] bg-[radial-gradient(circle_at_top_left,_rgba(223,122,72,0.18),_transparent_60%)]" />

        <div className="mx-auto grid max-w-[1400px] gap-16 px-6 py-16 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
              AI-powered sales training
            </div>

            <h1 className="mt-8 text-[64px] font-semibold leading-[0.96] tracking-[-0.04em] text-[#131311] md:text-[88px] lg:text-[96px]">
              <span className="block">Practice selling.</span>
              <span className="block italic text-[#d6612d]">Close more</span>
              <span className="block text-[#1f4d38]">in real life.</span>
            </h1>

            <p className="mt-8 max-w-[760px] text-[22px] leading-[1.7] text-[#454744]">
              Genim puts you in realistic sales conversations with an AI buyer
              who pushes back, objects, and challenges you — so when the real
              deal comes, you&apos;re ready.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-full bg-[#d6612d] px-8 py-5 text-xl font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Start roleplaying free
                <span aria-hidden="true">→</span>
              </Link>

              <button
                type="button"
                className="inline-flex items-center rounded-full border border-[#d8d1c8] bg-[#f7f3ee] px-9 py-5 text-xl font-semibold text-[#20211f] transition hover:bg-white"
              >
                Watch a demo
              </button>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <AvatarPill initials="AK" className="bg-[#d6612d]" />
                  <AvatarPill initials="MS" className="bg-[#1f4d38]" />
                  <AvatarPill initials="JR" className="bg-[#5f79c9]" />
                  <AvatarPill initials="LP" className="bg-[#8a6ccf]" />
                </div>
              </div>

              <p className="text-[28px] font-semibold text-[#232320]">
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
                      Look, I appreciate the call, but we already use
                      Salesforce. I don&apos;t see why we&apos;d switch.
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
                    <FeedbackBar label="Objection handling" value={88} />
                    <FeedbackBar label="Discovery" value={74} />
                    <FeedbackBar label="Tone" value={91} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}