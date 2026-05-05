import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mail, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import TeamInvitePanel from '../team-invite-panel'

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

function canManageWorkspace(role: string | null) {
  return role === 'owner' || role === 'admin'
}

function canViewMembers(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function badgeClass(status: string) {
  if (status === 'active') return 'bg-[#eef5f0] text-[#1f4d38]'
  if (status === 'pending' || status === 'invited') return 'bg-[#fff8f3] text-[#b35b33]'
  return 'bg-[#f1eee9] text-[#666864]'
}

export default async function TeamMembersPage() {
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

  if (!membership || !canViewMembers(membership.role)) redirect('/team')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .maybeSingle()

  if (!company) redirect('/team')

  const [{ data: rawMembers }, { data: subscription }] = await Promise.all([
    supabase
      .from('company_members')
      .select('id, email, user_id, role, status, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('company_subscriptions')
      .select('status, seat_limit, current_period_end')
      .eq('company_id', company.id)
      .maybeSingle(),
  ])

  const members = (rawMembers ?? []) as MemberRow[]
  const userIds = members
    .map((member) => member.user_id)
    .filter((id): id is string => Boolean(id))

  let profileMap = new Map<string, ProfileRow>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    profileMap = new Map(
      ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    )
  }

  const enrichedMembers = members.map((member) => {
    const profile = member.user_id ? profileMap.get(member.user_id) : null

    return {
      ...member,
      email: member.email || profile?.email || null,
      full_name: profile?.full_name || null,
    }
  })

  const activeMembers = enrichedMembers.filter((member) => member.status === 'active')
  const reps = activeMembers.filter((member) => member.role === 'rep')
  const managers = activeMembers.filter((member) =>
    ['owner', 'admin', 'manager'].includes(member.role)
  )

  const hasActiveTeamSubscription =
    subscription?.status === 'active' &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end).getTime() > Date.now())

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Team members
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
          Manage workspace members
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666864]">
          Invite reps, review active members, and manage your team workspace access.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active members" value={activeMembers.length} icon={Users} tone="green" />
        <StatCard label="Reps" value={reps.length} icon={UserRound} tone="orange" />
        <StatCard label="Managers" value={managers.length} icon={Mail} tone="blue" />
      </div>

      <TeamInvitePanel
        members={enrichedMembers}
        canInvite={canManageWorkspace(membership.role) && hasActiveTeamSubscription}
      />

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Member list
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#171714]">
              Current members
            </h2>
          </div>

          <Link
            href="/team/request-seats"
            className="rounded-full bg-[#1f4d38] px-4 py-2 text-xs font-semibold text-white"
          >
            Request seats
          </Link>
        </div>

        <div className="overflow-hidden rounded-[22px] bg-[#faf8f5]">
          {enrichedMembers.length > 0 ? (
            <div className="divide-y divide-[#ece4da]">
              {enrichedMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid gap-4 px-4 py-4 transition hover:bg-white md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr]"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#171714]">
                      {member.full_name || 'Unnamed member'}
                    </div>
                    <div className="mt-1 text-xs text-[#777a75]">
                      {member.email || 'No email'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Role
                    </div>
                    <div className="mt-1 text-sm capitalize text-[#555854]">
                      {member.role}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Status
                    </div>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClass(member.status)}`}>
                      {member.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Joined
                    </div>
                    <div className="mt-1 text-sm text-[#555854]">
                      {formatDate(member.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-[#666864]">
              No members found.
            </div>
          )}
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
  value: number | string
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