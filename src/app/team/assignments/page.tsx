import type { ComponentType, ReactNode } from 'react'
import { redirect } from 'next/navigation'
import {
  CalendarClock,
  ClipboardList,
  PlusCircle,
  Sparkles,
  User2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RowActionMenu from '../../../components/row-action-menu'
import {
  BUYER_MOOD_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLEPLAY_TYPE_OPTIONS,
  DEAL_SIZE_OPTIONS,
  PAIN_LEVEL_OPTIONS,
  COMPANY_STAGE_OPTIONS,
  TIME_PRESSURE_OPTIONS,
  BUYER_ROLE_OPTIONS,
} from '@/types/roleplay'

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
  selected_industry: string | null
  selected_buyer_mood: string | null
  selected_buyer_role: string | null
  selected_deal_size: string | null
  selected_pain_level: string | null
  selected_company_stage: string | null
  selected_time_pressure: string | null
  selected_roleplay_type: string | null
}

function canManageAssignments(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatStatus(status: string | null) {
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
      return 'bg-[#eef5f0] text-[#1f4d38]'
    case 'in_progress':
      return 'bg-[#eef4ff] text-[#355c9a]'
    case 'overdue':
      return 'bg-[#fff4ed] text-[#a2542f]'
    case 'cancelled':
    case 'archived':
      return 'bg-[#f1eee9] text-[#666864]'
    default:
      return 'bg-[#fff8f3] text-[#b35b33]'
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

  if (!user) redirect('/login')

  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (membershipError || !membership) redirect('/scenarios')
  if (!canManageAssignments(membership.role)) redirect('/team')

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .maybeSingle()

  if (companyError || !company) redirect('/team')

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

  if (membersError) throw new Error(`Failed to load members: ${membersError.message}`)
  if (scenariosError) throw new Error(`Failed to load scenarios: ${scenariosError.message}`)
  if (assignmentsError) throw new Error(`Failed to load assignments: ${assignmentsError.message}`)

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

  const scenarioMap = new Map(
    scenarioList.map((scenario) => [scenario.id, scenario])
  )

  const assignableMembers = members
    .filter((member) => member.user_id && member.role === 'rep')
    .map((member) => {
      const profile = member.user_id ? profileMap.get(member.user_id) : null

      return {
        user_id: member.user_id as string,
        email: member.email || profile?.email || null,
        full_name: profile?.full_name || 'Unnamed rep',
      }
    })

  const totalAssignments = assignments.length
  const pendingAssignments = assignments.filter((a) => a.status === 'assigned').length
  const inProgressAssignments = assignments.filter((a) => a.status === 'in_progress').length
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length

    return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Team assignments
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={totalAssignments} icon={ClipboardList} tone="orange" />
        <StatCard label="Pending" value={pendingAssignments} icon={CalendarClock} tone="orange" />
        <StatCard label="In progress" value={inProgressAssignments} icon={Sparkles} tone="blue" />
        <StatCard label="Completed" value={completedAssignments} icon={User2} tone="green" />
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Create assignment
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#171714]">
              New roleplay task
            </h2>
          </div>

          <div className="rounded-full bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#666864]">
            Required setup first, extras collapsed
          </div>
        </div>

        <form action="/api/team/assignments/create" method="post" className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <SelectField name="assignedToUserId" label="Assign to" required>
              <option value="">Select a rep</option>
              {assignableMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.full_name} {member.email ? `(${member.email})` : ''}
                </option>
              ))}
            </SelectField>

            <SelectField name="selectedIndustry" label="Industry" required>
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </SelectField>

            <SelectField name="selectedRoleplayType" label="Roleplay type" required>
              <option value="">Select type</option>
              {ROLEPLAY_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <SelectField name="selectedBuyerRole" label="Buyer role" required>
              <option value="">Select role</option>
              {BUYER_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </SelectField>

            <SelectField name="selectedBuyerMood" label="Buyer mood" required>
              <option value="">Select mood</option>
              {BUYER_MOOD_OPTIONS.map((mood) => (
                <option key={mood.value} value={mood.value}>{mood.label}</option>
              ))}
            </SelectField>

            <SelectField name="scenarioId" label="Scenario" required>
              <option value="">Select scenario</option>
              {scenarioList.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title} {scenario.industry ? `• ${scenario.industry}` : ''} • {formatStatus(scenario.difficulty)}
                </option>
              ))}
            </SelectField>
          </div>

          <details className="rounded-[22px] bg-[#faf8f5] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#171714]">
              Advanced roleplay settings
            </summary>

            <div className="mt-4 grid gap-4 lg:grid-cols-4">
              <SelectField name="selectedPainLevel" label="Pain level" required>
                <option value="">Select pain</option>
                {PAIN_LEVEL_OPTIONS.map((pain) => (
                  <option key={pain.value} value={pain.value}>{pain.label}</option>
                ))}
              </SelectField>

              <SelectField name="selectedCompanyStage" label="Company stage" required>
                <option value="">Select stage</option>
                {COMPANY_STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </SelectField>

              <SelectField name="selectedTimePressure" label="Time pressure" required>
                <option value="">Select pressure</option>
                {TIME_PRESSURE_OPTIONS.map((time) => (
                  <option key={time.value} value={time.value}>{time.label}</option>
                ))}
              </SelectField>

              <SelectField name="selectedDealSize" label="Deal size">
                <option value="">Select deal size</option>
                {DEAL_SIZE_OPTIONS.map((dealSize) => (
                  <option key={dealSize} value={dealSize}>{dealSize}</option>
                ))}
              </SelectField>
            </div>
          </details>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_220px]">
            <InputField
              name="title"
              label="Assignment title"
              placeholder="Example: Handle pricing objection by Friday"
            />

            <InputField name="dueAt" label="Due date" type="datetime-local" />

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                <PlusCircle className="h-4 w-4" />
                Create
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555854]">
              Instructions
            </label>
            <textarea
              name="note"
              rows={3}
              placeholder="Add coaching context or focus areas."
              className="w-full resize-none rounded-[18px] bg-[#faf8f5] px-4 py-3 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] placeholder:text-[#9a9c97] focus:bg-white focus:ring-[#d6612d]"
            />
          </div>

          <input
            type="hidden"
            name="creatorTimezone"
            value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        </form>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Current assignments
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#171714]">
              Assignment queue
            </h2>
          </div>

          <span className="rounded-full bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#666864]">
            {assignments.length} total
          </span>
        </div>

        <div className="overflow-hidden rounded-[22px] bg-[#faf8f5]">
          {assignments.length > 0 ? (
            <div className="divide-y divide-[#ece4da]">
              {assignments.map((assignment) => {
                const assignedToProfile = profileMap.get(assignment.assigned_to_user_id)
                const assignedByProfile = profileMap.get(assignment.assigned_by_user_id)
                const scenario = scenarioMap.get(assignment.scenario_id)

                return (
                  <div key={assignment.id} className="bg-[#faf8f5] px-4 py-4 transition hover:bg-white">
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#171714]">
                          {assignment.title || scenario?.title || 'Assigned roleplay'}
                        </div>
                        <div className="mt-1 truncate text-xs text-[#777a75]">
                          {scenario?.title || 'Unknown scenario'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                          Assigned to
                        </div>
                        <div className="mt-1 truncate text-sm font-medium text-[#1f1f1c]">
                          {assignedToProfile?.full_name || assignedToProfile?.email || 'Unknown rep'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                          Due date
                        </div>
                        <div className="mt-1 text-sm text-[#555854]">
                          {formatDateTime(assignment.due_at)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 lg:justify-end">
                        <Badge className={getStatusBadge(assignment.status)}>
                          {formatStatus(assignment.status)}
                        </Badge>

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

                    <div className="mt-3 flex flex-wrap gap-2">
                      {assignment.selected_roleplay_type ? <Badge>{assignment.selected_roleplay_type}</Badge> : null}
                      {assignment.selected_industry ? <Badge>{assignment.selected_industry}</Badge> : null}
                      {assignment.selected_buyer_mood ? <Badge>Mood: {formatStatus(assignment.selected_buyer_mood)}</Badge> : null}
                      {assignment.selected_buyer_role ? <Badge>{assignment.selected_buyer_role}</Badge> : null}
                    </div>

                    {assignment.note ? (
                      <div className="mt-3 rounded-[16px] bg-white/80 px-4 py-3 text-xs leading-6 text-[#5f625d]">
                        {assignment.note}
                      </div>
                    ) : null}

                    <div className="mt-3 text-xs text-[#777a75]">
                      Assigned by:{' '}
                      <span className="font-medium text-[#1f1f1c]">
                        {assignedByProfile?.full_name || assignedByProfile?.email || 'Unknown manager'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-[#666864]">
              No assignments yet. Create the first roleplay assignment for a rep.
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
  value: string | number
  icon: ComponentType<{ className?: string }>
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

function SelectField({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#555854]">
        {label}
      </label>
      <select
        name={name}
        required={required}
        className="h-[46px] w-full rounded-[16px] bg-[#faf8f5] px-4 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] focus:bg-white focus:ring-[#d6612d]"
      >
        {children}
      </select>
    </div>
  )
}

function InputField({
  label,
  name,
  type = 'text',
  placeholder,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#555854]">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="h-[46px] w-full rounded-[16px] bg-[#faf8f5] px-4 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] placeholder:text-[#9a9c97] focus:bg-white focus:ring-[#d6612d]"
      />
    </div>
  )
}

function Badge({
  children,
  className = 'bg-white text-[#555854]',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  )
}
