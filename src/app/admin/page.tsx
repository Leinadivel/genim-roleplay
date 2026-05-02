import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  UserCog,
  Users,
} from 'lucide-react'
import { getGenimAdmin } from '@/lib/genim-admin'
import { createAdminClient } from '@/lib/supabase/admin'

type SeatRequestRow = {
  id: string
  company_id: string
  requested_by: string
  requested_seats: number
  note: string | null
  status: string
  created_at: string
}

type CompanyRow = {
  id: string
  name: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function AdminDashboardPage() {
  const { user, admin } = await getGenimAdmin()

  if (!user) redirect('/login')
  if (!admin) redirect('/scenarios')

  const adminClient = createAdminClient()

  const [
    { count: companyCount },
    { count: activeSubscriptionCount },
    { count: pendingSeatRequestCount },
    { count: userCount },
    { count: inactiveUserCount },
    { data: seatRequests },
    { data: companies },
  ] = await Promise.all([
    adminClient.from('companies').select('*', { count: 'exact', head: true }),
    adminClient
      .from('company_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    adminClient
      .from('company_seat_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive'),
    adminClient
      .from('company_seat_requests')
      .select('id, company_id, requested_by, requested_seats, note, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    adminClient.from('companies').select('id, name'),
  ])

  const companyMap = new Map(
    ((companies ?? []) as CompanyRow[]).map((company) => [company.id, company.name])
  )

  const requests = (seatRequests ?? []) as SeatRequestRow[]

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
          <Link href="/" className="flex h-10 items-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Genim Logo"
              className="h-[120px] w-auto max-w-none object-contain"
            />
          </Link>

          <form action="/auth/signout" method="post">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-6 py-10">
        <div className="rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
            <LayoutDashboard className="h-4 w-4" />
            Genim admin
          </div>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
                Admin dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f625d]">
                Manage company billing, seat requests, invoices, and internal
                Genim operations from one place.
              </p>
            </div>

            <Link
              href="/admin/billing"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white"
            >
              Create invoice
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

         <div className="mt-8 grid gap-5 md:grid-cols-5">
            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Companies
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#181815]">
                {companyCount ?? 0}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Active team plans
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#181815]">
                {activeSubscriptionCount ?? 0}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Pending seat requests
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#181815]">
                {pendingSeatRequestCount ?? 0}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                <UserCog className="h-6 w-6" />
              </div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Users
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#181815]">
                {userCount ?? 0}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-[#faf8f5] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Inactive users
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#181815]">
                {inactiveUserCount ?? 0}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
            <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Seat requests
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1a1a17]">
                    Recent company requests
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-base font-semibold text-[#1a1a17]">
                            {companyMap.get(request.company_id) || 'Unknown company'}
                          </div>

                          <div className="mt-1 text-sm text-[#666864]">
                            Requested seats: {request.requested_seats}
                          </div>

                          {request.note ? (
                            <div className="mt-3 rounded-2xl border border-[#e8ded3] bg-white px-4 py-3 text-sm leading-7 text-[#5f625d]">
                              {request.note}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 text-sm text-[#666864]">
                          <span>{formatDate(request.created_at)}</span>
                          <Link
                            href={`/admin/billing?companyId=${request.company_id}&seatLimit=${request.requested_seats}&requestId=${request.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-[#d6612d] px-4 py-2 text-xs font-semibold text-white"
                          >
                            Create invoice
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-4 text-sm text-[#666864]">
                    No pending seat requests yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e8ded3] bg-[#faf8f5] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Admin actions
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between rounded-[20px] border border-[#e8ded3] bg-white px-5 py-4 text-sm font-semibold text-[#1f1f1c] transition hover:bg-[#fff8f3]"
                >
                  Users & companies
                  <ArrowRight className="h-4 w-4" />
                </Link>
                
                <Link
                  href="/admin/billing"
                  className="flex items-center justify-between rounded-[20px] border border-[#e8ded3] bg-white px-5 py-4 text-sm font-semibold text-[#1f1f1c] transition hover:bg-[#fff8f3]"
                >
                  Billing & invoices
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}