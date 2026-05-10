import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-[#e7ddd3] bg-[#f7f3ee]">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <img
              src="/images/logo.png"
              alt="Genim Logo"
              className="h-[150px] w-auto object-contain"
            />

            {/* <p className="mt-4 text-sm leading-7 text-[#666864]">
              AI-powered sales roleplay and coaching platform for reps,
              managers, and sales teams.
            </p> */}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1f1c]">
              Product
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#666864]">
              <Link href="/pricing">Pricing</Link>
              <Link href="/sales-coaching">Sales coaching</Link>
              <Link href="/teams">Teams</Link>
              <Link href="/hiring-assessments">
                Hiring assessments
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1f1c]">
              Company
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#666864]">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/security">Security</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1f1c]">
              Legal
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#666864]">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e7ddd3] pt-6 text-sm text-[#777a75]">
          © 2026 Genim. All rights reserved.
        </div>
      </div>
    </footer>
  )
}