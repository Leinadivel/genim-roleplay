'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  CreditCard,
  Download,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Individuals',
    href: '/admin/users/individuals',
    icon: Users,
  },
  {
    label: 'Companies',
    href: '/admin/users/companies',
    icon: Building2,
  },
  {
    label: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
  },
  {
    label: 'Exports',
    href: '/admin/exports',
    icon: Download,
  },
]

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="sticky top-0 z-40 border-b border-[#e6ddd2] bg-[#f7f3ee]/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex h-10 items-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Genim Logo"
              className="h-[110px] w-auto max-w-none object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-[#d8d1c8] bg-white p-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <aside className="absolute left-0 top-0 h-full w-[290px] bg-white p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/admin" className="flex h-10 items-center overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="Genim Logo"
                  className="h-[110px] w-auto max-w-none object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#d8d1c8] bg-white p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AdminNav pathname={pathname} closeMobile={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-[#e6ddd2] bg-white p-5 lg:block">
          <div className="flex h-12 items-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Genim Logo"
              className="h-[130px] w-auto max-w-none object-contain"
            />
          </div>

          <div className="mt-8">
            <AdminNav pathname={pathname} />
          </div>
        </aside>

        <div className="min-w-0">
          <header className="hidden border-b border-[#e6ddd2] bg-[#f7f3ee] lg:block">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <h1 className="inline-flex items-center gap-2 mt-1 text-2xl font-semibold text-[#171714]">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/billing"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium"
                >
                  <Home className="h-4 w-4" />
                  Create Invoice
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <form action="/auth/signout" method="post">
                  <button className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

function AdminNav({
  pathname,
  closeMobile,
}: {
  pathname: string
  closeMobile?: () => void
}) {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobile}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active
                ? 'bg-[#d6612d] text-white'
                : 'text-[#4f514d] hover:bg-[#faf8f5]'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}

      <form action="/auth/signout" method="post" className="pt-4 lg:hidden">
        <button className="flex w-full items-center gap-3 rounded-2xl border border-[#e8ded3] bg-[#faf8f5] px-4 py-3 text-sm font-semibold text-[#4f514d]">
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </form>
    </nav>
  )
}