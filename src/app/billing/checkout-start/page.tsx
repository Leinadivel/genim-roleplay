import { Suspense } from 'react'
import CheckoutStartClient from './checkout-start-client'

export default function BillingCheckoutStartPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f3ee] px-6 py-16 text-[#1f1f1c]">
          <div className="mx-auto max-w-[760px] rounded-[28px] border border-[#e8ded3] bg-white p-8 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1f4d38]">
              Starting secure checkout
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
              Redirecting you to Stripe
            </h1>

            <p className="mt-4 text-base leading-8 text-[#5b5d59]">
              Please wait while we prepare your secure subscription checkout.
            </p>
          </div>
        </main>
      }
    >
      <CheckoutStartClient />
    </Suspense>
  )
}