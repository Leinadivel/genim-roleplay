import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreditCard, ReceiptText, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function canViewBilling(role: string | null) {
  return role === 'owner' || role === 'admin'
}

function formatDate(value: string | null) {
  if (!value) return 'No expiry'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatMoney(amount: number | null, currency: string | null) {
  if (typeof amount !== 'number') return '—'
  return `${(currency || 'USD').toUpperCase()} ${amount.toLocaleString()}`
}

export default async function TeamBillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership || !canViewBilling(membership.role)) redirect('/team')

  const [
    { data: company },
    { data: subscription },
    { count: activeMemberCount },
    { data: billingHistory },
  ] = await Promise.all([
      supabase
        .from('companies')
        .select('id, name')
        .eq('id', membership.company_id)
        .maybeSingle(),

      supabase
        .from('company_subscriptions')
        .select('status, seat_limit, amount_due, currency, current_period_end, stripe_invoice_id, stripe_customer_id')
        .eq('company_id', membership.company_id)
        .maybeSingle(),

      supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', membership.company_id)
        .eq('status', 'active'),

      supabase
        .from('company_billing_history')
        .select('id, amount, currency, status, description, invoice_id, paid_at, created_at')
        .eq('company_id', membership.company_id)
        .order('paid_at', { ascending: false }),
    ])

  if (!company) redirect('/team')

  const status = subscription?.status || 'not active'
  const seatLimit = subscription?.seat_limit ?? null
  const usedSeats = activeMemberCount ?? 0
  const openSeats = seatLimit ? Math.max(seatLimit - usedSeats, 0) : null
  const usagePercent =
    seatLimit && seatLimit > 0
      ? Math.min(100, Math.round((usedSeats / seatLimit) * 100))
      : 0

  const historyRows = billingHistory ?? []
  const totalPaid = historyRows
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0)

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Team billing
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
          Billing and seat plan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666864]">
          Review your company billing status, seat limit, and current workspace capacity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Billing status" value={status} icon={CreditCard} tone="green" />
        <StatCard label="Seat limit" value={seatLimit ?? 'Not set'} icon={Users} tone="orange" />
        <StatCard label="Amount due" value={formatMoney(subscription?.amount_due ?? null, subscription?.currency ?? null)} icon={ReceiptText} tone="blue" />
        <StatCard
          label="Total paid"
          value={formatMoney(totalPaid, subscription?.currency ?? null)}
          icon={ReceiptText}
          tone="green"
        />
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Current plan
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#171714]">
              {company.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#666864]">
              Current period ends: {formatDate(subscription?.current_period_end ?? null)}
            </p>
          </div>

          <Link
            href="/team/request-seats"
            className="inline-flex rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
          >
            Request more seats
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MiniCard label="Seats used" value={usedSeats} />
          <MiniCard label="Seat limit" value={seatLimit ?? 'Not set'} />
          <MiniCard label="Open seats" value={openSeats ?? '—'} />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
            <span>Usage</span>
            <span>{seatLimit ? `${usagePercent}%` : 'Not set'}</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#efe6dc]">
            <div
              className="h-full rounded-full bg-[#1f4d38]"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(25,25,20,0.06)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
              Billing history
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#171714]">
              Payments and invoices
            </h2>
          </div>

          <div className="rounded-full bg-[#eef5f0] px-4 py-2 text-xs font-semibold text-[#1f4d38]">
            {historyRows.length} records
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] bg-[#faf8f5]">
          {historyRows.length > 0 ? (
            <div className="divide-y divide-[#ece4da]">
              {historyRows.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_140px_120px_120px]"
                >
                  <div>
                    <div className="font-semibold text-[#171714]">
                      {item.description || 'Team subscription payment'}
                    </div>
                    <div className="mt-1 text-xs text-[#777a75]">
                      Invoice: {item.invoice_id || 'Manual record'}
                    </div>
                  </div>

                  <div className="font-semibold text-[#171714]">
                    {formatMoney(Number(item.amount), item.currency)}
                  </div>

                  <div>
                    <span className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold capitalize text-[#1f4d38]">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[#666864]">
                    {formatDate(item.paid_at || item.created_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-sm text-[#666864]">
              No billing history yet. Payments will appear here after invoices are marked paid.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[24px] bg-[#faf8f5] p-5 text-sm leading-7 text-[#666864]">
        If a team needs changes, request seats and Genim admin will create or update the invoice.
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  icon: any
  tone: 'green' | 'orange' | 'blue'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-[#eef5f0] text-[#1f4d38]'
      : tone === 'blue'
        ? 'bg-[#eef4ff] text-[#355c9a]'
        : 'bg-[#f7ede6] text-[#d6612d]'

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_30px_rgba(25,25,20,0.06)]">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#171714] capitalize">
        {value}
      </div>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] bg-[#faf8f5] px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-[#171714]">
        {value}
      </div>
    </div>
  )
}