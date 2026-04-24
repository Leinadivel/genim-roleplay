import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreditCard, LayoutDashboard, LogOut } from 'lucide-react'
import { getGenimAdmin } from '@/lib/genim-admin'

export default async function AdminDashboardPage() {
  const { user, admin } = await getGenimAdmin()

  if (!user) redirect('/login')
  if (!admin) redirect('/scenarios')

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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-4 py-2 text-sm font-medium text-[#1f4d38]">
            <LayoutDashboard className="h-4 w-4" />
            Genim admin
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
            Admin dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f625d]">
            Manage internal Genim operations, billing, company invoices, and
            future platform controls from here.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Link
              href="/admin/billing"
              className="rounded-[26px] border border-[#e8ded3] bg-[#faf8f5] p-6 transition hover:bg-white"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
                <CreditCard className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#1a1a17]">
                Billing & invoices
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                Create and send Stripe invoices to companies for custom team
                subscriptions.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}