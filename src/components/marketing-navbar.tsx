'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="text-[15px] font-medium text-[#41433f] transition hover:text-black"
    >
      {children}
    </Link>
  )
}

export default function MarketingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e6ddd2]/90 bg-[#f7f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="flex items-center pr-4 md:pr-6">
            <div className="flex h-10 items-center overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Genim Logo"
                className="h-[110px] md:h-[160px] w-auto max-w-none object-contain"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <NavLink href="/about">About</NavLink>
            <NavLink href="/sales-coaching">Sales coaching</NavLink>
            <NavLink href="/teams">Teams</NavLink>
            <NavLink href="/hiring-assessments">
              Hiring assessments
            </NavLink>
            {/* <NavLink href="/security">Security</NavLink> */}
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-3 text-sm font-medium text-[#41433f] transition hover:text-black md:inline-flex"
            >
              Log in
            </Link>

            <Link
              href="/book-demo"
              className="inline-flex rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Book Demo
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-[#e6ddd2] p-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>

              <button onClick={() => setMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-10 flex flex-col gap-6 text-lg">
              <Link href="/about" onClick={() => setMenuOpen(false)}>
                About
              </Link>

              <Link
                href="/sales-coaching"
                onClick={() => setMenuOpen(false)}
              >
                Sales coaching
              </Link>

              <Link href="/teams" onClick={() => setMenuOpen(false)}>
                Teams
              </Link>

              <Link
                href="/hiring-assessments"
                onClick={() => setMenuOpen(false)}
              >
                Hiring assessments
              </Link>

              {/* <Link href="/security" onClick={() => setMenuOpen(false)}>
                Security
              </Link> */}

              <Link href="/pricing" onClick={() => setMenuOpen(false)}>
                Pricing
              </Link>

              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <Link
                href="/login"
                className="w-full rounded-full border border-[#d8d1c8] px-5 py-3 text-center font-medium"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="w-full rounded-full bg-[#d6612d] px-5 py-3 text-center font-semibold text-white"
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}