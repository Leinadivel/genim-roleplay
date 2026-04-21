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
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[980px] items-center justify-between px-6 py-5">
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
              href="/team/assignments"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to assignments
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
        <div className="mx-auto max-w-[980px] px-6 py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                Edit assignment
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-5xl">
                Update team roleplay assignment
              </h1>

              <p className="mt-4 text-base leading-8 text-[#5b5d59] md:text-lg">
                Edit the rep, scenario, notes, and due date. Completed, archived,
                and cancelled assignments are locked from editing.
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
                {isLocked
                  ? 'This assignment is currently locked.'
                  : 'You can edit this assignment.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Assignment details
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
              Rep, scenario, notes, and due date
            </h2>

            {isLocked ? (
              <div className="mt-5 rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm leading-7 text-[#5f625d]">
                This assignment is locked because it is {typedAssignment.status}.
                Keep it for history, but do not edit it further.
              </div>
            ) : null}

            <form
              action="/api/team/assignments/update"
              method="post"
              className="mt-6 space-y-5"
            >
              <input type="hidden" name="assignmentId" value={typedAssignment.id} />
              <input
                type="hidden"
                name="creatorTimezone"
                value={Intl.DateTimeFormat().resolvedOptions().timeZone}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Assign to
                </label>
                <select
                  name="assignedToUserId"
                  required
                  defaultValue={typedAssignment.assigned_to_user_id}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
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
                  defaultValue={typedAssignment.scenario_id}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
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
                  defaultValue={typedAssignment.title || ''}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Instructions
                </label>
                <textarea
                  name="note"
                  rows={4}
                  defaultValue={typedAssignment.note || ''}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Due date
                </label>
                <input
                  type="datetime-local"
                  name="dueAt"
                  defaultValue={toDateTimeLocal(typedAssignment.due_at)}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
                <p className="mt-2 text-xs leading-6 text-[#777a75]">
                  Save due dates in UTC so they behave correctly across countries and timezones.
                </p>
              </div>

              {!isLocked ? (
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  <FileEdit className="h-4 w-4" />
                  Save changes
                </button>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}