import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  ChevronLeft,
  LogOut,
  Mail,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    memberId: string
  }>
}

type MemberRecord = {
  id: string
  email: string | null
  user_id: string | null
  role: string
  status: string
  created_at: string
}

type ProfileRecord = {
  id: string
  email: string | null
  full_name: string | null
}

type SessionRecord = {
  id: string
  user_id: string
  overall_score: number | null
  status: string
  selected_roleplay_type: string | null
  selected_industry: string | null
  created_at: string
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

export default async function TeamMemberAnalyticsPage({ params }: PageProps) {
  const { memberId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: viewerMembership, error: viewerMembershipError } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (viewerMembershipError || !viewerMembership) {
    redirect('/scenarios')
  }

  if (!canViewTeamAnalytics(viewerMembership.role)) {
    redirect('/scenarios')
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', viewerMembership.company_id)
    .maybeSingle()

  if (companyError || !company) {
    redirect('/team')
  }

  const { data: memberRecord, error: memberError } = await supabase
    .from('company_members')
    .select('id, email, user_id, role, status, created_at')
    .eq('company_id', company.id)
    .eq('user_id', memberId)
    .maybeSingle()

  if (memberError || !memberRecord) {
    redirect('/team/analytics')
  }

  const typedMember = memberRecord as MemberRecord

  const { data: memberProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', memberId)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to load member profile: ${profileError.message}`)
  }

  const typedProfile = memberProfile as ProfileRecord | null

  const { data: rawSessions, error: sessionsError } = await supabase
    .from('roleplay_sessions')
    .select(
      'id, user_id, overall_score, status, selected_roleplay_type, selected_industry, created_at'
    )
    .eq('user_id', memberId)
    .order('created_at', { ascending: false })

  if (sessionsError) {
    throw new Error(`Failed to load member sessions: ${sessionsError.message}`)
  }

  const sessions = (rawSessions ?? []) as SessionRecord[]

  const latestSession = sessions[0] ?? null
  const scoredSessions = sessions.filter(
    (session) => typeof session.overall_score === 'number'
  )

  const averageScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce(
            (sum, session) => sum + (session.overall_score ?? 0),
            0
          ) / scoredSessions.length
        )
      : null

  const latestScore =
    latestSession && typeof latestSession.overall_score === 'number'
      ? latestSession.overall_score
      : null

  const memberName = typedProfile?.full_name || 'Unnamed team member'
  const memberEmail = typedMember.email || typedProfile?.email || null

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
              href="/team/analytics"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to analytics
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
            Rep analytics
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
            {memberName}
          </h1>

          <p className="mt-4 max-w-[780px] text-base leading-8 text-[#5b5d59] md:text-lg">
            Individual training activity, roleplay performance, and recent
            session history inside {company.name}.
          </p>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                    <User className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      Team member
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                      {memberName}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#666864]">
                      <Mail className="h-4 w-4" />
                      {memberEmail || 'No email available'}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadge(
                          typedMember.role
                        )}`}
                      >
                        {formatRole(typedMember.role)}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                          typedMember.status
                        )}`}
                      >
                        {formatStatus(typedMember.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Total sessions
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                    {sessions.length}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    All recorded roleplay sessions
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Latest score
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                    {formatScore(latestScore)}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Most recent scored session
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Average score
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                    {formatScore(averageScore)}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Average across all scored sessions
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Last trained
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                    {formatDateTime(latestSession?.created_at ?? null)}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Most recent roleplay activity
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="border-b border-[#ece4da] px-6 py-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Session history
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                  Recent sessions
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                  Review the member’s recent roleplay activity, session type,
                  industry, and score trend.
                </p>
              </div>

              <div className="space-y-3 p-4">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1a1a17]">
                            {session.selected_roleplay_type || 'Roleplay'}
                          </div>
                          <div className="mt-1 text-xs text-[#7d7f7a]">
                            {session.selected_industry || 'Industry not set'}
                          </div>
                        </div>

                        <div className="rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                          {formatScore(session.overall_score)}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                          {formatStatus(session.status)}
                        </span>
                        <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                          {formatDateTime(session.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                    No sessions yet for this team member.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}