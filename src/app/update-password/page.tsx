'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        setSessionReady(Boolean(session))
      } catch {
        if (!mounted) return
        setSessionReady(false)
      } finally {
        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    void checkRecoverySession()

    return () => {
      mounted = false
    }
  }, [])

  async function handleUpdatePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.')
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.')
      }

      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      setMessage('Password updated successfully. You can now log in.')
      setPassword('')
      setConfirmPassword('')

      window.setTimeout(() => {
        window.location.href = '/login'
      }, 1200)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
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
                Set new password
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
                Create a new password
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
                Choose a strong password for your account.
              </p>
            </div>

            {checkingSession ? (
              <div className="mt-8 rounded-2xl border border-[#ece4da] bg-[#faf8f5] px-4 py-4 text-sm text-[#555854]">
                Verifying reset session...
              </div>
            ) : !sessionReady ? (
              <div className="mt-8 rounded-2xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-700">
                This reset link is invalid or has expired. Please request a new
                password reset link.
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={handleUpdatePassword}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    New password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                    <Lock className="h-5 w-5 text-[#8a8b86]" />
                    <input
                      type="password"
                      className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#343631]">
                    Confirm new password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 focus-within:border-[#d6612d]">
                    <Lock className="h-5 w-5 text-[#8a8b86]" />
                    <input
                      type="password"
                      className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
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
                  {loading ? 'Updating password...' : 'Update password'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>
            )}

            <div className="mt-8 border-t border-[#eee5db] pt-6">
              <p className="text-sm text-[#646661]">
                Need a fresh link?{' '}
                <Link
                  href="/reset-password"
                  className="font-semibold text-[#d6612d] hover:underline"
                >
                  Request another reset email
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}