import Link from 'next/link'
import { Download, Search, UserCog } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  account_type: string | null
  role: string | null
  status: string | null
  created_at: string
}

type SubscriptionRow = {
  user_id: string
  plan_key: string | null
  status: string | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function badgeClass(status: string | null) {
  if (status === 'inactive') return 'bg-red-50 text-red-600 border-red-200'
  return 'bg-[#eef5f0] text-[#1f4d38] border-[#d7e6dc]'
}

export default async function IndividualUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() || ''
  const encodedQ = encodeURIComponent(q)

  const adminClient = createAdminClient()

  let query = adminClient
    .from('profiles')
    .select('id, email, full_name, account_type, role, status, created_at')
    .or('account_type.is.null,account_type.eq.individual')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
  }

  const [{ data: users }, { data: subscriptions }] = await Promise.all([
    query,
    adminClient.from('subscriptions').select('user_id, plan_key, status'),
  ])

  const subMap = new Map(
    ((subscriptions ?? []) as SubscriptionRow[]).map((sub) => [sub.user_id, sub])
  )

  const rows = (users ?? []) as ProfileRow[]

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#7d7f7a]">
              <UserCog className="h-4 w-4" />
              Users
            </div>
            <h1 className="mt-1 text-xl font-semibold text-[#171714]">
              Individual users
            </h1>
            <p className="mt-1 text-sm text-[#666864]">
              Search, export, and manage individual Genim users.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`/api/admin/export/users?accountType=individual${q ? `&q=${encodedQ}` : ''}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f4d38] px-5 py-3 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" />
              Download all
            </a>

            <details className="relative">
              <summary className="inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-[#faf8f5] px-5 py-3 text-sm font-semibold text-[#1f1f1c]">
                <Download className="h-4 w-4" />
                Download by date
              </summary>

              <form
                action="/api/admin/export/users"
                method="get"
                className="absolute right-0 z-20 mt-3 w-[310px] rounded-2xl border border-[#eee6dc] bg-white p-4 shadow-xl"
              >
                <input type="hidden" name="accountType" value="individual" />
                {q ? <input type="hidden" name="q" value={q} /> : null}

                <div className="grid gap-3">
                  <input
                    type="date"
                    name="from"
                    className="rounded-xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm"
                  />
                  <input
                    type="date"
                    name="to"
                    className="rounded-xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm"
                  />
                  <button className="rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white">
                    Export filtered users
                  </button>
                </div>
              </form>
            </details>
          </div>
        </div>

        <form className="relative mt-5 w-full md:max-w-[420px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8d87]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email..."
            className="w-full rounded-full border border-[#ddd4ca] bg-[#faf8f5] py-3 pl-11 pr-4 text-sm outline-none focus:bg-white"
          />
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#eee6dc] bg-white shadow-sm">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[#faf8f5] text-xs uppercase tracking-[0.12em] text-[#7d7f7a]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Plan status</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f1e9e0]">
            {rows.length > 0 ? (
              rows.map((user) => {
                const sub = subMap.get(user.id)

                return (
                  <tr key={user.id} className="hover:bg-[#fffaf5]">
                    <td className="px-4 py-4 font-semibold text-[#1a1a17]">
                      {user.full_name || 'Unnamed user'}
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {user.email || '—'}
                    </td>
                    <td className="px-4 py-4 capitalize">{user.role || 'rep'}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-[#e6ddd2] bg-[#faf8f5] px-3 py-1 text-xs font-semibold">
                        {sub?.plan_key || 'starter'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {sub?.status || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                          user.status
                        )}`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/users/individuals/${user.id}`}
                        className="inline-flex rounded-full bg-[#1f4d38] px-4 py-2 text-xs font-semibold text-white"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#666864]">
                  No individual users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}