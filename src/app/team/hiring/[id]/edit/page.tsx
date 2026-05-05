import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  FileEdit,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type ScenarioRow = {
  id: string
  title: string
  description: string | null
  difficulty: string
  industry: string | null
  active: boolean
}

type AssessmentRow = {
  id: string
  company_id: string
  candidate_name: string | null
  candidate_email: string
  title: string | null
  note: string | null
  status: string
  expires_at: string | null
  scenario_id: string
  completed_session_id: string | null
}

function canManageHiring(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatStatus(status: string) {
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

export default async function EditHiringAssessmentPage({
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

  if (membershipError || !membership || !canManageHiring(membership.role)) {
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
    { data: assessment, error: assessmentError },
    { data: scenarios, error: scenariosError },
  ] = await Promise.all([
    supabase
      .from('candidate_roleplay_assessments')
      .select(
        'id, company_id, candidate_name, candidate_email, title, note, status, expires_at, scenario_id, completed_session_id'
      )
      .eq('id', id)
      .eq('company_id', company.id)
      .maybeSingle(),
    supabase
      .from('scenarios')
      .select('id, title, description, difficulty, industry, active')
      .eq('active', true)
      .order('title', { ascending: true }),
  ])

  if (assessmentError || !assessment) {
    redirect('/team/hiring')
  }

  if (scenariosError) {
    throw new Error(`Failed to load scenarios: ${scenariosError.message}`)
  }

  const typedAssessment = assessment as AssessmentRow
  const scenarioList = (scenarios ?? []) as ScenarioRow[]
  const isLocked =
    typedAssessment.status === 'completed' ||
    typedAssessment.status === 'archived' ||
    typedAssessment.status === 'cancelled'

    return (
      <div className="mx-auto max-w-[720px] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Edit assessment
            </div>
            <h1 className="mt-1 text-xl font-semibold text-[#171714]">
              Update candidate assessment
            </h1>
          </div>

          <Link
            href="/team/hiring"
            className="inline-flex items-center gap-2 rounded-full bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#555854] hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {isLocked ? (
          <div className="rounded-[18px] bg-[#faf8f5] px-4 py-3 text-sm text-[#5f625d]">
            This assessment is <span className="font-medium">{typedAssessment.status}</span> and can no longer be edited.
          </div>
        ) : null}

        <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.06)]">
          <form
            action="/api/team/hiring/update"
            method="post"
            className="space-y-5"
          >
            <input type="hidden" name="assessmentId" value={typedAssessment.id} />

            <input
              type="hidden"
              name="creatorTimezone"
              value={Intl.DateTimeFormat().resolvedOptions().timeZone}
            />

            <InputField
              label="Candidate name"
              name="candidateName"
              defaultValue={typedAssessment.candidate_name || ''}
              disabled={isLocked}
            />

            <InputField
              label="Candidate email"
              name="candidateEmail"
              type="email"
              required
              defaultValue={typedAssessment.candidate_email}
              disabled={isLocked}
            />

            <SelectField
              label="Scenario"
              name="scenarioId"
              defaultValue={typedAssessment.scenario_id}
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
              label="Assessment title"
              name="title"
              defaultValue={typedAssessment.title || ''}
              disabled={isLocked}
            />

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#555854]">
                Instructions
              </label>
              <textarea
                name="note"
                rows={3}
                defaultValue={typedAssessment.note || ''}
                disabled={isLocked}
                className="w-full resize-none rounded-[16px] bg-[#faf8f5] px-4 py-3 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] disabled:opacity-60 focus:bg-white focus:ring-[#d6612d]"
              />
            </div>

            <InputField
              label="Expires at"
              name="expiresAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(typedAssessment.expires_at)}
              disabled={isLocked}
            />

            {!isLocked ? (
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                <FileEdit className="h-4 w-4" />
                Save changes
              </button>
            ) : null}
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
    }: {
      label: string
      name: string
      children: React.ReactNode
      defaultValue?: string
      disabled?: boolean
    }) {
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
      required,
    }: {
      label: string
      name: string
      type?: string
      defaultValue?: string
      disabled?: boolean
      required?: boolean
    }) {
      return (
        <div>
          <label className="mb-2 block text-xs font-semibold text-[#555854]">
            {label}
          </label>
          <input
            type={type}
            name={name}
            required={required}
            defaultValue={defaultValue}
            disabled={disabled}
            className="h-[46px] w-full rounded-[16px] bg-[#faf8f5] px-4 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] disabled:opacity-60 focus:bg-white focus:ring-[#d6612d]"
          />
        </div>
      )
    }
}