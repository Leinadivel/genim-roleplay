import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  FileEdit,
  LogOut,
  Shield,
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
              href="/team/hiring"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to hiring
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
                Edit hiring assessment
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-5xl">
                Update candidate assessment
              </h1>

              <p className="mt-4 text-base leading-8 text-[#5b5d59] md:text-lg">
                Edit the candidate details, scenario, notes, and expiry. Completed,
                archived, and cancelled assessments are locked from editing.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e2d8cd] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Access level
              </div>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#171714]">
                <Shield className="h-5 w-5 text-[#1f4d38]" />
                {formatStatus(membership.role)}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                {isLocked
                  ? 'This assessment is currently locked.'
                  : 'You can edit this assessment.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Assessment details
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
              Candidate information and assessment setup
            </h2>

            {isLocked ? (
              <div className="mt-5 rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm leading-7 text-[#5f625d]">
                This assessment is locked because it is {typedAssessment.status}.
                You can keep it for history, but it should not be edited further.
              </div>
            ) : null}

            <form
              action="/api/team/hiring/update"
              method="post"
              className="mt-6 space-y-5"
            >
              <input type="hidden" name="assessmentId" value={typedAssessment.id} />
              <input
                type="hidden"
                name="creatorTimezone"
                value={Intl.DateTimeFormat().resolvedOptions().timeZone}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Candidate name
                </label>
                <input
                  type="text"
                  name="candidateName"
                  defaultValue={typedAssessment.candidate_name || ''}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Candidate email
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  required
                  defaultValue={typedAssessment.candidate_email}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Scenario
                </label>
                <select
                  name="scenarioId"
                  required
                  defaultValue={typedAssessment.scenario_id}
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
                  Assessment title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={typedAssessment.title || ''}
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
                  defaultValue={typedAssessment.note || ''}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Expires at
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  defaultValue={toDateTimeLocal(typedAssessment.expires_at)}
                  disabled={isLocked}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none disabled:opacity-60"
                />
                <p className="mt-2 text-xs leading-6 text-[#777a75]">
                  Save expiry in UTC so it works correctly across countries and timezones.
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