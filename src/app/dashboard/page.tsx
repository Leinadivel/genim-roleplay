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

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
            Track your sales practice progress
          </h1>

          <p className="mt-4 max-w-[820px] text-base leading-8 text-[#5b5d59] md:text-lg">
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
              <div className="mt-2 text-3xl font-semibold">{totalSessions}</div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <Target className="h-6 w-6 text-[#1f4d38]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Completed
              </div>
              <div className="mt-2 text-3xl font-semibold">{completedSessions}</div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <BarChart3 className="h-6 w-6 text-[#d6612d]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Average score
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {formatScore(averageScore)}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <Trophy className="h-6 w-6 text-[#1f4d38]" />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Best score
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {formatScore(bestScore)}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <h2 className="text-2xl font-semibold text-[#1a1a17]">
              Progress trend
            </h2>
            <p className="mt-2 text-sm text-[#666864]">
              Your last scored roleplay sessions.
            </p>

            <div className="mt-8 flex h-[260px] items-end gap-3 border-b border-[#e8ded3]">
              {chartSessions.length > 0 ? (
                chartSessions.map((session, index) => (
                  <div key={session.id} className="flex flex-1 flex-col items-center gap-2">
                    <div className="text-xs font-semibold text-[#5f625d]">
                      {session.overall_score}%
                    </div>
                    <div
                      className="w-full rounded-t-2xl bg-[#d6612d]"
                      style={{
                        height: `${Math.max(session.overall_score ?? 0, 6)}%`,
                      }}
                    />
                    <div className="text-xs text-[#7d7f7a]">#{index + 1}</div>
                  </div>
                ))
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#666864]">
                  Complete scored sessions to see your progress graph.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1a1a17]">
                  Previous sessions
                </h2>
                <p className="mt-2 text-sm text-[#666864]">
                  Reopen reports from your completed roleplays.
                </p>
              </div>
            </div>

            <SessionsList sessions={recentSessions} />
          </div>

          <div className="flex justify-center">
            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f4d38] px-6 py-4 text-sm font-semibold text-white"
            >
              Start another roleplay
              <CalendarClock className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}