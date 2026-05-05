import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FileText,
  Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type PageProps = {
  params: Promise<{ id: string }>
}

type AssessmentRow = {
  id: string
  company_id: string
  candidate_name: string | null
  candidate_email: string
  title: string | null
  note: string | null
  status: string
  completed_session_id: string | null
  selected_industry: string | null
  selected_roleplay_type: string | null
  selected_buyer_mood: string | null
  selected_buyer_role: string | null
  selected_deal_size: string | null
  selected_pain_level: string | null
  selected_company_stage: string | null
  selected_time_pressure: string | null
  scenario_id: string
  created_at: string
}

type SessionRow = {
  id: string
  overall_score: number | null
  strengths: string[] | null
  improvements: string[] | null
  summary: string | null
  status: string
}

type MessageRow = {
  id: string
  speaker: string
  message_text: string
  created_at: string
}

function canManageHiring(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

function formatValue(value: string | null) {
  if (!value) return '—'
  return value.replace(/_/g, ' ')
}

function getScoreLabel(score: number | null) {
  if (score === null) return 'Not scored'
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Average'
  return 'Needs review'
}

function getScoreClass(score: number | null) {
  if (score === null) return 'bg-[#faf8f5] text-[#666864] border-[#e6ddd2]'
  if (score >= 70) return 'bg-[#eef5f0] text-[#1f4d38] border-[#d7e6dc]'
  if (score >= 50) return 'bg-[#fff8e8] text-[#946200] border-[#f1d58a]'
  return 'bg-red-50 text-red-600 border-red-200'
}

export default async function CandidateHiringReportPage({ params }: PageProps) {
  const { id } = await params

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

  if (!membership || !canManageHiring(membership.role)) {
    redirect('/team')
  }

  const admin = createAdminClient()

  const { data: assessmentRaw, error: assessmentError } = await admin
    .from('candidate_roleplay_assessments')
    .select(
      `
      id,
      company_id,
      candidate_name,
      candidate_email,
      title,
      note,
      status,
      completed_session_id,
      selected_industry,
      selected_roleplay_type,
      selected_buyer_mood,
      selected_buyer_role,
      selected_deal_size,
      selected_pain_level,
      selected_company_stage,
      selected_time_pressure,
      scenario_id,
      created_at
    `
    )
    .eq('id', id)
    .eq('company_id', membership.company_id)
    .maybeSingle()

  if (assessmentError || !assessmentRaw) {
    redirect('/team/hiring')
  }

  const assessment = assessmentRaw as AssessmentRow

  if (!assessment.completed_session_id) {
    redirect('/team/hiring')
  }

  const [{ data: sessionRaw }, { data: messagesRaw }, { data: scenario }] =
    await Promise.all([
      admin
        .from('roleplay_sessions')
        .select('id, overall_score, strengths, improvements, summary, status')
        .eq('id', assessment.completed_session_id)
        .maybeSingle(),

      admin
        .from('session_messages')
        .select('id, speaker, message_text, created_at')
        .eq('session_id', assessment.completed_session_id)
        .order('created_at', { ascending: true }),

      admin
        .from('scenarios')
        .select('id, title, description')
        .eq('id', assessment.scenario_id)
        .maybeSingle(),
    ])

  const session = sessionRaw as SessionRow | null
  const messages = (messagesRaw ?? []) as MessageRow[]

  const score = session?.overall_score ?? null
  const strengths = session?.strengths ?? []
  const improvements = session?.improvements ?? []

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <section className="mx-auto max-w-[1180px] px-6 py-8">
        <Link
          href="/team/hiring"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to hiring
        </Link>

        <div className="mt-6 rounded-[30px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <FileText className="h-4 w-4" />
                Candidate report
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#171714] md:text-4xl">
                {assessment.candidate_name || assessment.candidate_email}
              </h1>

              <p className="mt-2 text-sm text-[#666864]">
                {assessment.candidate_email}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f625d]">
                {assessment.title || scenario?.title || 'Sales roleplay assessment'}
              </p>
            </div>

            <div
              className={`rounded-[24px] border px-6 py-5 text-center ${getScoreClass(
                score
              )}`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.12em]">
                Overall score
              </div>
              <div className="mt-2 text-5xl font-semibold tracking-[-0.05em]">
                {score !== null ? `${Math.round(score)}%` : '—'}
              </div>
              <div className="mt-2 text-sm font-semibold">
                {getScoreLabel(score)}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ['Industry', assessment.selected_industry],
              ['Roleplay type', assessment.selected_roleplay_type],
              ['Buyer role', assessment.selected_buyer_role],
              ['Buyer mood', assessment.selected_buyer_mood],
              ['Deal size', assessment.selected_deal_size],
              ['Pain level', assessment.selected_pain_level],
              ['Company stage', assessment.selected_company_stage],
              ['Time pressure', assessment.selected_time_pressure],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  {label}
                </div>
                <div className="mt-2 text-sm font-semibold capitalize text-[#1a1a17]">
                  {formatValue(value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[26px] border border-[#e8ded3] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              <CheckCircle2 className="h-4 w-4 text-[#1f4d38]" />
              Strengths
            </div>

            <div className="mt-5 space-y-3">
              {strengths.length > 0 ? (
                strengths.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-[18px] border border-[#d7e6dc] bg-[#eef5f0] px-4 py-4 text-sm leading-7 text-[#2f4339]"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                  No strengths recorded.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e8ded3] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              <Target className="h-4 w-4 text-[#d6612d]" />
              Improvement areas
            </div>

            <div className="mt-5 space-y-3">
              {improvements.length > 0 ? (
                improvements.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-[18px] border border-[#f0dfd7] bg-[#fff7f3] px-4 py-4 text-sm leading-7 text-[#5a473d]"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                  No improvements recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[26px] border border-[#e8ded3] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            <BarChart3 className="h-4 w-4 text-[#1f4d38]" />
            Coach feedback
          </div>

          <div className="mt-5 rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-5 py-5 text-sm leading-8 text-[#494b47]">
            {session?.summary || 'No feedback summary available yet.'}
          </div>
        </div>

        <div className="mt-6 rounded-[26px] border border-[#e8ded3] bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            Transcript
          </div>

          <div className="mt-5 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.speaker === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-[18px] px-4 py-3 text-sm leading-7 shadow-sm ${
                      message.speaker === 'user'
                        ? 'bg-[#d6612d] text-white'
                        : 'border border-[#ece4da] bg-[#faf8f5] text-[#232320]'
                    }`}
                  >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
                      {message.speaker === 'user' ? 'Candidate' : 'Buyer'}
                    </div>
                    {message.message_text}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#666864]">
                No transcript available.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}