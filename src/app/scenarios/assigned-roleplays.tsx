'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, ChevronRight, ClipboardList, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AssignmentRow = {
  id: string
  scenario_id: string
  buyer_persona_id: string | null
  title: string | null
  note: string | null
  due_at: string | null
  status: string
  created_at: string
  scenario?: {
    id: string
    title: string
    description: string | null
  } | null
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDueDate(value: string | null) {
  if (!value) return 'No due date'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    case 'in_progress':
      return 'border-[#dbe5f6] bg-[#eef4ff] text-[#355c9a]'
    case 'overdue':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    case 'cancelled':
      return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
    default:
      return 'border-[#efe1d5] bg-[#fff8f3] text-[#b35b33]'
  }
}

export default function AssignedRoleplays() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAssignments() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw authError
        }

        if (!user) {
          if (mounted) setAssignments([])
          return
        }

        const { data, error } = await supabase
          .from('team_roleplay_assignments')
          .select(`
            id,
            scenario_id,
            buyer_persona_id,
            title,
            note,
            due_at,
            status,
            created_at,
            scenarios (
              id,
              title,
              description
            )
          `)
          .eq('assigned_to_user_id', user.id)
          .in('status', ['assigned', 'in_progress', 'overdue'])
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        const mapped = (data ?? []).map((item: any) => ({
          id: item.id,
          scenario_id: item.scenario_id,
          buyer_persona_id: item.buyer_persona_id,
          title: item.title,
          note: item.note,
          due_at: item.due_at,
          status: item.status,
          created_at: item.created_at,
          scenario: Array.isArray(item.scenarios)
            ? item.scenarios[0] ?? null
            : item.scenarios ?? null,
        }))

        if (mounted) {
          setAssignments(mapped)
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load assignments'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadAssignments()

    return () => {
      mounted = false
    }
  }, [])

  const hasAssignments = useMemo(() => assignments.length > 0, [assignments])

  function buildStartUrl(assignment: AssignmentRow) {
    const scenarioId = assignment.scenario_id

    return `/session/new?scenarioId=${encodeURIComponent(
      scenarioId
    )}&mode=voice&assignmentId=${encodeURIComponent(assignment.id)}`
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
        <div className="flex items-center gap-3 text-sm text-[#666864]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assigned roleplays...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-300 bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-red-600">
          Assigned roleplays
        </div>
        <div className="mt-2 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!hasAssignments) {
    return null
  }

  return (
    <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#fff6f0] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#d6612d]">
            <ClipboardList className="h-3.5 w-3.5" />
            Assigned roleplays
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
            Training tasks assigned to you
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5f625d]">
            Complete these assigned roleplays from your manager or team owner.
          </p>
        </div>

        <div className="rounded-full border border-[#ece4da] bg-[#faf8f5] px-4 py-2 text-sm font-medium text-[#555854]">
          {assignments.length} open
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-base font-semibold text-[#1a1a17]">
                    {assignment.title || assignment.scenario?.title || 'Assigned roleplay'}
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                      assignment.status
                    )}`}
                  >
                    {formatStatus(assignment.status)}
                  </span>
                </div>

                <div className="mt-2 text-sm text-[#666864]">
                  Scenario: {assignment.scenario?.title || 'Unknown scenario'}
                </div>

                {assignment.scenario?.description ? (
                  <div className="mt-2 text-sm leading-6 text-[#5f625d]">
                    {assignment.scenario.description}
                  </div>
                ) : null}

                {assignment.note ? (
                  <div className="mt-3 rounded-[16px] border border-[#e7ddd3] bg-white px-4 py-3 text-sm leading-7 text-[#5f625d]">
                    {assignment.note}
                  </div>
                ) : null}

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ece4da] bg-white px-3 py-1.5 text-xs font-medium text-[#555854]">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Due: {formatDueDate(assignment.due_at)}
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={buildStartUrl(assignment)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Start assigned roleplay
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}