import Link from 'next/link'
import { Building2, Download, PlusCircle, Search } from 'lucide-react'
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

type RoleplaySessionRow = {
  user_id: string
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

  const [
    { data: companies },
    { data: members },
    { data: subs },
    { data: profiles },
    { data: roleplaySessions },
  ] = await Promise.all([
    companyQuery,
    adminClient
      .from('company_members')
      .select('company_id, user_id, email, role, status'),
    adminClient
      .from('company_subscriptions')
      .select('company_id, status, seat_limit, amount_due, currency'),
    adminClient.from('profiles').select('id, email, full_name'),
    adminClient.from('roleplay_sessions').select('user_id'),
  ])

  const typedCompanies = (companies ?? []) as CompanyRow[]
  const typedMembers = (members ?? []) as MemberRow[]
  const typedSubs = (subs ?? []) as CompanySubRow[]
  const typedProfiles = (profiles ?? []) as ProfileRow[]

  const profileMap = new Map(typedProfiles.map((profile) => [profile.id, profile]))
  const subMap = new Map(typedSubs.map((sub) => [sub.company_id, sub]))

  const userCompanyMap = new Map<string, string>()

  for (const member of typedMembers) {
    if (member.user_id && member.company_id) {
      userCompanyMap.set(member.user_id, member.company_id)
    }
  }

  const companyRoleplayCountMap = new Map<string, number>()

  for (const session of (roleplaySessions ?? []) as RoleplaySessionRow[]) {
    const companyId = userCompanyMap.get(session.user_id)

    if (!companyId) continue

    companyRoleplayCountMap.set(
      companyId,
      (companyRoleplayCountMap.get(companyId) ?? 0) + 1
    )
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(25,25,20,0.055)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              <Building2 className="h-4 w-4" />
              Companies
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
              Company accounts
            </h1>

            <p className="mt-1 text-sm leading-6 text-[#666864]">
              Search, export, create, and manage company workspaces.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
            <form className="relative w-full lg:w-[260px]">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a8d87]" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search company..."
                className="h-10 w-full rounded-full bg-[#faf8f5] pl-9 pr-3 text-xs text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] placeholder:text-[#9a9c97] focus:bg-white focus:ring-[#d6612d]"
              />
            </form>

            <details className="relative">
              <summary className="inline-flex h-10 w-full cursor-pointer list-none items-center justify-center gap-2 rounded-full bg-[#1f4d38] px-4 text-xs font-semibold text-white shadow-sm lg:w-auto">
                <Download className="h-3.5 w-3.5" />
                Download
              </summary>

              <div className="absolute right-0 z-20 mt-3 w-[300px] rounded-[20px] bg-white p-3 shadow-[0_18px_55px_rgba(25,25,20,0.14)] ring-1 ring-[#eee6dc]">
                <a
                  href={`/api/admin/export/companies${q ? `?q=${encodedQ}` : ''}`}
                  className="flex items-center justify-between rounded-[14px] bg-[#faf8f5] px-3 py-2.5 text-xs font-semibold text-[#1f1f1c] hover:bg-[#fff4ed]"
                >
                  Download all companies
                  <Download className="h-3.5 w-3.5 text-[#1f4d38]" />
                </a>

                <form
                  action="/api/admin/export/companies"
                  method="get"
                  className="mt-2 rounded-[14px] bg-[#faf8f5] p-3"
                >
                  {q ? <input type="hidden" name="q" value={q} /> : null}

                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                    Download by date
                  </div>

                  <div className="mt-2 grid gap-2">
                    <input
                      type="date"
                      name="from"
                      className="h-9 rounded-xl bg-white px-3 text-xs outline-none ring-1 ring-[#eee6dc]"
                    />

                    <input
                      type="date"
                      name="to"
                      className="h-9 rounded-xl bg-white px-3 text-xs outline-none ring-1 ring-[#eee6dc]"
                    />

                    <button className="h-9 rounded-full bg-[#d6612d] px-4 text-xs font-semibold text-white">
                      Export filtered
                    </button>
                  </div>
                </form>
              </div>
            </details>

            <Link
              href="/admin/users/companies/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#d6612d] px-4 text-xs font-semibold text-white shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Create company
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[24px] bg-white shadow-[0_8px_30px_rgba(25,25,20,0.055)]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#faf8f5] text-xs uppercase tracking-[0.12em] text-[#7d7f7a]">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Owner / Manager emails</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Roleplays</th>
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
                    const profile = member.user_id
                      ? profileMap.get(member.user_id)
                      : null
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
                      <span className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#1f4d38]">
                        {companyRoleplayCountMap.get(company.id) ?? 0}
                      </span>
                    </td>

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
                <td colSpan={8} className="px-4 py-8 text-center text-[#666864]">
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