'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setMessage('Signed in successfully.')
      window.location.href = '/post-login'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden border-r border-[#e7ddd3] bg-[#f3ece4] lg:block">
          <div className="absolute right-[-120px] top-[-60px] h-[320px] w-[320px] rounded-full bg-[#e7a17f]/20 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-60px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between px-10 py-10">
            <div>
              <Link
                href="/"
                className="text-[28px] font-semibold tracking-[-0.04em]"
              >
                <span className="text-[#1b1b18]">Gen</span>
                <span className="italic text-[#d6612d]">im</span>
              </Link>

              <div className="mt-16 max-w-[520px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                  Sales roleplay training
                </div>

                <h1 className="mt-6 text-6xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#161614]">
                  Welcome back.
                  <span className="mt-2 block italic text-[#d6612d]">
                    Keep training.
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-8 text-[#5a5c58]">
                  Log in to continue practising realistic sales conversations,
                  reviewing feedback, and improving objection handling with
                  Genim.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-[28px] border border-[#e6ddd2] bg-white p-6 shadow-[0_12px_30px_rgba(26,26,20,0.05)]">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b7e79]">
                  Why reps return
                </p>

                <div className="mt-5 space-y-4">
                  {[
                    'Practice high-stakes conversations before live calls',
                    'Get fast transcript-based coaching after each session',
                    'Build confidence across cold outreach, discovery, objections, and close',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1f4d38]" />
                      <span className="text-[15px] leading-7 text-[#4f514d]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#666864]">
                New to Genim?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-[#d6612d] hover:underline"
                >
                  Create your account
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-[560px]">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="text-[28px] font-semibold tracking-[-0.04em]"
              >
                <span className="text-[#1b1b18]">Gen</span>
                <span className="italic text-[#d6612d]">im</span>
              </Link>
            </div>

            <div className="rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Log in
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
                  Continue your training
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
                  Sign in to access your scenarios, sessions, and coaching
                  reports.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSignIn}>
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

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label className="block text-sm font-medium text-[#343631]">
                      Password
                    </label>
                    <Link
                      href="/reset-password"
                      className="text-sm font-medium text-[#d6612d] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                    <Lock className="h-5 w-5 text-[#8a8b86]" />
                    <input
                      type="password"
                      className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                  {loading ? 'Signing in...' : 'Log in'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <div className="mt-8 border-t border-[#eee5db] pt-6">
                <p className="text-sm text-[#646661]">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-[#d6612d] hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}