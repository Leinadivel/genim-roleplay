import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileEdit,
  LogOut,
  PlusCircle,
  Shield,
  Sparkles,
  Trash2,
  Users,
  Archive,
  Clock3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import CopyLinkButton from './copy-link-button'

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
  candidate_name: string | null
  candidate_email: string
  title: string | null
  note: string | null
  access_token: string
  status: string
  expires_at: string | null
  completed_session_id: string | null
  created_at: string
  scenario_id: string
}

type SessionRow = {
  id: string
  overall_score: number | null
  status: string
  created_at: string
  summary: string | null
  selected_roleplay_type: string | null
  selected_industry: string | null
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

function formatDateTime(value: string | null) {
  if (!value) return 'No expiry'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${Math.round(value)}%` : '—'
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    case 'started':
      return 'border-[#dbe5f6] bg-[#eef4ff] text-[#355c9a]'
    case 'expired':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    case 'cancelled':
    case 'archived':
      return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
    default:
      return 'border-[#efe1d5] bg-[#fff8f3] text-[#b35b33]'
  }
}

function canDeleteAssessment(assessment: AssessmentRow) {
  return !assessment.completed_session_id && assessment.status === 'invited'
}

function canArchiveAssessment(assessment: AssessmentRow) {
  return assessment.status !== 'archived' && assessment.status !== 'cancelled'
}

export default async function TeamHiringPage() {
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
    { data: scenarios, error: scenariosError },
    { data: rawAssessments, error: assessmentsError },
  ] = await Promise.all([
    supabase
      .from('scenarios')
      .select('id, title, description, difficulty, industry, active')
      .eq('active', true)
      .order('title', { ascending: true }),
    supabase
      .from('candidate_roleplay_assessments')
      .select(
        'id, candidate_name, candidate_email, title, note, access_token, status, expires_at, completed_session_id, created_at, scenario_id'
      )
      .eq('company_id', company.id)
      .order('created_at', { ascending: false }),
  ])

  if (scenariosError) {
    throw new Error(`Failed to load scenarios: ${scenariosError.message}`)
  }

  if (assessmentsError) {
    throw new Error(
      `Failed to load candidate assessments: ${assessmentsError.message}`
    )
  }

  const scenarioList = (scenarios ?? []) as ScenarioRow[]
  const assessments = (rawAssessments ?? []) as AssessmentRow[]
  const scenarioMap = new Map(scenarioList.map((scenario) => [scenario.id, scenario]))

  const completedSessionIds = assessments
    .map((item) => item.completed_session_id)
    .filter((value): value is string => Boolean(value))

  let sessionMap = new Map<string, SessionRow>()

  if (completedSessionIds.length > 0) {
    const { data: sessionRows, error: sessionsError } = await supabase
      .from('roleplay_sessions')
      .select(
        'id, overall_score, status, created_at, summary, selected_roleplay_type, selected_industry'
      )
      .in('id', completedSessionIds)

    if (sessionsError) {
      throw new Error(`Failed to load candidate reports: ${sessionsError.message}`)
    }

    sessionMap = new Map(
      ((sessionRows ?? []) as SessionRow[]).map((session) => [session.id, session])
    )
  }

  const invitedCount = assessments.filter((item) => item.status === 'invited').length
  const startedCount = assessments.filter((item) => item.status === 'started').length
  const completedCount = assessments.filter((item) => item.status === 'completed').length

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
                Hiring assessments
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
                Evaluate sales candidates with roleplay
              </h1>

              <p className="mt-4 max-w-[760px] text-base leading-8 text-[#5b5d59] md:text-lg">
                Create candidate assessment links, send them out, and review how
                each person performs in a realistic sales conversation.
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
                Owners, admins, and managers can create and manage candidate assessments.
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
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Total assessments
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {assessments.length}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                All hiring roleplay assessments
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4ed] text-[#d6612d]">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Invited
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {invitedCount}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Links created and sent out
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#355c9a]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Started
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {startedCount}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Candidates currently in progress
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Completed
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                {completedCount}
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Finished candidate assessments
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Create assessment
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
                Generate candidate roleplay link
              </h2>
              <p className="mt-3 text-sm leading-8 text-[#5f625d]">
                Set the candidate, choose a scenario, optionally add notes and
                an expiry time, then generate a secure assessment link.
              </p>

              <div className="mt-4 rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm leading-7 text-[#5f625d]">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-4 w-4 shrink-0 text-[#1f4d38]" />
                  <div>
                    Candidates see expiry date and time in their own local time automatically if not same country.
                  </div>
                </div>
              </div>

              <form action="/api/team/hiring/create" method="post" className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Candidate name
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    placeholder="Example: Jane Doe"
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
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
                    placeholder="candidate@example.com"
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                  />
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
                    Assessment title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Example: SDR first-round assessment"
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
                    placeholder="Add any focus points or instructions for the candidate."
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Expires at
                  </label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[#777a75]">
                    Expiry works across countries timezones.
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
                  Create candidate assessment
                </button>
              </form>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-white shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
              <div className="border-b border-[#ece4da] px-6 py-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Candidate list
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                  Current hiring assessments
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                  Track every candidate assessment, copy the invite link, edit details,
                  archive unused items, and open completed reports.
                </p>
              </div>

              <div className="space-y-3 p-4">
                {assessments.length > 0 ? (
                  assessments.map((assessment) => {
                    const scenario = scenarioMap.get(assessment.scenario_id)
                    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/candidate-assessment/${assessment.access_token}`
                    const completedSession = assessment.completed_session_id
                      ? sessionMap.get(assessment.completed_session_id)
                      : null

                    return (
                      <div
                        key={assessment.id}
                        className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-[#1a1a17]">
                                {assessment.candidate_name || assessment.candidate_email}
                              </div>

                              <div className="mt-1 text-sm text-[#666864]">
                                {assessment.candidate_email}
                              </div>

                              {assessment.title ? (
                                <div className="mt-2 text-sm font-medium text-[#3c3f3a]">
                                  {assessment.title}
                                </div>
                              ) : null}

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                                    assessment.status
                                  )}`}
                                >
                                  {formatStatus(assessment.status)}
                                </span>

                                <span className="inline-flex rounded-full border border-[#ece4da] bg-white px-3 py-1 text-xs font-medium text-[#555854]">
                                  Expires: {formatDateTime(assessment.expires_at)}
                                </span>
                              </div>

                              <div className="mt-3 text-sm text-[#555854]">
                                Scenario: {scenario?.title || 'Unknown scenario'}
                              </div>

                              {assessment.note ? (
                                <div className="mt-3 rounded-[16px] border border-[#e7ddd3] bg-white px-4 py-3 text-sm leading-7 text-[#5f625d]">
                                  {assessment.note}
                                </div>
                              ) : null}
                            </div>

                            <div className="shrink-0 space-y-2">
                              <CopyLinkButton value={publicUrl} />

                              <Link
                                href={`/candidate-assessment/${assessment.access_token}`}
                                target="_blank"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] hover:bg-[#fff]"
                              >
                                Open link
                                <ExternalLink className="h-4 w-4" />
                              </Link>

                              <Link
                                href={`/team/hiring/${assessment.id}/edit`}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] hover:bg-[#fff]"
                              >
                                <FileEdit className="h-4 w-4" />
                                Edit
                              </Link>

                              {canArchiveAssessment(assessment) ? (
                                <form action="/api/team/hiring/archive" method="post">
                                  <input type="hidden" name="assessmentId" value={assessment.id} />
                                  <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] hover:bg-[#fff]"
                                  >
                                    <Archive className="h-4 w-4" />
                                    Archive
                                  </button>
                                </form>
                              ) : null}

                              {canDeleteAssessment(assessment) ? (
                                <form action="/api/team/hiring/delete" method="post">
                                  <input type="hidden" name="assessmentId" value={assessment.id} />
                                  <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </form>
                              ) : null}

                              {assessment.completed_session_id ? (
                                <Link
                                  href={`/session/${assessment.completed_session_id}/report`}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] hover:bg-[#fff]"
                                >
                                  View report
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              ) : null}
                            </div>
                          </div>

                          {completedSession ? (
                            <div className="rounded-[18px] border border-[#e7ddd3] bg-white px-4 py-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                                    Candidate report
                                  </div>
                                  <div className="mt-2 text-lg font-semibold text-[#1a1a17]">
                                    Score: {formatScore(completedSession.overall_score)}
                                  </div>
                                  <div className="mt-1 text-sm text-[#666864]">
                                    Completed: {formatDateTime(completedSession.created_at)}
                                  </div>
                                  <div className="mt-1 text-sm text-[#666864]">
                                    {completedSession.selected_roleplay_type || 'Roleplay'}{' '}
                                    {completedSession.selected_industry
                                      ? `• ${completedSession.selected_industry}`
                                      : ''}
                                  </div>
                                </div>

                                <div className="md:max-w-[360px] text-sm leading-7 text-[#5f625d]">
                                  {completedSession.summary || 'Report available for review.'}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                    No candidate assessments yet.
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