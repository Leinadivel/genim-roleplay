'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/update-password`
          : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        throw error
      }

      setMessage(
        'Password reset link sent. Check your email and open the link to set a new password.'
      )
      setEmail('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send reset email'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <div className="flex min-h-screen items-center justify-center px-6 py-10 md:px-10">
        <div className="w-full max-w-[560px]">
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>

          <div className="rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Forgot password
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
                Reset your password
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
                Enter the email address linked to your account and we will send
                you a secure password reset link.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Email address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                  <Mail className="h-5 w-5 text-[#8a8b86]" />
                  <input
                    type="email"
                    className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>

            <div className="mt-8 border-t border-[#eee5db] pt-6">
              <p className="text-sm text-[#646661]">
                Remembered your password?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#d6612d] hover:underline"
                >
                  Go back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}