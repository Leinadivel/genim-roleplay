import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Archive,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  FileEdit,
  LogOut,
  PlusCircle,
  Shield,
  Sparkles,
  Trash2,
  User2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RowActionMenu from '../../../components/row-action-menu'

type CompanyMemberRow = {
  id: string
  company_id: string
  user_id: string | null
  email: string | null
  role: string
  status: string
  created_at: string
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
}

type ScenarioRow = {
  id: string
  title: string
  difficulty: string
  industry: string | null
  active: boolean
}

type AssignmentRow = {
  id: string
  company_id: string
  assigned_to_user_id: string
  assigned_by_user_id: string
  scenario_id: string
  buyer_persona_id: string | null
  title: string | null
  note: string | null
  due_at: string | null
  status: string
  completed_session_id: string | null
  created_at: string
  updated_at: string
}

function canManageAssignments(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatRole(role: string) {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatStatus(status: string) {
  if (!status) return '—'
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDateTime(value: string | null) {
  if (!value) return 'No due date'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    case 'in_progress':
      return 'border-[#dbe5f6] bg-[#eef4ff] text-[#355c9a]'
    case 'overdue':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    case 'cancelled':
    case 'archived':
      return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
    default:
      return 'border-[#efe1d5] bg-[#fff8f3] text-[#b35b33]'
  }
}

function canDeleteAssignment(assignment: AssignmentRow) {
  return assignment.status === 'assigned' && !assignment.completed_session_id
}

function canArchiveAssignment(assignment: AssignmentRow) {
  return assignment.status !== 'archived' && assignment.status !== 'cancelled'
}

export default async function TeamAssignmentsPage() {
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

  if (!canManageAssignments(membership.role)) {
    redirect('/team')
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .maybeSingle()

  if (companyError || !company) {
    redirect('/team')
  }

  const [
    { data: rawMembers, error: membersError },
    { data: scenarios, error: scenariosError },
    { data: rawAssignments, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from('company_members')
      .select('id, company_id, user_id, email, role, status, created_at')
      .eq('company_id', company.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('scenarios')
      .select('id, title, difficulty, industry, active')
      .eq('active', true)
      .order('title', { ascending: true }),
    supabase
      .from('team_roleplay_assignments')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false }),
  ])

  if (membersError) {
    throw new Error(`Failed to load members: ${membersError.message}`)
  }

  if (scenariosError) {
    throw new Error(`Failed to load scenarios: ${scenariosError.message}`)
  }

  if (assignmentsError) {
    throw new Error(`Failed to load assignments: ${assignmentsError.message}`)
  }

  const members = (rawMembers ?? []) as CompanyMemberRow[]
  const scenarioList = (scenarios ?? []) as ScenarioRow[]
  const assignments = (rawAssignments ?? []) as AssignmentRow[]

  const memberUserIds = members
    .map((member) => member.user_id)
    .filter((value): value is string => Boolean(value))

  const assignmentActorIds = assignments
    .flatMap((assignment) => [
      assignment.assigned_to_user_id,
      assignment.assigned_by_user_id,
    ])
    .filter((value): value is string => Boolean(value))

  const allUserIds = Array.from(new Set([...memberUserIds, ...assignmentActorIds]))

  let profileMap = new Map<string, ProfileRow>()
  if (allUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', allUserIds)

    if (profilesError) {
      throw new Error(`Failed to load profiles: ${profilesError.message}`)
    }

    profileMap = new Map(
      ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    )
  }

  const scenarioMap = new Map(scenarioList.map((scenario) => [scenario.id, scenario]))

  const assignableMembers = members
    .filter((member) => member.user_id && member.role === 'rep')
    .map((member) => {
      const profile = member.user_id ? profileMap.get(member.user_id) : null

      return {
        id: member.id,
        user_id: member.user_id as string,
        role: member.role,
        email: member.email || profile?.email || null,
        full_name: profile?.full_name || 'Unnamed rep',
      }
    })

  const totalAssignments = assignments.length
  const pendingAssignments = assignments.filter(
    (assignment) => assignment.status === 'assigned'
  ).length
  const inProgressAssignments = assignments.filter(
    (assignment) => assignment.status === 'in_progress'
  ).length
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === 'completed'
  ).length

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
              Back to dashboard
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[820px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                Team assignments
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
                Assign roleplays to your reps
              </h1>

              <p className="mt-4 max-w-[760px] text-base leading-8 text-[#5b5d59] md:text-lg">
                Create structured roleplay tasks for your sales team, track who has started,
                who has completed, and keep practice tied to team performance.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e2d8cd] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Access level
              </div>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#171714]">
                <Shield className="h-5 w-5 text-[#1f4d38]" />
                {formatRole(membership.role)}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Owners, admins, and managers can assign and manage roleplays.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Total assignments
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {totalAssignments}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                All team roleplay assignments
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4ed] text-[#d6612d]">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Pending
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {pendingAssignments}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Assigned but not started yet
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#355c9a]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                In progress
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {inProgressAssignments}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Reps currently working on them
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <User2 className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Completed
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {completedAssignments}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Finished roleplay assignments
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Create assignment
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
                Assign a new roleplay
              </h2>
              <p className="mt-3 text-sm leading-8 text-[#5f625d]">
                Pick a rep, select a scenario, optionally add instructions and due date,
                then create the assignment.
              </p>

              <div className="mt-4 rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm leading-7 text-[#5f625d]">
                Due dates should be stored in UTC so assignments still expire correctly
                when managers and reps are in different countries.
              </div>

              <form action="/api/team/assignments/create" method="post" className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Assign to
                  </label>
                  <select
                    name="assignedToUserId"
                    required
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none"
                  >
                    <option value="">Select a rep</option>
                    {assignableMembers.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.full_name} {member.email ? `(${member.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Scenario
                  </label>
                  <select
                    name="scenarioId"
                    required
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none"
                  >
                    <option value="">Select a scenario</option>
                    {scenarioList.map((scenario) => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.title} {scenario.industry ? `• ${scenario.industry}` : ''} •{' '}
                        {formatStatus(scenario.difficulty)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Assignment title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Example: Handle pricing objection by Friday"
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Instructions
                  </label>
                  <textarea
                    name="note"
                    rows={4}
                    placeholder="Add any coaching context or what the rep should focus on."
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Due date
                  </label>
                  <input
                    type="datetime-local"
                    name="dueAt"
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[#777a75]">
                    This should be converted to UTC when saved.
                  </p>
                </div>

                <input
                  type="hidden"
                  name="creatorTimezone"
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create assignment
                </button>
              </form>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="border-b border-[#ece4da] px-6 py-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Assignment list
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                  Current team assignments
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                  View all assignments across the company, edit details, archive old items,
                  and track completion status.
                </p>
              </div>

              <div className="space-y-3 p-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => {
                    const assignedToProfile = profileMap.get(assignment.assigned_to_user_id)
                    const assignedByProfile = profileMap.get(assignment.assigned_by_user_id)
                    const scenario = scenarioMap.get(assignment.scenario_id)

                    return (
                      <div
                        key={assignment.id}
                        className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-[#1a1a17]">
                              {assignment.title || scenario?.title || 'Assigned roleplay'}
                            </div>

                            <div className="mt-1 text-sm text-[#666864]">
                              Scenario: {scenario?.title || 'Unknown scenario'}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                                  assignment.status
                                )}`}
                              >
                                {formatStatus(assignment.status)}
                              </span>

                              <span className="inline-flex rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                                Due: {formatDateTime(assignment.due_at)}
                              </span>
                            </div>

                            <div className="mt-4 space-y-1 text-sm text-[#555854]">
                              <div>
                                Assigned to:{' '}
                                <span className="font-medium text-[#1f1f1c]">
                                  {assignedToProfile?.full_name || assignedToProfile?.email || 'Unknown rep'}
                                </span>
                              </div>
                              <div>
                                Assigned by:{' '}
                                <span className="font-medium text-[#1f1f1c]">
                                  {assignedByProfile?.full_name || assignedByProfile?.email || 'Unknown manager'}
                                </span>
                              </div>
                            </div>

                            {assignment.note ? (
                              <div className="mt-4 rounded-[16px] border border-[#e7ddd3] bg-white px-4 py-3 text-sm leading-7 text-[#5f625d]">
                                {assignment.note}
                              </div>
                            ) : null}
                          </div>

                          <div className="shrink-0 self-start">
                            <RowActionMenu
                              items={[
                                {
                                  type: 'link',
                                  label: 'Edit',
                                  href: `/team/assignments/${assignment.id}/edit`,
                                  icon: 'edit',
                                },
                                ...(canArchiveAssignment(assignment)
                                  ? [
                                      {
                                        type: 'form' as const,
                                        label: 'Archive',
                                        action: '/api/team/assignments/archive',
                                        valueName: 'assignmentId',
                                        value: assignment.id,
                                        icon: 'archive' as const,
                                      },
                                    ]
                                  : []),
                                ...(canDeleteAssignment(assignment)
                                  ? [
                                      {
                                        type: 'form' as const,
                                        label: 'Delete',
                                        action: '/api/team/assignments/delete',
                                        valueName: 'assignmentId',
                                        value: assignment.id,
                                        icon: 'delete' as const,
                                        danger: true,
                                      },
                                    ]
                                  : []),
                                ...(assignment.completed_session_id
                                  ? [
                                      {
                                        type: 'link' as const,
                                        label: 'View report',
                                        href: `/session/${assignment.completed_session_id}/report`,
                                        icon: 'report' as const,
                                      },
                                    ]
                                  : []),
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                    No assignments yet. Create the first roleplay assignment for a rep.
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