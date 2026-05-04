import { CreditCard, Send, ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

type AdminBillingPageProps = {
  searchParams: Promise<{
    companyId?: string
    seatLimit?: string
    requestId?: string
    sent?: string
  }>
}

export default async function AdminBillingPage({
  searchParams,
}: AdminBillingPageProps) {
  const params = await searchParams
  const adminClient = createAdminClient()

  const { data: companies, error } = await adminClient
    .from('companies')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#7d7f7a]">
          <CreditCard className="h-4 w-4" />
          Admin billing
        </div>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#171714]">
              Create team invoice
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#666864]">
              Send a Stripe invoice to a company billing email. Once paid, the
              company subscription activates from the webhook automatically.
            </p>
          </div>

          <div className="rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-4 py-2 text-xs font-semibold text-[#1f4d38]">
            Stripe invoice flow
          </div>
        </div>

        {params.sent === '1' ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Invoice created and sent. The company subscription will activate
            once payment is completed.
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <form
          action="/api/admin/billing/create-invoice"
          method="post"
          className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="requestId" value={params.requestId || ''} />

          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Company
              </label>
              <select
                name="companyId"
                required
                defaultValue={params.companyId || ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="">Select company</option>
                {(companies ?? []).map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Billing email
                </label>
                <input
                  type="email"
                  name="billingEmail"
                  required
                  placeholder="admin@company.com"
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Seat limit
                </label>
                <input
                  type="number"
                  name="seatLimit"
                  min="1"
                  required
                  defaultValue={params.seatLimit || ''}
                  placeholder="10"
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Total amount USD
                </label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="0.01"
                  required
                  placeholder="500"
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Billing period end
                </label>
                <input
                  type="date"
                  name="currentPeriodEnd"
                  required
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              <Send className="h-4 w-4" />
              Send Stripe invoice
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5f0] text-[#1f4d38]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#171714]">
              How this works
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-[#666864]">
              <p>1. Select company and billing email.</p>
              <p>2. Enter seats, amount, and billing period.</p>
              <p>3. Stripe sends invoice to the customer.</p>
              <p>4. When paid, webhook activates the team plan.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#f0d7c8] bg-[#fff7f2] p-5">
            <h3 className="text-sm font-semibold text-[#a2542f]">
              Before sending
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#765241]">
              Confirm the email, amount, and seat limit. This sends a real
              invoice when Stripe is in live mode.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}