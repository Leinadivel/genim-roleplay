import Link from 'next/link'
import { Building2, Download, Search } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

type CompanyRow = {
  id: string
  name: string
  slug: string | null
  team_size: string | number | null
  created_at: string
}

type MemberRow = {
  company_id: string
  user_id: string | null
  email: string | null
  role: string
  status: string
}

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
}

type CompanySubRow = {
  company_id: string
  status: string | null
  seat_limit: number | null
  amount_due: number | null
  currency: string | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function badgeClass(status: string | null) {
  if (status === 'active') return 'bg-[#eef5f0] text-[#1f4d38] border-[#d7e6dc]'
  if (status === 'past_due') return 'bg-red-50 text-red-600 border-red-200'
  return 'bg-[#faf8f5] text-[#666864] border-[#e6ddd2]'
}

export default async function CompanyUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() || ''
  const encodedQ = encodeURIComponent(q)

  const adminClient = createAdminClient()

  let companyQuery = adminClient
    .from('companies')
    .select('id, name, slug, team_size, created_at')
    .order('created_at', { ascending: false })

  if (q) {
    companyQuery = companyQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
  }

  const [{ data: companies }, { data: members }, { data: subs }, { data: profiles }] =
    await Promise.all([
      companyQuery,
      adminClient
        .from('company_members')
        .select('company_id, user_id, email, role, status'),
      adminClient
        .from('company_subscriptions')
        .select('company_id, status, seat_limit, amount_due, currency'),
      adminClient
        .from('profiles')
        .select('id, email, full_name'),
    ])

  const typedCompanies = (companies ?? []) as CompanyRow[]
  const typedMembers = (members ?? []) as MemberRow[]
  const typedSubs = (subs ?? []) as CompanySubRow[]
  const typedProfiles = (profiles ?? []) as ProfileRow[]

  const profileMap = new Map(
    typedProfiles.map((profile) => [profile.id, profile])
  )

  const subMap = new Map(typedSubs.map((sub) => [sub.company_id, sub]))

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#7d7f7a]">
              <Building2 className="h-4 w-4" />
              Companies
            </div>
            <h1 className="mt-1 text-xl font-semibold text-[#171714]">
              Company accounts
            </h1>
            <p className="mt-1 text-sm text-[#666864]">
              Search, export, and manage company accounts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`/api/admin/export/companies${q ? `?q=${encodedQ}` : ''}`}
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
                action="/api/admin/export/companies"
                method="get"
                className="absolute right-0 z-20 mt-3 w-[310px] rounded-2xl border border-[#eee6dc] bg-white p-4 shadow-xl"
              >
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
                    Export filtered companies
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
            placeholder="Search company..."
            className="w-full rounded-full border border-[#ddd4ca] bg-[#faf8f5] py-3 pl-11 pr-4 text-sm outline-none focus:bg-white"
          />
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#eee6dc] bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#faf8f5] text-xs uppercase tracking-[0.12em] text-[#7d7f7a]">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Owner / Manager emails</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f1e9e0]">
            {typedCompanies.length > 0 ? (
              typedCompanies.map((company) => {
                const companyMembers = typedMembers.filter(
                  (member) => member.company_id === company.id
                )

                const decisionMakers = companyMembers
                  .filter((member) =>
                    ['owner', 'admin', 'manager'].includes(member.role)
                  )
                  .map((member) => {
                    const profile = member.user_id ? profileMap.get(member.user_id) : null
                    return member.email || profile?.email || null
                  })
                  .filter(Boolean)
                  .join(', ')

                const activeMembers = companyMembers.filter(
                  (member) => member.status === 'active'
                ).length

                const sub = subMap.get(company.id)

                return (
                  <tr key={company.id} className="hover:bg-[#fffaf5]">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[#1a1a17]">
                        {company.name}
                      </div>
                      <div className="mt-1 text-xs text-[#7d7f7a]">
                        {company.slug || 'No slug'}
                      </div>
                    </td>
                    <td className="max-w-[320px] px-4 py-4 text-[#666864]">
                      {decisionMakers || '—'}
                    </td>
                    <td className="px-4 py-4">{activeMembers}</td>
                    <td className="px-4 py-4">
                      {sub?.seat_limit ?? company.team_size ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                          sub?.status ?? null
                        )}`}
                      >
                        {sub?.status || 'not active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/users/companies/${company.id}`}
                        className="inline-flex rounded-full bg-[#1f4d38] px-4 py-2 text-xs font-semibold text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#666864]">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}