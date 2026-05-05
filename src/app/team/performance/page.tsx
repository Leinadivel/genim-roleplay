import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart3, Target, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type MemberRow = {
  id: string
  user_id: string | null
  email: string | null
  role: string
  status: string
}

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
}

type SessionRow = {
  id: string
  user_id: string
  overall_score: number | null
  status: string
  selected_roleplay_type: string | null
  selected_industry: string | null
  created_at: string
}

function canViewPerformance(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${Math.round(value)}%` : '—'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getScoreTone(score: number | null) {
  if (typeof score !== 'number') return 'bg-[#f1eee9] text-[#666864]'
  if (score >= 80) return 'bg-[#eef5f0] text-[#1f4d38]'
  if (score >= 60) return 'bg-[#fff8f3] text-[#b35b33]'
  return 'bg-red-50 text-red-600'
}

export default async function TeamPerformancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership || !canViewPerformance(membership.role)) redirect('/team')

  const { data: membersData } = await supabase
    .from('company_members')
    .select('id, user_id, email, role, status')
    .eq('company_id', membership.company_id)
    .eq('status', 'active')

  const members = (membersData ?? []) as MemberRow[]
  const userIds = members
    .map((member) => member.user_id)
    .filter((id): id is string => Boolean(id))

  let profiles = new Map<string, ProfileRow>()
  let sessions: SessionRow[] = []

  if (userIds.length > 0) {
    const [{ data: profileRows }, { data: sessionRows }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds),

      supabase
        .from('roleplay_sessions')
        .select('id, user_id, overall_score, status, selected_roleplay_type, selected_industry, created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false }),
    ])

    profiles = new Map(
      ((profileRows ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    )

    sessions = (sessionRows ?? []) as SessionRow[]
  }

  const scoredSessions = sessions.filter((session) => typeof session.overall_score === 'number')
  const averageScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce((sum, session) => sum + (session.overall_score ?? 0), 0) /
            scoredSessions.length
        )
      : null

  const completedSessions = sessions.filter(
    (session) => session.status === 'completed' || session.status === 'evaluated'
  )

  const performanceRows = userIds.map((userId) => {
    const profile = profiles.get(userId)
    const member = members.find((item) => item.user_id === userId)
    const repSessions = sessions.filter((session) => session.user_id === userId)
    const repScored = repSessions.filter((session) => typeof session.overall_score === 'number')
    const latestSession = repSessions[0] ?? null
    const latestScore = latestSession?.overall_score ?? null
    const average =
      repScored.length > 0
        ? Math.round(
            repScored.reduce((sum, session) => sum + (session.overall_score ?? 0), 0) /
              repScored.length
          )
        : null

    return {
      userId,
      name: profile?.full_name || 'Unnamed member',
      email: member?.email || profile?.email || 'No email',
      role: member?.role || 'rep',
      sessionCount: repSessions.length,
      average,
      latestScore,
      latestSession,
    }
  })

  const rankedRows = performanceRows.sort((a, b) => (b.average ?? -1) - (a.average ?? -1))
  const topRep = rankedRows.find((row) => typeof row.average === 'number') ?? null
  const strugglingCount = rankedRows.filter(
    (row) => typeof row.average === 'number' && row.average < 60
  ).length

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Team performance
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
          Rep performance overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666864]">
          See who is improving, who is struggling, and which reps need coaching attention.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Team average" value={formatScore(averageScore)} icon={Target} tone="green" />
        <StatCard label="Total sessions" value={sessions.length} icon={BarChart3} tone="orange" />
        <StatCard label="Completed" value={completedSessions.length} icon={TrendingUp} tone="blue" />
        <StatCard label="Needs coaching" value={strugglingCount} icon={Users} tone="orange" />
      </div>

      {topRep ? (
        <div className="rounded-[24px] bg-[#eef5f0] p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1f4d38]">
            Current strongest rep
          </div>
          <div className="mt-2 text-xl font-semibold text-[#171714]">
            {topRep.name} · {formatScore(topRep.average)}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#476354]">
            Use this benchmark to compare what stronger reps are doing differently in roleplay sessions.
          </p>
        </div>
      ) : null}

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
            Rep comparison
          </div>
          <h2 className="mt-1 text-lg font-semibold text-[#171714]">
            Performance by team member
          </h2>
        </div>

        <div className="overflow-hidden rounded-[22px] bg-[#faf8f5]">
          {rankedRows.length > 0 ? (
            <div className="divide-y divide-[#ece4da]">
              {rankedRows.map((row) => (
                <div
                  key={row.userId}
                  className="grid gap-4 px-4 py-4 transition hover:bg-white lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr_auto]"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#171714]">
                      {row.name}
                    </div>
                    <div className="mt-1 text-xs text-[#777a75]">
                      {row.email}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Sessions
                    </div>
                    <div className="mt-1 text-sm text-[#555854]">
                      {row.sessionCount}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Average
                    </div>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${getScoreTone(row.average)}`}>
                      {formatScore(row.average)}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Latest
                    </div>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${getScoreTone(row.latestScore)}`}>
                      {formatScore(row.latestScore)}
                    </span>
                  </div>

                  <div className="lg:text-right">
                    {row.latestSession ? (
                      <Link
                        href={`/session/${row.latestSession.id}/report`}
                        className="inline-flex rounded-full bg-[#1f4d38] px-4 py-2 text-xs font-semibold text-white"
                      >
                        View report
                      </Link>
                    ) : (
                      <span className="text-xs text-[#8a8d87]">No report</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-[#666864]">
              No team members found.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
            Recent performance activity
          </div>
          <h2 className="mt-1 text-lg font-semibold text-[#171714]">
            Latest scored sessions
          </h2>
        </div>

        <div className="space-y-3">
          {sessions.slice(0, 8).map((session) => {
            const profile = profiles.get(session.user_id)

            return (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-[18px] bg-[#faf8f5] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-[#171714]">
                    {profile?.full_name || 'Unnamed member'}
                  </div>
                  <div className="mt-1 text-xs text-[#777a75]">
                    {session.selected_roleplay_type || 'Roleplay'} ·{' '}
                    {session.selected_industry || 'Industry not set'} ·{' '}
                    {formatDate(session.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getScoreTone(session.overall_score)}`}>
                    {formatScore(session.overall_score)}
                  </span>

                  <Link
                    href={`/session/${session.id}/report`}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1f1f1c]"
                  >
                    Report
                  </Link>
                </div>
              </div>
            )
          })}

          {sessions.length === 0 ? (
            <div className="rounded-[18px] bg-[#faf8f5] px-4 py-5 text-sm text-[#666864]">
              No roleplay sessions yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  icon: any
  tone: 'green' | 'orange' | 'blue'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-[#eef5f0] text-[#1f4d38]'
      : tone === 'blue'
        ? 'bg-[#eef4ff] text-[#355c9a]'
        : 'bg-[#f7ede6] text-[#d6612d]'

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_30px_rgba(25,25,20,0.06)]">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
        {value}
      </div>
    </div>
  )
}