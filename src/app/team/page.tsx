import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Clock3,
  CreditCard,
  LogOut,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import TeamInvitePanel from './team-invite-panel'

type MemberRow = {
  id: string
  email: string | null
  user_id: string | null
  role: string
  status: string
  created_at: string
}

type MemberProfile = {
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

function parseTeamSize(
  value: string | number | null | undefined
): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function isInviteLikeStatus(status: string | null | undefined) {
  return status === 'pending' || status === 'invited'
}

function getWorkspaceHealth(memberCount: number, teamLimit: number | null) {
  if (!teamLimit) {
    return {
      label: 'Flexible capacity',
      tone: 'text-[#1f4d38] bg-[#eef5f0] border-[#d7e6dc]',
      message:
        'No seat cap is set yet. This is a good time to finalise your commercial plan structure.',
    }
  }

  const usage = teamLimit > 0 ? memberCount / teamLimit : 0

  if (usage >= 1) {
    return {
      label: 'Seat limit reached',
      tone: 'text-[#a2542f] bg-[#fff4ed] border-[#f0d7c8]',
      message:
        'Your team has filled all available seats. The next sellable step is billing-based seat expansion.',
    }
  }

  if (usage >= 0.8) {
    return {
      label: 'Nearly full',
      tone: 'text-[#a2542f] bg-[#fff4ed] border-[#f0d7c8]',
      message:
        'Your team is close to the current seat limit. This is a strong point to introduce plan upgrades.',
    }
  }

  return {
    label: 'Healthy capacity',
    tone: 'text-[#1f4d38] bg-[#eef5f0] border-[#d7e6dc]',
    message:
      'There is still room to invite more members before billing-based seat controls are required.',
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${value}%` : '—'
}

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, account_type, role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const companyId = membership?.company_id ?? null

  const { data: company, error: companyError } = companyId
    ? await supabase
        .from('companies')
        .select('id, name, slug, team_size')
        .eq('id', companyId)
        .maybeSingle()
    : { data: null, error: null }

  if (
    !profile ||
    profileError ||
    !membership ||
    membershipError ||
    !company ||
    companyError
  ) {
    return (
      <main className="min-h-screen bg-[#f7f3ee] p-6 text-[#1f1f1c]">
        <div className="mx-auto max-w-[980px] space-y-6">
          <div className="rounded-[24px] border border-red-300 bg-white p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-red-600">
              Team workspace unavailable
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-[#171714]">
              Team data could not be loaded
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#5f625d]">
              This page is showing the failing step clearly so the team flow can
              be fixed before payment is added.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#e8ded3] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Profile query
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-[#2b2c2a]">
{JSON.stringify(
  {
    userId: user.id,
    profile,
    profileError: profileError?.message ?? null,
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="rounded-[20px] border border-[#e8ded3] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Membership query
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-[#2b2c2a]">
{JSON.stringify(
  {
    membership,
    membershipError: membershipError?.message ?? null,
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="rounded-[20px] border border-[#e8ded3] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Company query
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-[#2b2c2a]">
{JSON.stringify(
  {
    companyId,
    company,
    companyError: companyError?.message ?? null,
  },
  null,
  2
)}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/post-login"
              className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
            >
              Retry post-login
            </Link>
            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a]"
            >
              Go to scenarios
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const currentCompanyRole = membership.role
  const isOwner = currentCompanyRole === 'owner'
  const isAdmin = currentCompanyRole === 'admin'
  const isManager = currentCompanyRole === 'manager'
  const canManageWorkspace = isOwner || isAdmin
  const canViewTeamManagement = isOwner || isAdmin || isManager

  const { data: rawMembers, error: membersError } = await supabase
    .from('company_members')
    .select('id, email, user_id, role, status, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (membersError) {
    throw new Error(`Failed to load members: ${membersError.message}`)
  }

  const userIds = (rawMembers ?? [])
    .map((member) => member.user_id)
    .filter((id): id is string => Boolean(id))

  let profileMap = new Map<string, MemberProfile>()

  if (userIds.length > 0) {
    const { data: memberProfiles, error: memberProfilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    if (memberProfilesError) {
      throw new Error(
        `Failed to load member profiles: ${memberProfilesError.message}`
      )
    }

    profileMap = new Map(
      (memberProfiles ?? []).map((memberProfile) => [
        memberProfile.id,
        {
          email: memberProfile.email ?? null,
          full_name: memberProfile.full_name ?? null,
        },
      ])
    )
  }

  const members: MemberRow[] = (rawMembers ?? []).map((member) => ({
    ...member,
    email:
      member.email ||
      (member.user_id ? profileMap.get(member.user_id)?.email ?? null : null),
  }))

  const activeMembers = members.filter((member) => member.status === 'active')
  const activeUserIds = activeMembers
    .map((member) => member.user_id)
    .filter((id): id is string => Boolean(id))

  const activeMemberCount = activeMembers.length
  const totalReps = activeMembers.filter((member) => member.role === 'rep').length
  const pendingInviteCount = members.filter((member) =>
    isInviteLikeStatus(member.status)
  ).length

  let teamSessions: SessionRow[] = []

  if (activeUserIds.length > 0) {
    const { data: rawSessions, error: sessionsError } = await supabase
      .from('roleplay_sessions')
      .select(
        'id, user_id, overall_score, status, selected_roleplay_type, selected_industry, created_at'
      )
      .in('user_id', activeUserIds)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      throw new Error(`Failed to load team sessions: ${sessionsError.message}`)
    }

    teamSessions = (rawSessions ?? []) as SessionRow[]
  }

  const totalCompanySessions = teamSessions.length
  const recentSessions = teamSessions.slice(0, 6)
  const lastTrainedSession = teamSessions[0] ?? null

  const latestScoreByRep = new Map<string, number>()

  for (const session of teamSessions) {
    if (
      !latestScoreByRep.has(session.user_id) &&
      typeof session.overall_score === 'number'
    ) {
      latestScoreByRep.set(session.user_id, session.overall_score)
    }
  }

  const latestScoreValues = Array.from(latestScoreByRep.values())
  const averageLatestScorePerRep =
    latestScoreValues.length > 0
      ? Math.round(
          latestScoreValues.reduce((sum, value) => sum + value, 0) /
            latestScoreValues.length
        )
      : null

  const teamLimit = parseTeamSize(company.team_size)
  const usagePercent =
    teamLimit && teamLimit > 0
      ? Math.min(100, Math.round((activeMemberCount / teamLimit) * 100))
      : null

  const workspaceHealth = getWorkspaceHealth(activeMemberCount, teamLimit)

  const memberRoleLabel =
    currentCompanyRole.charAt(0).toUpperCase() + currentCompanyRole.slice(1)

  const lastTrainedName = lastTrainedSession
    ? profileMap.get(lastTrainedSession.user_id)?.full_name || 'Unnamed team member'
    : '—'

  const lastTrainedEmail = lastTrainedSession
    ? profileMap.get(lastTrainedSession.user_id)?.email || null
    : null

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
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
            {canViewTeamManagement ? (
              <Link
                href="/team/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
              >
                View analytics
              </Link>
            ) : null}

            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              Open roleplay
              <ChevronRight className="h-4 w-4" />
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
        <div className="mx-auto max-w-[1240px] px-6 py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                Team workspace
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
                {company.name}
              </h1>

              <p className="mt-4 max-w-[760px] text-base leading-8 text-[#5b5d59] md:text-lg">
                Welcome back
                {profile.full_name ? `, ${profile.full_name}` : ''}. You are in
                the company workspace as a {memberRoleLabel.toLowerCase()}.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e2d8cd] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Access level
              </div>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#171714]">
                <Shield className="h-5 w-5 text-[#1f4d38]" />
                {memberRoleLabel}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                {canManageWorkspace
                  ? 'Can invite and manage workspace members.'
                  : canViewTeamManagement
                  ? 'Can view team structure and training workspace.'
                  : 'Can access roleplays and training activity only.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[1240px]">
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
                Active reps inside the company
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <Clock3 className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Pending invites
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {pendingInviteCount}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Not yet activated
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Total company sessions
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {totalCompanySessions}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Across all active team members
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <Target className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Average latest score
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {formatScore(averageLatestScorePerRep)}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Latest scored session per rep
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Seat planning
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
                    Team capacity
                  </h2>
                  <p className="mt-3 text-sm leading-8 text-[#5f625d]">
                    {canManageWorkspace
                      ? 'This workspace is commercially ready once seats, member onboarding, and billing are connected.'
                      : 'This workspace already tracks capacity, team makeup, and training access across the company.'}
                  </p>
                </div>

                <div
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${workspaceHealth.tone}`}
                >
                  {workspaceHealth.label}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Seat limit
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#1b1b18]">
                    {teamLimit ?? 'Not set'}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Seats used
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#1b1b18]">
                    {activeMemberCount}
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Open seats
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#1b1b18]">
                    {teamLimit ? Math.max(teamLimit - activeMemberCount, 0) : '—'}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  <span>Usage</span>
                  <span>{usagePercent !== null ? `${usagePercent}%` : 'Not set'}</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#efe6dc]">
                  <div
                    className="h-full rounded-full bg-[#1f4d38]"
                    style={{ width: `${usagePercent ?? 18}%` }}
                  />
                </div>

                <p className="mt-4 text-sm leading-7 text-[#5f625d]">
                  {workspaceHealth.message}
                </p>
              </div>

              <div className="mt-6 rounded-[22px] border border-[#ece4da] bg-[#faf8f5] p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Who trained last
                </div>

                {lastTrainedSession ? (
                  <div className="mt-4">
                    <div className="text-xl font-semibold text-[#1a1a17]">
                      {lastTrainedName}
                    </div>
                    <div className="mt-1 text-sm text-[#666864]">
                      {lastTrainedEmail || 'No email available'}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                        {lastTrainedSession.selected_roleplay_type || 'Roleplay'}
                      </span>
                      <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                        {lastTrainedSession.selected_industry || 'Industry not set'}
                      </span>
                      <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                        {formatDateTime(lastTrainedSession.created_at)}
                      </span>
                      <span className="rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                        {formatScore(lastTrainedSession.overall_score)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-[#666864]">
                    No one has trained yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Recent sessions across team
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
                Latest team activity
              </h2>

              <div className="mt-5 space-y-3">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => {
                    const sessionName =
                      profileMap.get(session.user_id)?.full_name ||
                      'Unnamed team member'
                    const sessionEmail =
                      profileMap.get(session.user_id)?.email || null

                    return (
                      <div
                        key={session.id}
                        className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#1a1a17]">
                              {sessionName}
                            </div>
                            <div className="mt-1 truncate text-xs text-[#7d7f7a]">
                              {sessionEmail || 'No email available'}
                            </div>
                          </div>

                          <div className="rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                            {formatScore(session.overall_score)}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                            {session.selected_roleplay_type || 'Roleplay'}
                          </span>
                          <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                            {session.selected_industry || 'Industry not set'}
                          </span>
                          <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                            {formatDateTime(session.created_at)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                    No team sessions yet.
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/scenarios"
                  className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
                >
                  Run roleplay
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {canManageWorkspace ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a]"
                  >
                    Billing coming next
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {canViewTeamManagement ? (
            <div className="mt-6">
              <TeamInvitePanel
                members={members}
                canInvite={canManageWorkspace}
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}