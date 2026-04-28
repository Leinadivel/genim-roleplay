import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type MemberRow = {
  id: string
  email: string | null
  user_id: string | null
  role: string
  status: string
  created_at: string
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

type RepAnalyticsRow = {
  company_member_id: string
  user_id: string | null
  full_name: string
  email: string | null
  role: string
  status: string
  total_sessions: number
  latest_score: number | null
  average_score: number | null
  last_trained_at: string | null
  latest_roleplay_type: string | null
  latest_industry: string | null
}

function canViewTeamAnalytics(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatRole(role: string) {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatStatus(status: string) {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${value}%` : '—'
}

function formatDateTime(value: string | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'owner':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    case 'admin':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    case 'manager':
      return 'border-[#dbe5f6] bg-[#eef4ff] text-[#355c9a]'
    default:
      return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    case 'pending':
    case 'invited':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    default:
      return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
  }
}

export default async function TeamAnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (membershipError || !membership) {
    redirect('/scenarios')
  }

  if (!canViewTeamAnalytics(membership.role)) {
    redirect('/scenarios')
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .maybeSingle()

  if (companyError || !company) {
    redirect('/team')
  }

  const { data: members, error: membersError } = await supabase
    .from('company_members')
    .select('id, email, user_id, role, status, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (membersError) {
    throw new Error(`Failed to load team members: ${membersError.message}`)
  }

  const typedMembers = (members ?? []) as MemberRow[]

  const userIds = typedMembers
    .map((member) => member.user_id)
    .filter((id): id is string => Boolean(id))

  let profileMap = new Map<string, ProfileRow>()

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    if (profilesError) {
      throw new Error(`Failed to load profiles: ${profilesError.message}`)
    }

    profileMap = new Map(
      ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    )
  }

  let sessions: SessionRow[] = []

  if (userIds.length > 0) {
    const { data: rawSessions, error: sessionsError } = await supabase
      .from('roleplay_sessions')
      .select(
        'id, user_id, overall_score, status, selected_roleplay_type, selected_industry, created_at'
      )
      .in('user_id', userIds)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      throw new Error(`Failed to load team sessions: ${sessionsError.message}`)
    }

    sessions = (rawSessions ?? []) as SessionRow[]
  }

  const analyticsRows: RepAnalyticsRow[] = typedMembers.map((member) => {
    const memberSessions = member.user_id
      ? sessions.filter((session) => session.user_id === member.user_id)
      : []

    const scoredSessions = memberSessions.filter(
      (session) => typeof session.overall_score === 'number'
    )

    const latestSession = memberSessions[0] ?? null
    const latestScore =
      latestSession && typeof latestSession.overall_score === 'number'
        ? latestSession.overall_score
        : null

    const averageScore =
      scoredSessions.length > 0
        ? Math.round(
            scoredSessions.reduce(
              (sum, session) => sum + (session.overall_score ?? 0),
              0
            ) / scoredSessions.length
          )
        : null

    const profile = member.user_id ? profileMap.get(member.user_id) : null

    return {
      company_member_id: member.id,
      user_id: member.user_id,
      full_name: profile?.full_name || 'Unnamed team member',
      email: member.email || profile?.email || null,
      role: member.role,
      status: member.status,
      total_sessions: memberSessions.length,
      latest_score: latestScore,
      average_score: averageScore,
      last_trained_at: latestSession?.created_at ?? null,
      latest_roleplay_type: latestSession?.selected_roleplay_type ?? null,
      latest_industry: latestSession?.selected_industry ?? null,
    }
  })

  const totalReps = analyticsRows.filter((row) => row.role === 'rep').length
  const activeMembers = analyticsRows.filter(
    (row) => row.status === 'active'
  ).length
  const repsWhoTrained = analyticsRows.filter(
    (row) => row.total_sessions > 0
  ).length

  const rowsWithAverage = analyticsRows.filter(
    (row) => typeof row.average_score === 'number'
  )

  const overallAverage =
    rowsWithAverage.length > 0
      ? Math.round(
          rowsWithAverage.reduce(
            (sum, row) => sum + (row.average_score ?? 0),
            0
          ) / rowsWithAverage.length
        )
      : null

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center">
            <div className="flex h-10 items-center overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Genim Logo"
                className="h-[120px] w-auto max-w-none object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to team
            </Link>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="mx-auto max-w-[1280px] px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
            Team analytics
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-4xl">
            {company.name}
          </h1>

          <p className="mt-4 max-w-[480px] text-base leading-8 text-[#5b5d59] md:text-md">
            Review team activity, training consistency, session outcomes, and
            open individual rep performance details.
          </p>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Total reps
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {totalReps}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Rep accounts in this workspace
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Active members
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {activeMembers}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Active users currently on the workspace
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Reps who trained
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {repsWhoTrained}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Members with at least one session
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Team average
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {formatScore(overallAverage)}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Average of rep average scores
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="border-b border-[#ece4da] px-6 py-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Full team breakdown
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[#1a1a17]">
                Rep performance and activity
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                Click any rep to open a dedicated analytics page for that team
                member.
              </p>
            </div>

            <div className="hidden grid-cols-[1.4fr_1.3fr_0.8fr_0.8fr_0.8fr_1fr_1.2fr_0.5fr] gap-4 border-b border-[#ece4da] bg-[#faf8f5] px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a] xl:grid">
              <div>Rep</div>
              <div>Role / Status</div>
              <div>Sessions</div>
              <div>Latest</div>
              <div>Average</div>
              <div>Last trained</div>
              <div>Last session type</div>
              <div />
            </div>

            <div className="divide-y divide-[#f1e9e0]">
              {analyticsRows.length > 0 ? (
                analyticsRows.map((row) => {
                  const detailHref = row.user_id
                    ? `/team/analytics/${row.user_id}`
                    : null

                  const desktopContent = (
                    <div className="hidden xl:grid xl:grid-cols-[1.4fr_1.3fr_0.8fr_0.8fr_0.8fr_1fr_1.2fr_0.5fr] xl:gap-4 xl:px-6 xl:py-5">
                      <div>
                        <div className="text-sm font-semibold text-[#1a1a17]">
                          {row.full_name}
                        </div>
                        <div className="mt-1 text-xs text-[#7d7f7a]">
                          {row.email || 'No email available'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadge(
                            row.role
                          )}`}
                        >
                          {formatRole(row.role)}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            row.status
                          )}`}
                        >
                          {formatStatus(row.status)}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-[#1a1a17]">
                        {row.total_sessions}
                      </div>

                      <div className="text-sm font-semibold text-[#1a1a17]">
                        {formatScore(row.latest_score)}
                      </div>

                      <div className="text-sm font-semibold text-[#1a1a17]">
                        {formatScore(row.average_score)}
                      </div>

                      <div className="text-sm text-[#555854]">
                        {formatDateTime(row.last_trained_at)}
                      </div>

                      <div className="text-sm text-[#555854]">
                        {row.latest_roleplay_type || '—'}
                        {row.latest_industry ? ` • ${row.latest_industry}` : ''}
                      </div>

                      <div className="flex items-center justify-end">
                        {detailHref ? (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e3d9ce] bg-white text-[#666864]">
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )

                  const mobileContent = (
                    <div className="space-y-3 px-4 py-4 xl:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1a1a17]">
                            {row.full_name}
                          </div>
                          <div className="mt-1 text-xs text-[#7d7f7a]">
                            {row.email || 'No email available'}
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadge(
                              row.role
                            )}`}
                          >
                            {formatRole(row.role)}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                              row.status
                            )}`}
                          >
                            {formatStatus(row.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-[16px] border border-[#ece4da] bg-[#faf8f5] px-3 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                            Sessions
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#1a1a17]">
                            {row.total_sessions}
                          </div>
                        </div>

                        <div className="rounded-[16px] border border-[#ece4da] bg-[#faf8f5] px-3 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                            Latest
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#1a1a17]">
                            {formatScore(row.latest_score)}
                          </div>
                        </div>

                        <div className="rounded-[16px] border border-[#ece4da] bg-[#faf8f5] px-3 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                            Average
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#1a1a17]">
                            {formatScore(row.average_score)}
                          </div>
                        </div>

                        <div className="rounded-[16px] border border-[#ece4da] bg-[#faf8f5] px-3 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                            Last trained
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#1a1a17]">
                            {formatDateTime(row.last_trained_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-[#555854]">
                          {row.latest_roleplay_type || 'No session type yet'}
                          {row.latest_industry ? ` • ${row.latest_industry}` : ''}
                        </div>

                        {detailHref ? (
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e3d9ce] bg-white text-[#666864]">
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )

                  if (!detailHref) {
                    return (
                      <div
                        key={
                          row.user_id ??
                          row.email ??
                          `${row.full_name}-${row.role}-${row.status}`
                        }
                      >
                        {desktopContent}
                        {mobileContent}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={
                        row.user_id ??
                        row.email ??
                        `${row.full_name}-${row.role}-${row.status}`
                      }
                      href={detailHref}
                      className="block transition hover:bg-[#fcfaf8]"
                    >
                      {desktopContent}
                      {mobileContent}
                    </Link>
                  )
                })
              ) : (
                <div className="px-6 py-8 text-sm text-[#666864]">
                  No analytics data yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}