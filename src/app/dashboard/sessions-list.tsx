'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'

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

export default function SessionsList({
  sessions,
}: {
  sessions: SessionRow[]
}) {
  const [showAll, setShowAll] = useState(false)

  const visibleSessions = showAll ? sessions : sessions.slice(0, 3)

  return (
    <div className="mt-6 space-y-3">
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
              {showAll ? 'Show latest 3 sessions' : 'Show all sessions'}
            </button>
          ) : null}
        </>
      ) : (
        <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-5 text-sm text-[#666864]">
          No sessions yet. Start a roleplay to build your dashboard.
        </div>
      )}
    </div>
  )
}