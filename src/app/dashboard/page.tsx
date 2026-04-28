import Link from 'next/link'
import { redirect } from 'next/navigation'
import SessionsList from './sessions-list'
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  FileText,
  LogOut,
  Play,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type SessionRow = {
  id: string
  overall_score: number | null
  status: string | null
  selected_roleplay_type: string | null
  selected_industry: string | null
  created_at: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${value}%` : '—'
}

function getAverageScore(sessions: SessionRow[]) {
  const scores = sessions
    .map((session) => session.overall_score)
    .filter((score): score is number => typeof score === 'number')

  if (scores.length === 0) return null

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

function getBestScore(sessions: SessionRow[]) {
  const scores = sessions
    .map((session) => session.overall_score)
    .filter((score): score is number => typeof score === 'number')

  if (scores.length === 0) return null

  return Math.max(...scores)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sessions, error } = await supabase
    .from('roleplay_sessions')
    .select(
      'id, overall_score, status, selected_roleplay_type, selected_industry, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const sessionList = (sessions ?? []) as SessionRow[]
  const recentSessions = [...sessionList].reverse()

  const totalSessions = sessionList.length
  const completedSessions = sessionList.filter(
    (session) => session.status === 'completed'
  ).length
  const averageScore = getAverageScore(sessionList)
  const bestScore = getBestScore(sessionList)

  const chartSessions = sessionList
    .filter((session) => typeof session.overall_score === 'number')
    .slice(-10)

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
          <Link href="/" className="flex h-10 items-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Genim Logo"
              className="h-[120px] w-auto max-w-none object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to roleplay
            </Link>

            <form action="/auth/signout" method="post">
              <button className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="mx-auto max-w-[1240px] px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <Sparkles className="h-4 w-4" />
            Individual dashboard
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-4xl">
            Track your sales practice progress
          </h1>

          <p className="mt-4 max-w-[820px] text-base leading-8 text-[#5b5d59] md:text-md">
            Review previous roleplays, monitor your score trend, and revisit
            reports from completed sessions.
          </p>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[1240px] space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <Play className="h-6 w-6 text-[#d6612d]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Total sessions
              </div>
              <div className="mt-2 text-2xl font-semibold">{totalSessions}</div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <Target className="h-6 w-6 text-[#1f4d38]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Completed
              </div>
              <div className="mt-2 text-2xl font-semibold">{completedSessions}</div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <BarChart3 className="h-6 w-6 text-[#d6612d]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Average score
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatScore(averageScore)}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <Trophy className="h-6 w-6 text-[#1f4d38]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Best score
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatScore(bestScore)}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <h2 className="text-xl font-semibold text-[#1a1a17]">
              Progress trend
            </h2>
            <p className="mt-2 text-sm text-[#666864]">
              Your last scored roleplay sessions.
            </p>

            <div className="mt-8 overflow-x-auto">
              {chartSessions.length > 0 ? (
                <div className="relative h-[300px] min-w-[620px] rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] px-6 pb-10 pt-8">
                  {/* Y-axis guide lines */}
                  <div className="absolute inset-x-6 top-8 border-t border-dashed border-[#e3d8cd]" />
                  <div className="absolute inset-x-6 top-[35%] border-t border-dashed border-[#e3d8cd]" />
                  <div className="absolute inset-x-6 top-[62%] border-t border-dashed border-[#e3d8cd]" />
                  <div className="absolute inset-x-6 bottom-10 border-t border-[#d9cec3]" />

                  <div className="relative flex h-full items-end gap-4">
                    {chartSessions.map((session, index) => {
                      const score = session.overall_score ?? 0
                      const height = Math.max(score, 6)

                      return (
                        <div
                          key={session.id}
                          className="group flex flex-1 flex-col items-center justify-end gap-2"
                        >
                          <div className="text-xs font-semibold text-[#1f4d38]">
                            {score}%
                          </div>

                          <div className="relative flex h-[210px] w-full items-end justify-center">
                            <div
                              className="w-full max-w-[56px] rounded-t-[18px] bg-[linear-gradient(180deg,#d6612d_0%,#f0a077_100%)] shadow-[0_10px_22px_rgba(214,97,45,0.22)] transition-all group-hover:opacity-90"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>

                          <div className="text-xs font-medium text-[#7d7f7a]">
                            #{index + 1}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex h-[260px] w-full items-center justify-center rounded-[24px] border border-dashed border-[#ddd4ca] bg-[#fcfaf8] text-sm text-[#666864]">
                  Complete scored sessions to see your progress graph.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#1a1a17]">
                  Previous sessions
                </h2>
                <p className="mt-2 text-sm text-[#666864]">
                  Reopen reports from your completed roleplays.
                </p>
              </div>
            </div>

            <SessionsList sessions={recentSessions} />
          </div>

          {/* <div className="flex justify-center">
            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f4d38] px-6 py-4 text-sm font-semibold text-white"
            >
              Start another roleplay
              <CalendarClock className="h-4 w-4" />
            </Link>
          </div> */}
        </div>
      </section>
    </main>
  )
}