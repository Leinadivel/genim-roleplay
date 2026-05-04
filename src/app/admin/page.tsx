import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CreditCard,
  LayoutDashboard,
  UserCog,
  Users,
} from 'lucide-react'
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
  }).format(new Date(value))
}

export default async function AdminDashboardPage() {
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
    ((companies ?? []) as CompanyRow[]).map((c) => [c.id, c.name])
  )

  const requests = (seatRequests ?? []) as SeatRequestRow[]

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <section className="mx-auto max-w-[1240px] px-6 py-8">
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            {
              label: 'Companies',
              value: companyCount ?? 0,
              icon: <Building2 className="h-5 w-5" />,
              tone: 'orange',
            },
            {
              label: 'Active plans',
              value: activeSubscriptionCount ?? 0,
              icon: <CreditCard className="h-5 w-5" />,
              tone: 'green',
            },
            {
              label: 'Seat requests',
              value: pendingSeatRequestCount ?? 0,
              icon: <Users className="h-5 w-5" />,
              tone: 'orange',
            },
            {
              label: 'Users',
              value: userCount ?? 0,
              icon: <UserCog className="h-5 w-5" />,
              tone: 'green',
            },
            {
              label: 'Inactive',
              value: inactiveUserCount ?? 0,
              icon: <Users className="h-5 w-5" />,
              tone: 'orange',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-4 shadow-sm border border-[#eee6dc]"
            >
              <div
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                  card.tone === 'green'
                    ? 'bg-[#eef5f0] text-[#1f4d38]'
                    : 'bg-[#f7ede6] text-[#d6612d]'
                }`}
              >
                {card.icon}
              </div>

              <div className="mt-3 text-xs text-[#7d7f7a]">
                {card.label}
              </div>

              <div className="mt-1 text-xl font-semibold">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#eee6dc]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1a1a17]">
                Seat requests
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {requests.length > 0 ? (
                requests.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-[#f0e7dd] bg-[#faf8f5] p-4"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          {companyMap.get(r.company_id) || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#7d7f7a]">
                          {r.requested_seats} seats
                        </div>

                        {r.note && (
                          <div className="mt-2 text-xs text-[#5f625d]">
                            {r.note}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs text-[#7d7f7a]">
                        {formatDate(r.created_at)}

                        <Link
                          href={`/admin/billing?companyId=${r.company_id}&seatLimit=${r.requested_seats}&requestId=${r.id}`}
                          className="mt-2 inline-block rounded-full bg-[#d6612d] px-3 py-1 text-[11px] font-medium text-white"
                        >
                          Invoice
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#7d7f7a]">
                  No pending requests
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#eee6dc]">
            <h2 className="text-sm font-semibold text-[#1a1a17]">
              Actions
            </h2>

            <div className="mt-4 space-y-3">
              <Link
                href="/admin/users/individuals"
                className="flex items-center justify-between rounded-xl border border-[#eee6dc] bg-[#faf8f5] px-4 py-3 text-sm hover:bg-white"
              >
                Manage users
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/admin/billing"
                className="flex items-center justify-between rounded-xl border border-[#eee6dc] bg-[#faf8f5] px-4 py-3 text-sm hover:bg-white"
              >
                Billing & invoices
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}