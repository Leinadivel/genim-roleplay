import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreditCard, LogOut } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

export default async function AdminBillingPage() {
  const { user, admin } = await getGenimAdmin()

  if (!user) {
    redirect('/login')
  }

  if (!admin) {
    redirect('/scenarios')
  }

  const adminClient = createAdminClient()

  const { data: companies, error } = await adminClient
    .from('companies')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
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

      <section className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <CreditCard className="h-4 w-4" />
            Genim admin billing
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
            Create team invoice
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f625d]">
            Use this internal page to send a Stripe invoice to a company billing
            email. Once paid, Stripe will activate the company subscription.
          </p>

          <form
            action="/api/admin/billing/create-invoice"
            method="post"
            className="mt-8 grid gap-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Company
              </label>
              <select
                name="companyId"
                required
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm outline-none"
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
                <label className="mb-2 block text-sm font-medium">
                  Billing email
                </label>
                <input
                  type="email"
                  name="billingEmail"
                  required
                  placeholder="admin@company.com"
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Seat limit
                </label>
                <input
                  type="number"
                  name="seatLimit"
                  min="1"
                  required
                  placeholder="10"
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Total amount USD
                </label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="0.01"
                  required
                  placeholder="500"
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Billing period end
                </label>
                <input
                  type="date"
                  name="currentPeriodEnd"
                  required
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white"
            >
              Send Stripe invoice
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}