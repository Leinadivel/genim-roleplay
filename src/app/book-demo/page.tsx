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
  Target,
  Users,
  Video,
} from 'lucide-react'

const socialProofPeople = [
  {
    name: 'Aisha',
    role: 'Founder',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Marcus',
    role: 'Revenue Lead',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Sophie',
    role: 'Sales Manager',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'Daniel',
    role: 'CEO',
    image: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  {
    name: 'Tara',
    role: 'Enablement',
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
  {
    name: 'Jordan',
    role: 'Ops Lead',
    image: 'https://randomuser.me/api/portraits/men/51.jpg',
  },
  {
    name: 'Claire',
    role: 'Team Lead',
    image: 'https://randomuser.me/api/portraits/women/52.jpg',
  },
  {
    name: 'Victor',
    role: 'VP Sales',
    image: 'https://randomuser.me/api/portraits/men/61.jpg',
  },
]

function ProofAvatar({
  name,
  role,
  image,
}: {
  name: string
  role: string
  image: string
}) {
  return (
    <img
      src={image}
      alt={`${name} — ${role}`}
      title={`${name} — ${role}`}
      className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
    />
  )
}

function ValueItem({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f5ede6] text-[#d6612d]">
        {icon}
      </div>
      <p className="text-sm leading-7 text-[#4f514d]">{text}</p>
    </div>
  )
}

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#1f1f1c]">
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />

      <header className="sticky top-0 z-40 border-b border-[#ece5da]/90 bg-[#fbfaf7]/90 backdrop-blur">
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
            className="inline-flex items-center gap-2 rounded-full border border-[#ddd4ca] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#fbfaf7]">
        <div className="absolute right-[-120px] top-[-30px] h-[260px] w-[260px] rounded-full bg-[#d6612d]/7 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] h-[220px] w-[220px] rounded-full bg-[#1f4d38]/7 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] px-6 pb-8 pt-16 text-center md:px-10 md:pb-10 md:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-[#f2f8f4] px-4 py-2 text-sm font-medium text-[#73925f]">
            <Sparkles className="h-4 w-4" />
            Speak to founder
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
            See Genim in action
          </h1>

          <p className="mx-auto mt-5 max-w-[860px] text-base leading-8 text-[#5b5d59] md:text-lg">
            Book a short call to understand how Genim helps sales leaders build
            a more scalable training system — where reps practise realistic
            sales conversations, improve performance in critical deal moments,
            and develop more consistently without depending entirely on manager
            time for coaching.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="flex -space-x-2">
              {socialProofPeople.map((person) => (
                <ProofAvatar
                  key={person.name}
                  name={person.name}
                  role={person.role}
                  image={person.image}
                />
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm text-[#6a6c67]">
            Founders, sales leaders, and team managers already exploring Genim
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf7] px-6 pb-16 md:px-10">
        <div className="mx-auto grid max-w-[1380px] gap-8 xl:grid-cols-[0.3fr_0.7fr]">
          <aside className="space-y-8">
            <div>
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

              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-[#1a1a17]">
                  Genim Intro Chat
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[#5f625d]">
                  A focused conversation for founders, sales leaders, and team
                  managers who want to understand how Genim fits into rep
                  coaching, onboarding, hiring assessments, and day-to-day sales
                  development.
                </p>

                <div className="mt-6 space-y-3">
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
                    Choose a time that works for your schedule
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 border-t border-[#ece5da] pt-6">
              <ValueItem
                icon={<Headphones className="h-4 w-4" />}
                text="See the product live instead of trying to piece everything together from screenshots or landing page copy."
              />
              <ValueItem
                icon={<MessageSquare className="h-4 w-4" />}
                text="Understand how Genim can support rep readiness, objection handling, manager coaching, and structured practice."
              />
              <ValueItem
                icon={<Users className="h-4 w-4" />}
                text="Discuss whether Genim is the right fit for an individual workflow, a manager-led rollout, or a growing sales team."
              />
              <ValueItem
                icon={<Target className="h-4 w-4" />}
                text="Leave with a clearer view of the right next step, instead of a vague demo with no commercial context."
              />
            </div>
          </aside>

          <section className="bg-transparent">
            <div className="mb-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Pick a time
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                Book your intro call
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                Choose a date and time below. Once booked, you’ll receive the
                meeting details automatically.
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[#ece5da] bg-white shadow-[0_12px_32px_rgba(25,25,20,0.04)]">
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/chikaodi-emmanuel1/genim-intro-chat"
                style={{ minWidth: '320px', height: '960px' }}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}