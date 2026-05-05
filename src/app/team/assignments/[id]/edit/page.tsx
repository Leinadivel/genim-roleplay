import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  FileEdit,
  LogOut,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

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

function toDateTimeLocal(value: string | null) {
  if (!value) return ''

  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  if (membershipError || !membership || !canManageAssignments(membership.role)) {
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
    { data: assignment, error: assignmentError },
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
      .eq('id', id)
      .eq('company_id', company.id)
      .maybeSingle(),
  ])

  if (membersError) {
    throw new Error(`Failed to load members: ${membersError.message}`)
  }

  if (scenariosError) {
    throw new Error(`Failed to load scenarios: ${scenariosError.message}`)
  }

  if (assignmentError || !assignment) {
    redirect('/team/assignments')
  }

  const typedMembers = (rawMembers ?? []) as CompanyMemberRow[]
  const typedAssignment = assignment as AssignmentRow
  const scenarioList = (scenarios ?? []) as ScenarioRow[]

  const memberUserIds = typedMembers
    .map((member) => member.user_id)
    .filter((value): value is string => Boolean(value))

  let profileMap = new Map<string, ProfileRow>()
  if (memberUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', memberUserIds)

    if (profilesError) {
      throw new Error(`Failed to load profiles: ${profilesError.message}`)
    }

    profileMap = new Map(
      ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    )
  }

  const assignableMembers = typedMembers
    .filter((member) => member.user_id && member.role === 'rep')
    .map((member) => {
      const profile = member.user_id ? profileMap.get(member.user_id) : null

      return {
        user_id: member.user_id as string,
        email: member.email || profile?.email || null,
        full_name: profile?.full_name || 'Unnamed rep',
      }
    })

  const isLocked =
    typedAssignment.status === 'completed' ||
    typedAssignment.status === 'archived' ||
    typedAssignment.status === 'cancelled'

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      {/* Top */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
            Edit assignment
          </div>
          <h1 className="mt-1 text-xl font-semibold text-[#171714]">
            Update roleplay task
          </h1>
        </div>

        <Link
          href="/team/assignments"
          className="inline-flex items-center gap-2 rounded-full bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#555854] hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Lock Notice */}
      {isLocked && (
        <div className="rounded-[18px] bg-[#faf8f5] px-4 py-3 text-sm text-[#5f625d]">
          This assignment is <span className="font-medium">{typedAssignment.status}</span> and can no longer be edited.
        </div>
      )}

      {/* Form */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.06)]">
        <form
          action="/api/team/assignments/update"
          method="post"
          className="space-y-5"
        >
          <input type="hidden" name="assignmentId" value={typedAssignment.id} />
          <input
            type="hidden"
            name="creatorTimezone"
            value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />

          <SelectField
            label="Assign to"
            name="assignedToUserId"
            defaultValue={typedAssignment.assigned_to_user_id}
            disabled={isLocked}
          >
            <option value="">Select a rep</option>
            {assignableMembers.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.full_name} {member.email ? `(${member.email})` : ''}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Scenario"
            name="scenarioId"
            defaultValue={typedAssignment.scenario_id}
            disabled={isLocked}
          >
            <option value="">Select a scenario</option>
            {scenarioList.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title} {scenario.industry ? `• ${scenario.industry}` : ''} •{' '}
                {formatStatus(scenario.difficulty)}
              </option>
            ))}
          </SelectField>

          <InputField
            label="Assignment title"
            name="title"
            defaultValue={typedAssignment.title || ''}
            disabled={isLocked}
          />

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555854]">
              Instructions
            </label>
            <textarea
              name="note"
              rows={3}
              defaultValue={typedAssignment.note || ''}
              disabled={isLocked}
              className="w-full resize-none rounded-[16px] bg-[#faf8f5] px-4 py-3 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] disabled:opacity-60 focus:bg-white focus:ring-[#d6612d]"
            />
          </div>

          <InputField
            label="Due date"
            name="dueAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(typedAssignment.due_at)}
            disabled={isLocked}
          />

          {!isLocked && (
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              <FileEdit className="h-4 w-4" />
              Save changes
            </button>
          )}
        </form>
      </div>
    </div>
  )

  function SelectField({
    label,
    name,
    children,
    defaultValue,
    disabled,
  }: any) {
    return (
      <div>
        <label className="mb-2 block text-xs font-semibold text-[#555854]">
          {label}
        </label>
        <select
          name={name}
          defaultValue={defaultValue}
          disabled={disabled}
          className="h-[46px] w-full rounded-[16px] bg-[#faf8f5] px-4 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] disabled:opacity-60 focus:bg-white focus:ring-[#d6612d]"
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
    defaultValue,
    disabled,
  }: any) {
    return (
      <div>
        <label className="mb-2 block text-xs font-semibold text-[#555854]">
          {label}
        </label>
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          disabled={disabled}
          className="h-[46px] w-full rounded-[16px] bg-[#faf8f5] px-4 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] disabled:opacity-60 focus:bg-white focus:ring-[#d6612d]"
        />
      </div>
    )
  }
}