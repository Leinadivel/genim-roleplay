import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Crown,
  LogOut,
  Plus,
  Shield,
  UserCog,
  Users,
  Download,
} from 'lucide-react'
import { getGenimAdmin } from '@/lib/genim-admin'
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

type CompanyRow = {
  id: string
  name: string
  slug: string | null
  team_size: string | number | null
  created_at: string
}

type SubscriptionRow = {
  user_id: string
  plan_key: string | null
  status: string | null
  current_period_end: string | null
}

type MemberRow = {
  user_id: string | null
  company_id: string
  role: string
  status: string
}

function formatDate(value: string | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function badgeClass(value: string | null) {
  if (value === 'active') return 'border-[#d7e6dc] bg-[#eef5f0] text-[#1f4d38]'
  if (value === 'inactive') return 'border-red-200 bg-red-50 text-red-700'
  if (value === 'owner') return 'border-[#f0d7c8] bg-[#fff4ed] text-[#a2542f]'
  return 'border-[#e6ddd2] bg-[#faf8f5] text-[#666864]'
}

export default async function AdminUsersPage() {
  const { user, admin } = await getGenimAdmin()

  if (!user) redirect('/login')
  if (!admin) redirect('/scenarios')

  const adminClient = createAdminClient()

  const [
    { data: profiles },
    { data: companies },
    { data: subscriptions },
    { data: memberships },
  ] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, email, full_name, account_type, role, status, created_at')
      .order('created_at', { ascending: false }),
    adminClient
      .from('companies')
      .select('id, name, slug, team_size, created_at')
      .order('created_at', { ascending: false }),
    adminClient
      .from('subscriptions')
      .select('user_id, plan_key, status, current_period_end'),
    adminClient
      .from('company_members')
      .select('user_id, company_id, role, status'),
  ])

  const profileRows = (profiles ?? []) as ProfileRow[]
  const companyRows = (companies ?? []) as CompanyRow[]
  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[]
  const membershipRows = (memberships ?? []) as MemberRow[]

  const subMap = new Map(subscriptionRows.map((sub) => [sub.user_id, sub]))
  const companyMap = new Map(companyRows.map((company) => [company.id, company]))

  const membershipMap = new Map(
    membershipRows
      .filter((membership) => membership.user_id)
      .map((membership) => [membership.user_id as string, membership])
  )

  const individualUsers = profileRows.filter(
    (profile) => profile.account_type !== 'team'
  )

  const teamUsers = profileRows.filter(
    (profile) => profile.account_type === 'team'
  )

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin dashboard
          </Link>

          <form action="/auth/signout" method="post">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-[1320px] px-6 py-8">
        <div className="rounded-[32px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)] md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
            <UserCog className="h-4 w-4" />
            User management
          </div>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
                Users & companies
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f625d]">
                Add users, create companies, edit roles, activate/deactivate users,
                delete users, and manually upgrade plans.
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[22px] border border-[#e8ded3] bg-[#faf8f5] p-4">
                  <div className="text-sm font-semibold text-[#1a1a17]">
                    Users export
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href="/api/admin/export/users"
                      className="inline-flex items-center gap-2 rounded-full bg-[#1f4d38] px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Download className="h-4 w-4" />
                      Download all users
                    </a>
                  </div>

                  <form action="/api/admin/export/users" method="get" className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="date"
                        name="from"
                        className="rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                      />

                      <input
                        type="date"
                        name="to"
                        className="rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1c]"
                    >
                      <Download className="h-4 w-4" />
                      Download users by date
                    </button>
                  </form>
                </div>

                <div className="rounded-[22px] border border-[#e8ded3] bg-[#faf8f5] p-4">
                  <div className="text-sm font-semibold text-[#1a1a17]">
                    Companies export
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href="/api/admin/export/companies"
                      className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Download className="h-4 w-4" />
                      Download all companies
                    </a>
                  </div>

                  <form action="/api/admin/export/companies" method="get" className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="date"
                        name="from"
                        className="rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                      />

                      <input
                        type="date"
                        name="to"
                        className="rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1c]"
                    >
                      <Download className="h-4 w-4" />
                      Download companies by date
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-5">
              <Users className="h-6 w-6 text-[#d6612d]" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Total users
              </div>
              <div className="mt-2 text-3xl font-semibold">{profileRows.length}</div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-5">
              <Shield className="h-6 w-6 text-[#1f4d38]" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Individuals
              </div>
              <div className="mt-2 text-3xl font-semibold">{individualUsers.length}</div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-5">
              <Building2 className="h-6 w-6 text-[#d6612d]" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Team users
              </div>
              <div className="mt-2 text-3xl font-semibold">{teamUsers.length}</div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-5">
              <Crown className="h-6 w-6 text-[#1f4d38]" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Companies
              </div>
              <div className="mt-2 text-3xl font-semibold">{companyRows.length}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#e8ded3] bg-[#faf8f5] p-5">
              <h2 className="text-2xl font-semibold text-[#1a1a17]">
                Add user manually
              </h2>

              <form
                action="/api/admin/users/create"
                method="post"
                className="mt-5 space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="fullName" placeholder="Full name" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" required />
                  <input name="email" type="email" placeholder="Email" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" required />
                  <input name="password" type="text" placeholder="Temporary password" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" required />

                  <select name="accountType" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" defaultValue="individual">
                    <option value="individual">Individual</option>
                    <option value="team">Team member</option>
                  </select>

                  <select name="role" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" defaultValue="rep">
                    <option value="rep">Rep</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>

                  <select name="planKey" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" defaultValue="starter">
                    <option value="starter">Starter</option>
                    <option value="pro_monthly">Pro monthly</option>
                    <option value="pro_yearly">Pro yearly</option>
                    <option value="advanced_monthly">Advanced monthly</option>
                    <option value="advanced_yearly">Advanced yearly</option>
                  </select>

                  <select name="companyId" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" defaultValue="">
                    <option value="">No company</option>
                    {companyRows.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white">
                  <Plus className="h-4 w-4" />
                  Add user
                </button>
              </form>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-[#faf8f5] p-5">
              <h2 className="text-2xl font-semibold text-[#1a1a17]">
                Add company manually
              </h2>

              <form
                action="/api/admin/companies/create"
                method="post"
                className="mt-5 space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="name" placeholder="Company name" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" required />
                  <input name="slug" placeholder="Slug e.g. acme-sales" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" />
                  <input name="teamSize" placeholder="Team size e.g. 10" className="rounded-2xl border border-[#ddd4ca] px-4 py-3 text-sm" />
                </div>

                <button className="inline-flex items-center gap-2 rounded-full bg-[#1f4d38] px-5 py-3 text-sm font-semibold text-white">
                  <Plus className="h-4 w-4" />
                  Add company
                </button>
              </form>
            </div>
          </div>

           <UserTable
            title="Company users"
            users={teamUsers}
            subMap={subMap}
            membershipMap={membershipMap}
            companyMap={companyMap}
          />

          <UserTable
            title="Individual users"
            users={individualUsers}
            subMap={subMap}
            membershipMap={membershipMap}
            companyMap={companyMap}
          />

          <div className="mt-8 rounded-[28px] border border-[#e8ded3] bg-white p-5">
            <h2 className="text-2xl font-semibold text-[#1a1a17]">
              Companies
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {companyRows.map((company) => (
                <div
                  key={company.id}
                  className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-4"
                >
                  <div className="text-lg font-semibold text-[#1a1a17]">
                    {company.name}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Slug: {company.slug || '—'}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Team size: {company.team_size || '—'}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    Created: {formatDate(company.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function UserTable({
  title,
  users,
  subMap,
  membershipMap,
  companyMap,
}: {
  title: string
  users: ProfileRow[]
  subMap: Map<string, SubscriptionRow>
  membershipMap: Map<string, MemberRow>
  companyMap: Map<string, CompanyRow>
}) {
  return (
    <div className="mt-8 rounded-[28px] border border-[#e8ded3] bg-white p-5">
      <h2 className="text-2xl font-semibold text-[#1a1a17]">{title}</h2>

      <div className="mt-5 overflow-x-auto rounded-[20px] border border-[#ece4da]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#faf8f5] text-xs uppercase tracking-[0.12em] text-[#7d7f7a]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f1e9e0]">
            {users.length > 0 ? (
              users.map((profile) => {
                const sub = subMap.get(profile.id)
                const membership = membershipMap.get(profile.id)
                const company = membership
                  ? companyMap.get(membership.company_id)
                  : null

                return (
                  <tr key={profile.id} className="bg-white">
                    <td className="px-4 py-4 font-semibold text-[#1a1a17]">
                      {profile.full_name || 'Unnamed user'}
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {profile.email || '—'}
                    </td>
                    <td className="px-4 py-4 capitalize">
                      {profile.account_type || 'individual'}
                    </td>
                    <td className="px-4 py-4 capitalize">
                      {profile.role || 'rep'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-[#e6ddd2] bg-[#faf8f5] px-3 py-1 text-xs font-semibold text-[#555854]">
                        {sub?.plan_key || 'starter'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {company?.name || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                          profile.status
                        )}`}
                      >
                        {profile.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#666864]">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/users/${profile.id}`}
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
                <td colSpan={9} className="px-4 py-6 text-center text-[#666864]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}