import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-16 text-[#1f1f1c]">
      <div className="mx-auto max-w-[760px] rounded-[28px] border border-[#e8ded3] bg-white p-8 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
        <div className="flex items-center gap-3 text-[#1f4d38]">
          <CheckCircle2 className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">
            Payment successful
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
          Your subscription is active
        </h1>

        <p className="mt-4 text-base leading-8 text-[#5b5d59]">
          Your payment was successful. Your billing has been updated and your
          account is ready to continue.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/scenarios"
            className="inline-flex rounded-full bg-[#d6612d] px-6 py-3 text-sm font-semibold text-white"
          >
            Go to scenarios
          </Link>

          <Link
            href="/"
            className="inline-flex rounded-full border border-[#d8d1c8] px-6 py-3 text-sm font-semibold text-[#1f1f1c]"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}