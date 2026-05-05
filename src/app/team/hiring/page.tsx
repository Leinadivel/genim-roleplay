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
      <div className="mx-auto max-w-[1180px] space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
            Hiring assessments
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
            Candidate roleplay assessments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666864]">
            Create secure assessment links, track candidate progress, and review completed reports.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total" value={assessments.length} icon={Briefcase} tone="orange" />
          <StatCard label="Invited" value={invitedCount} icon={Users} tone="orange" />
          <StatCard label="Started" value={startedCount} icon={Sparkles} tone="blue" />
          <StatCard label="Completed" value={completedCount} icon={ClipboardCheck} tone="green" />
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
                Create assessment
              </div>
              <h2 className="mt-1 text-lg font-semibold text-[#171714]">
                Generate candidate link
              </h2>
            </div>

            <div className="rounded-full bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#666864]">
              Candidate starts with link only
            </div>
          </div>

          <form action="/api/team/hiring/create" method="post" className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <InputField
                name="candidateName"
                label="Candidate name"
                placeholder="Example: Jane Doe"
              />

              <InputField
                name="candidateEmail"
                label="Candidate email"
                type="email"
                required
                placeholder="candidate@example.com"
              />

              <SelectField name="scenarioId" label="Scenario" required>
                <option value="">Select scenario</option>
                {scenarioList.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title} {scenario.industry ? `• ${scenario.industry}` : ''} • {formatStatus(scenario.difficulty)}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
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

              <SelectField name="selectedBuyerRole" label="Buyer role" required>
                <option value="">Select buyer role</option>
                {BUYER_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </SelectField>
            </div>

            <details className="rounded-[22px] bg-[#faf8f5] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#171714]">
                Advanced assessment settings
              </summary>

              <div className="mt-4 grid gap-4 lg:grid-cols-4">
                <SelectField name="selectedBuyerMood" label="Buyer mood" required>
                  <option value="">Select mood</option>
                  {BUYER_MOOD_OPTIONS.map((mood) => (
                    <option key={mood.value} value={mood.value}>{mood.label}</option>
                  ))}
                </SelectField>

                <SelectField name="selectedPainLevel" label="Pain level" required>
                  <option value="">Select pain level</option>
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
                label="Assessment title"
                placeholder="Example: SDR first-round assessment"
              />

              <InputField
                name="expiresAt"
                label="Expires at"
                type="datetime-local"
              />

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
                placeholder="Add any focus points or instructions for the candidate."
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
                Candidate queue
              </div>
              <h2 className="mt-1 text-lg font-semibold text-[#171714]">
                Current assessments
              </h2>
            </div>

            <span className="rounded-full bg-[#faf8f5] px-4 py-2 text-xs font-semibold text-[#666864]">
              {assessments.length} total
            </span>
          </div>

          <div className="overflow-hidden rounded-[22px] bg-[#faf8f5]">
            {assessments.length > 0 ? (
              <div className="divide-y divide-[#ece4da]">
                {assessments.map((assessment) => {
                  const scenario = scenarioMap.get(assessment.scenario_id)
                  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/candidate-assessment/${assessment.access_token}`
                  const completedSession = assessment.completed_session_id
                    ? sessionMap.get(assessment.completed_session_id)
                    : null

                  return (
                    <div
                      key={assessment.id}
                      className="bg-[#faf8f5] px-4 py-4 transition hover:bg-white"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.8fr_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[#171714]">
                            {assessment.candidate_name || assessment.candidate_email}
                          </div>
                          <div className="mt-1 truncate text-xs text-[#777a75]">
                            {assessment.candidate_email}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                            Scenario
                          </div>
                          <div className="mt-1 truncate text-sm text-[#555854]">
                            {scenario?.title || 'Unknown scenario'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                            Score
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#1f4d38]">
                            {completedSession
                              ? formatScore(completedSession.overall_score)
                              : '—'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:justify-end">
                          <Badge className={getStatusBadge(assessment.status)}>
                            {formatStatus(assessment.status)}
                          </Badge>

                          <RowActionMenu
                            items={[
                              {
                                type: 'link',
                                label: 'Open link',
                                href: `/candidate-assessment/${assessment.access_token}`,
                                icon: 'report',
                              },
                              {
                                type: 'link',
                                label: 'Edit',
                                href: `/team/hiring/${assessment.id}/edit`,
                                icon: 'edit',
                              },
                              ...(assessment.completed_session_id
                                ? [
                                    {
                                      type: 'link' as const,
                                      label: 'View report',
                                      href: `/team/hiring/${assessment.id}/report`,
                                      icon: 'report' as const,
                                    },
                                  ]
                                : []),
                              ...(canArchiveAssessment(assessment)
                                ? [
                                    {
                                      type: 'form' as const,
                                      label: 'Archive',
                                      action: '/api/team/hiring/archive',
                                      valueName: 'assessmentId',
                                      value: assessment.id,
                                      icon: 'archive' as const,
                                    },
                                  ]
                                : []),
                              ...(canDeleteAssessment(assessment)
                                ? [
                                    {
                                      type: 'form' as const,
                                      label: 'Delete',
                                      action: '/api/team/hiring/delete',
                                      valueName: 'assessmentId',
                                      value: assessment.id,
                                      icon: 'delete' as const,
                                      danger: true,
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge>Expires: {formatDateTime(assessment.expires_at)}</Badge>

                        {assessment.title ? <Badge>{assessment.title}</Badge> : null}

                        <CopyLinkButton value={publicUrl} />

                        {assessment.completed_session_id ? (
                          <Link
                            href={`/team/hiring/${assessment.id}/report`}
                            className="inline-flex rounded-full bg-[#1f4d38] px-3 py-1 text-[11px] font-semibold text-white"
                          >
                            View full report
                          </Link>
                        ) : null}
                      </div>

                      {completedSession?.summary ? (
                        <div className="mt-3 rounded-[16px] bg-white/80 px-4 py-3 text-xs leading-6 text-[#5f625d]">
                          {completedSession.summary}
                        </div>
                      ) : assessment.note ? (
                        <div className="mt-3 rounded-[16px] bg-white/80 px-4 py-3 text-xs leading-6 text-[#5f625d]">
                          {assessment.note}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-[#666864]">
                No candidate assessments yet.
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

  function SelectField({
    label,
    name,
    required,
    children,
  }: {
    label: string
    name: string
    required?: boolean
    children: React.ReactNode
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
    required,
  }: {
    label: string
    name: string
    type?: string
    placeholder?: string
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
    children: React.ReactNode
    className?: string
  }) {
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${className}`}>
        {children}
      </span>
    )
  }