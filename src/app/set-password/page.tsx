'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function bootstrapInviteSession() {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (user) {
          if (!mounted) return
          setSessionReady(true)
          return
        }

        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          throw refreshError
        }

        const {
          data: { user: refreshedUser },
          error: refreshedUserError,
        } = await supabase.auth.getUser()

        if (refreshedUserError) {
          throw refreshedUserError
        }

        if (!mounted) return

        if (!refreshedUser) {
          setSessionReady(false)
          setError(
            'Your invite session is no longer active. Please reopen the invite email and try again.'
          )
          return
        }

        setSessionReady(true)
      } catch (err) {
        if (!mounted) return
        setSessionReady(false)
        setError(
          err instanceof Error
            ? err.message
            : 'Could not verify your invite session.'
        )
      } finally {
        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    void bootstrapInviteSession()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please reconnect and try again.')
      }

      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long.')
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.')
      }

      const supabase = createClient()

      const {
        data: { user: beforeRefreshUser },
      } = await supabase.auth.getUser()

      if (!beforeRefreshUser) {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          throw refreshError
        }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        throw new Error(
          'Your invite session is missing. Please reopen the invite email and try again.'
        )
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        throw updateError
      }

      setMessage('Password set successfully. Redirecting...')
      router.replace('/post-login')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to set password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c]">
      <div className="mx-auto flex min-h-[80vh] max-w-[640px] items-center justify-center">
        <div className="w-full rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Team invite
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
              Set your password
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
              Create your password to activate your access and enter the team
              workspace.
            </p>
          </div>

          {checkingSession ? (
            <div className="mt-8 rounded-[24px] border border-[#ece4da] bg-[#faf8f5] px-5 py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3ed] text-[#d6612d]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="mt-4 text-sm font-medium text-[#5f625d]">
                Verifying your invite session...
              </div>
            </div>
          ) : sessionReady ? (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  New password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4">
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

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Confirm password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4">
                  <Lock className="h-5 w-5 text-[#8a8b86]" />
                  <input
                    type="password"
                    className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
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
                {loading ? 'Saving password...' : 'Set password'}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#d6612d] px-6 py-3 text-sm font-semibold text-white"
                >
                  Go to login
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-[#eee5db] pt-6">
            <p className="text-sm text-[#646661]">
              Already have access?{' '}
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
    </main>
  )
}