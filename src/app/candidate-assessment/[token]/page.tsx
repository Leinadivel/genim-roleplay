import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Briefcase, Clock3, ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

type CandidateAssessmentPageProps = {
  params: Promise<{
    token: string
  }>
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

function isExpired(value: string | null) {
  if (!value) return false
  return new Date(value).getTime() < Date.now()
}

export default async function CandidateAssessmentPage({
  params,
}: CandidateAssessmentPageProps) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: assessment, error } = await admin
    .from('candidate_roleplay_assessments')
    .select(`
      id,
      candidate_name,
      candidate_email,
      title,
      note,
      status,
      expires_at,
      scenario_id,
      scenarios (
        id,
        title,
        description,
        difficulty,
        industry
      )
    `)
    .eq('access_token', token)
    .maybeSingle()

  if (error || !assessment) {
    notFound()
  }

  const scenario = Array.isArray(assessment.scenarios)
    ? assessment.scenarios[0] ?? null
    : assessment.scenarios ?? null

  const expired = isExpired(assessment.expires_at)
  const unavailable =
    expired ||
    assessment.status === 'completed' ||
    assessment.status === 'cancelled' ||
    assessment.status === 'expired'

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c] md:px-10">
      <div className="mx-auto max-w-[920px]">
        <div className="rounded-[32px] border border-[#e8ded3] bg-white shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
          <div className="border-b border-[#ece4da] bg-[#f3ece4] px-8 py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
              Candidate assessment
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
              {assessment.title || 'Sales roleplay assessment'}
            </h1>

            <p className="mt-4 max-w-[720px] text-base leading-8 text-[#5b5d59] md:text-lg">
              Complete this realistic sales roleplay to demonstrate how you handle
              buyer conversations, objection pressure, and next-step control.
            </p>
          </div>

          <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Assessment details
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      Candidate
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#1a1a17]">
                      {assessment.candidate_name || 'Candidate'}
                    </div>
                    <div className="mt-1 text-sm text-[#666864]">
                      {assessment.candidate_email}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      Scenario
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#1a1a17]">
                      {scenario?.title || 'Roleplay scenario'}
                    </div>
                    <div className="mt-1 text-sm leading-7 text-[#5f625d]">
                      {scenario?.description || 'A structured roleplay assessment.'}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Difficulty
                      </div>
                      <div className="mt-2 text-sm font-semibold text-[#1a1a17]">
                        {scenario?.difficulty || '—'}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Industry
                      </div>
                      <div className="mt-2 text-sm font-semibold text-[#1a1a17]">
                        {scenario?.industry || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      <Clock3 className="h-4 w-4" />
                      Expires
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#1a1a17]">
                      {formatDateTime(assessment.expires_at)}
                    </div>
                  </div>

                  {assessment.note ? (
                    <div className="rounded-[18px] border border-[#e7ddd3] bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Instructions
                      </div>
                      <div className="mt-2 text-sm leading-7 text-[#5f625d]">
                        {assessment.note}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
                  <ShieldCheck className="h-4 w-4" />
                  Assessment access
                </div>

                {unavailable ? (
                  <div className="mt-6 rounded-[20px] border border-[#f0d7c8] bg-[#fff4ed] px-5 py-5">
                    <div className="text-lg font-semibold text-[#1a1a17]">
                      This assessment is not available
                    </div>
                    <div className="mt-2 text-sm leading-7 text-[#5f625d]">
                      {expired
                        ? 'This candidate assessment link has expired.'
                        : assessment.status === 'completed'
                        ? 'This candidate assessment has already been completed.'
                        : 'This candidate assessment is no longer available.'}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-5 py-5">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-[#d6612d]" />
                        <div className="text-lg font-semibold text-[#1a1a17]">
                          Start your roleplay assessment
                        </div>
                      </div>

                      <div className="mt-3 text-sm leading-7 text-[#5f625d]">
                        When you click start, your session begins immediately and you
                        will be taken into the roleplay environment.
                      </div>
                    </div>

                    <form
                      action="/api/candidate-assessment/start"
                      method="post"
                      className="mt-6"
                    >
                      <input type="hidden" name="token" value={token} />

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95"
                      >
                        Start assessment
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}

                <div className="mt-6 text-xs leading-6 text-[#777a75]">
                  This assessment is linked to a private company hiring workflow.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[#666864]">
          Need help? Contact the hiring team that sent you this link.
        </div>
      </div>
    </main>
  )
}