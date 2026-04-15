'use client'

import { useMemo, useState } from 'react'
import {
  Mail,
  RefreshCw,
  Shield,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react'

type MemberRow = {
  id: string
  email: string | null
  user_id: string | null
  role: string
  status: string
  created_at: string
}

function formatRole(role: string) {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatStatus(status: string) {
  if (!status) return '—'
  if (status === 'invited') return 'Invited'
  if (status === 'pending') return 'Pending'
  if (status === 'active') return 'Active'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function isInviteLikeStatus(status: string) {
  return status === 'pending' || status === 'invited'
}

function getRoleBadgeClasses(role: string) {
  switch (role) {
    case 'admin':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    case 'manager':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    default:
      return 'border-[#e4dde5] bg-[#f7f2fa] text-[#6d4d8f]'
  }
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'active':
      return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
    case 'pending':
    case 'invited':
      return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
    default:
      return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
  }
}

export default function TeamInvitePanel({
  members,
  canInvite,
}: {
  members: MemberRow[]
  canInvite: boolean
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('rep')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const memberStats = useMemo(() => {
    const total = members.length
    const active = members.filter((member) => member.status === 'active').length
    const pending = members.filter((member) =>
      isInviteLikeStatus(member.status)
    ).length
    const admins = members.filter((member) => member.role === 'admin').length
    const managers = members.filter((member) => member.role === 'manager').length
    const reps = members.filter((member) => member.role === 'rep').length

    return {
      total,
      active,
      pending,
      admins,
      managers,
      reps,
    }
  }, [members])

  async function handleInvite() {
    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const trimmedEmail = email.trim().toLowerCase()

      if (!trimmedEmail) {
        setError('Enter an email address')
        return
      }

      const emailAlreadyExists = members.some(
        (member) => member.email?.toLowerCase() === trimmedEmail
      )

      if (emailAlreadyExists) {
        setError('This email is already in the workspace or already invited.')
        return
      }

      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, role }),
      })

      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        message?: string
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite member')
      }

      setMessage(data.message || 'Invite sent successfully.')
      setEmail('')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[720px]">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Invite team members
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
              Add people to your workspace
            </h2>
            <p className="mt-3 text-sm leading-8 text-[#5f625d]">
              Invite reps, managers, or admins to join the company workspace.
              This flow should stay clean because it becomes the foundation for
              seat-based billing later.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Active
              </div>
              <div className="mt-2 text-xl font-semibold text-[#1b1b18]">
                {memberStats.active}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Pending
              </div>
              <div className="mt-2 text-xl font-semibold text-[#1b1b18]">
                {memberStats.pending}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#343631]">
              Team member email
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4">
              <Mail className="h-5 w-5 text-[#8a8b86]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rep@company.com"
                className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#343631]">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-[15px] text-[#1f1f1c] outline-none"
            >
              <option value="rep">Rep</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleInvite}
              disabled={loading || !canInvite}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f4d38] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50 lg:w-auto"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Sending...' : 'Invite member'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1a17]">
              <Users className="h-4 w-4 text-[#d6612d]" />
              Reps
            </div>
            <div className="mt-2 text-sm text-[#666864]">
              Frontline users running roleplays daily.
            </div>
            <div className="mt-3 text-lg font-semibold text-[#1b1b18]">
              {memberStats.reps}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1a17]">
              <UserCog className="h-4 w-4 text-[#1f4d38]" />
              Managers
            </div>
            <div className="mt-2 text-sm text-[#666864]">
              Team leads coordinating adoption and performance.
            </div>
            <div className="mt-3 text-lg font-semibold text-[#1b1b18]">
              {memberStats.managers}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1a17]">
              <Shield className="h-4 w-4 text-[#d6612d]" />
              Admins
            </div>
            <div className="mt-2 text-sm text-[#666864]">
              Workspace owners and billing-level decision makers.
            </div>
            <div className="mt-3 text-lg font-semibold text-[#1b1b18]">
              {memberStats.admins}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Members & invites
              </div>
              <div className="mt-1 text-sm text-[#666864]">
                Current workspace users and pending invitations
              </div>
            </div>
          </div>

          <div className="inline-flex rounded-full border border-[#ece4da] bg-[#faf8f5] px-4 py-2 text-sm font-medium text-[#555854]">
            Total records: {memberStats.total}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[20px] border border-[#ece4da]">
          <div className="hidden grid-cols-[1.6fr_0.9fr_0.9fr] gap-4 border-b border-[#ece4da] bg-[#faf8f5] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a] md:grid">
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
          </div>

          {members.length > 0 ? (
            <>
              <div className="hidden md:block">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1.6fr_0.9fr_0.9fr] gap-4 border-b border-[#f1e9e0] px-4 py-4 text-sm text-[#2b2c2a] last:border-b-0"
                  >
                    <div className="min-w-0 truncate">{member.email || '—'}</div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClasses(
                          member.role
                        )}`}
                      >
                        {formatRole(member.role)}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                          member.status
                        )}`}
                      >
                        {formatStatus(member.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#1b1b18]">
                          {member.email || '—'}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClasses(
                              member.role
                            )}`}
                          >
                            {formatRole(member.role)}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                              member.status
                            )}`}
                          >
                            {formatStatus(member.status)}
                          </span>
                        </div>
                      </div>

                      {member.status === 'active' ? (
                        <UserCheck className="h-5 w-5 shrink-0 text-[#1f4d38]" />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-sm text-[#666864]">
              No members or invites yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}