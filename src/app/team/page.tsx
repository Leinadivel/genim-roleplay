import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Sparkles,
  Target,
  Briefcase,
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

function isInviteLikeStatus(status: string | null | undefined) {
  return status === 'pending' || status === 'invited'
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

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!membership) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .maybeSingle()

  if (!company) redirect('/login')

  const { data: membersRaw } = await supabase
    .from('company_members')
    .select('id, email, user_id, role, status, created_at')
    .eq('company_id', company.id)

  const userIds = (membersRaw ?? [])
    .map((m) => m.user_id)
    .filter((id): id is string => Boolean(id))

  let profileMap = new Map<string, MemberProfile>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        { email: p.email, full_name: p.full_name },
      ])
    )
  }

  const members: MemberRow[] = (membersRaw ?? []).map((m) => ({
    ...m,
    email:
      m.email ||
      (m.user_id ? profileMap.get(m.user_id)?.email ?? null : null),
  }))

  const activeMembers = members.filter((m) => m.status === 'active')
  const activeUserIds = activeMembers
    .map((m) => m.user_id)
    .filter((id): id is string => Boolean(id))

  const { data: sessionsRaw } =
    activeUserIds.length > 0
      ? await supabase
          .from('roleplay_sessions')
          .select(
            'id, user_id, overall_score, selected_roleplay_type, selected_industry, created_at'
          )
          .in('user_id', activeUserIds)
          .order('created_at', { ascending: false })
      : { data: [] }

  const sessions = (sessionsRaw ?? []) as SessionRow[]

  const totalReps = activeMembers.filter((m) => m.role === 'rep').length
  const pendingInvites = members.filter((m) =>
    isInviteLikeStatus(m.status)
  ).length

  const avgScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) /
            sessions.length
        )
      : null

  const recentSessions = sessions.slice(0, 5)

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      {/* <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
            Team overview
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
            {company.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#666864]">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.
            Track team activity, hiring, and roleplay progress from one place.
          </p>
        </div>
      </div> */}

      <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total reps" value={totalReps} icon={Users} tone="orange" />
        <StatCard label="Pending invites" value={pendingInvites} icon={Clock3} tone="green" />
        <StatCard label="Total sessions" value={sessions.length} icon={Sparkles} tone="orange" />
        <StatCard label="Average score" value={formatScore(avgScore)} icon={Target} tone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[22px] border border-[#eee6dc] bg-white p-5 shadow-[0_10px_28px_rgba(25,25,20,0.035)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
                Quick access
              </div>
              <h2 className="mt-1 text-base font-semibold text-[#171714]">
                Continue work
              </h2>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionCard
              title="Hiring"
              desc="Create candidate assessments"
              icon={Briefcase}
              href="/team/hiring"
            />
            <ActionCard
              title="Assignments"
              desc="Assign practice to reps"
              icon={ClipboardList}
              href="/team/assignments"
            />
          </div>
        </div>

        <div className="rounded-[22px] border border-[#eee6dc] bg-white p-5 shadow-[0_10px_28px_rgba(25,25,20,0.035)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
                Recent activity
              </div>
              <h2 className="mt-1 text-base font-semibold text-[#171714]">
                Latest sessions
              </h2>
            </div>

            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Run roleplay
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {recentSessions.length > 0 ? (
              recentSessions.map((s) => {
                const name = profileMap.get(s.user_id)?.full_name || 'User'

                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-4 rounded-[16px] border border-[#f1e9e0] bg-[#faf8f5] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#1a1a17]">
                        {name}
                      </div>
                      <div className="mt-1 truncate text-xs text-[#777a75]">
                        {s.selected_roleplay_type || 'Roleplay'} •{' '}
                        {formatDateTime(s.created_at)}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                      {formatScore(s.overall_score)}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-[16px] border border-[#f1e9e0] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                No activity yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <TeamInvitePanel members={members} canInvite />
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
  tone: 'green' | 'orange'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-[#eef5f0] text-[#1f4d38]'
      : 'bg-[#f7ede6] text-[#d6612d]'

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_30px_rgba(25,25,20,0.06)] transition hover:shadow-[0_12px_40px_rgba(25,25,20,0.08)]">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.13em] text-[#8a8d87]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
        {value}
      </div>
    </div>
  )
}

function ActionCard({
  title,
  desc,
  icon: Icon,
  href,
}: {
  title: string
  desc: string
  icon: any
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-[18px] border border-[#f1e9e0] bg-[#faf8f5] p-4 transition hover:bg-white hover:shadow-[0_10px_24px_rgba(25,25,20,0.045)]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#1f4d38] shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-sm font-semibold text-[#171714]">{title}</div>
      <div className="mt-1 text-xs leading-5 text-[#666864]">{desc}</div>
    </Link>
  )
}