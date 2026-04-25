'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Sparkles, CalendarClock } from 'lucide-react'

type SessionRow = {
  id: string
  overall_score: number | null
  status: string | null
  selected_roleplay_type: string | null
  selected_industry: string | null
  created_at: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${value}%` : '—'
}

function MotivationCard() {
  return (
    <div className="sticky font-semibold top-6 rounded-[24px] border border-[#f0d7c8] bg-[#1f4d38] p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Sparkles className="h-4 w-4" />
        Keep improving
      </div>

      <p className="mt-3 text-sm leading-7 text-white">
        Top sales reps don’t wait for real calls to improve. They practise,
        review, and refine consistently.
      </p>

      <p className="mt-3 text-sm leading-7 text-white">
        Run another roleplay today and focus on fixing just one weakness from
        your last session.
      </p>

      <Link
        href="/scenarios"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#d6612d] px-4 py-3 text-sm font-semibold text-white"
      >
        Start another roleplay
      </Link>
    </div>
  )
}

export default function SessionsList({
  sessions,
}: {
  sessions: SessionRow[]
}) {
  const [showAll, setShowAll] = useState(false)

  const visibleSessions = showAll ? sessions : sessions.slice(0, 3)

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      {/* LEFT: SESSIONS */}
      <div className="space-y-3">
        {sessions.length > 0 ? (
          <>
            {visibleSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-base font-semibold text-[#1a1a17]">
                      {session.selected_roleplay_type || 'Roleplay session'}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-[#555854]">
                        {session.selected_industry || 'Industry not set'}
                      </span>
                      <span className="rounded-full border border-[#ece4da] bg-white px-3 py-1 text-[#555854]">
                        {formatDate(session.created_at)}
                      </span>
                      <span className="rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-3 py-1 font-semibold text-[#1f4d38]">
                        {formatScore(session.overall_score)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/session/${session.id}/report`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
                  >
                    <FileText className="h-4 w-4" />
                    View report
                  </Link>
                </div>
              </div>
            ))}

            {sessions.length > 3 ? (
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="mt-3 text-sm font-semibold text-[#d6612d] hover:underline"
              >
                {showAll
                  ? 'Show latest 3 sessions'
                  : 'Show all sessions'}
              </button>
            ) : null}
          </>
        ) : (
          <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-5 text-sm text-[#666864]">
            No sessions yet. Start a roleplay to build your dashboard.
          </div>
        )}
      </div>

      {/* RIGHT: MOTIVATION */}
      <div className="hidden lg:block">
        <MotivationCard />
      </div>
    </div>
  )
}