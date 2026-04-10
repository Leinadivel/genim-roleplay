'use client'

import { useState } from 'react'
import { Mail, RefreshCw, Users } from 'lucide-react'

type MemberRow = {
  id: string
  email: string | null
  user_id: string | null
  role: string
  status: string
  created_at: string
}

export default function TeamInvitePanel({
  members,
}: {
  members: MemberRow[]
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('rep')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const trimmedEmail = email.trim()

      if (!trimmedEmail) {
        setError('Enter an email address')
        return
      }

      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, role }),
      })

      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite member')
      }

      setMessage('Invite sent successfully.')
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
        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
          Invite team members
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
          Add people to your workspace
        </h2>
        <p className="mt-3 text-sm leading-8 text-[#5f625d]">
          Invite reps, managers, or admins to join the company workspace.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
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

          <div className="w-full lg:w-[220px]">
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
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f4d38] px-6 py-4 text-sm font-semibold text-white disabled:opacity-50 lg:w-auto"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Sending...' : 'Invite member'}
            </button>
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

        <div className="mt-6 overflow-hidden rounded-[20px] border border-[#ece4da]">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 border-b border-[#ece4da] bg-[#faf8f5] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
          </div>

          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 border-b border-[#f1e9e0] px-4 py-4 text-sm text-[#2b2c2a] last:border-b-0"
              >
                <div>{member.email || '—'}</div>
                <div className="capitalize">{member.role}</div>
                <div className="capitalize">{member.status}</div>
              </div>
            ))
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