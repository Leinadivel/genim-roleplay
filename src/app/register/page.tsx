'use client'

import Link from 'next/link'
import image from 'next/image'
import { FormEvent, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AccountType = 'individual' | 'team'

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>('individual')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        window.location.origin

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=/post-login`,
          data: {
            full_name: fullName,
            phone,
            job_title: jobTitle,
            account_type: accountType,
            company_name: accountType === 'team' ? companyName : null,
            team_size: accountType === 'team' ? teamSize : null,
          },
        },
      })

      if (error) {
        throw error
      }

      setMessage(
        'Account created successfully. Check your email to confirm your account before signing in.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden border-r border-[#e7ddd3] bg-[#f3ece4] lg:block">
          <div className="absolute right-[-100px] top-[-50px] h-[300px] w-[300px] rounded-full bg-[#e7a17f]/20 blur-3xl" />
          <div className="absolute bottom-[-90px] left-[-50px] h-[260px] w-[260px] rounded-full bg-[#1f4d38]/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between px-10 py-10">
            <div>
              <Link href="/" className="flex items-center pr-4 md:pr-6">
                <div className="flex h-10 items-center overflow-hidden">
                  <img
                    src="/images/logo.png"
                    alt="Genim Logo"
                    className="h-[200px] w-auto max-w-none object-contain"
                  />
                </div>
              </Link>

              <div className="mt-16 max-w-[540px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                  Built for reps and teams
                </div>

                <h1 className="mt-6 text-6xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#161614]">
                  Start training your
                  <span className="mt-2 block italic text-[#d6612d]">
                    sales team smarter.
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-8 text-[#5a5c58]">
                  Create an account for yourself or set up Genim as the
                  foundation for team-wide sales practice, onboarding, and
                  coaching.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-[28px] border border-[#e6ddd2] bg-white p-6 shadow-[0_12px_30px_rgba(26,26,20,0.05)]">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b7e79]">
                  What Genim helps with
                </p>

                <div className="mt-5 space-y-4">
                  {[
                    'Train new reps before they take live calls',
                    'Give managers a repeatable coaching system',
                    'Improve objection handling, discovery, and closing conversations',
                    'Create a clear practice workflow for individuals and teams',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1f4d38]" />
                      <span className="text-[15px] leading-7 text-[#4f514d]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e6ddd2] bg-[#eef5f0] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#385244]">
                  Team-first direction
                </p>
                <p className="mt-3 text-[15px] leading-7 text-[#4f6155]">
                  Even if you start as an individual today, this product is
                  being built to support managers, enablement leaders, and
                  multi-rep sales teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-[720px]">
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
                  Create account
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
                  Start with yourself or your team
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
                  Choose the setup that matches how you plan to use Genim right
                  now.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    accountType === 'individual'
                      ? 'border-[#d6612d] bg-[#fcf3ee]'
                      : 'border-[#e5dbcf] bg-[#faf8f5] hover:bg-white'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                    <User className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#1a1a17]">
                    Individual
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                    For solo reps, job seekers, and professionals improving
                    their sales conversations.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('team')}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    accountType === 'team'
                      ? 'border-[#1f4d38] bg-[#f1f7f3]'
                      : 'border-[#e5dbcf] bg-[#faf8f5] hover:bg-white'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#1a1a17]">
                    Team / Company
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#5f625d]">
                    For founders, managers, and sales leaders setting up a
                    structured training environment for reps.
                  </p>
                </button>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleRegister}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#343631]">
                      Full name
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                      <User className="h-5 w-5 text-[#8a8b86]" />
                      <input
                        type="text"
                        className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Daniel Levi"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#343631]">
                      Job title
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                      <Briefcase className="h-5 w-5 text-[#8a8b86]" />
                      <input
                        type="text"
                        className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Sales Manager"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
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
                    <label className="mb-2 block text-sm font-medium text-[#343631]">
                      Phone number
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                      <Phone className="h-5 w-5 text-[#8a8b86]" />
                      <input
                        type="tel"
                        className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234..."
                      />
                    </div>
                  </div>
                </div>

                {accountType === 'team' ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#343631]">
                        Company name
                      </label>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#1f4d38]">
                        <Building2 className="h-5 w-5 text-[#8a8b86]" />
                        <input
                          type="text"
                          className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Genim Ltd"
                          required={accountType === 'team'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#343631]">
                        Team size
                      </label>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#1f4d38]">
                        <Users className="h-5 w-5 text-[#8a8b86]" />
                        <select
                          className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none"
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          required={accountType === 'team'}
                        >
                          <option value="">Select team size</option>
                          <option value="1-5">1–5</option>
                          <option value="6-20">6–20</option>
                          <option value="21-50">21–50</option>
                          <option value="51-100">51–100</option>
                          <option value="100+">100+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                    <Lock className="h-5 w-5 text-[#8a8b86]" />
                    <input
                      type="password"
                      className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
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
                  {loading ? 'Creating account...' : 'Create account'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <div className="mt-8 border-t border-[#eee5db] pt-6">
                <p className="text-sm text-[#646661]">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#d6612d] hover:underline"
                  >
                    Log in
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