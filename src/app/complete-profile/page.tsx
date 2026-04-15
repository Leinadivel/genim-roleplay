'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Briefcase, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CompleteProfilePage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [booting, setBooting] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.replace('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          throw profileError
        }

        if (!mounted) return

        setFullName(
          profile?.full_name ||
            (typeof user.user_metadata?.full_name === 'string'
              ? user.user_metadata.full_name
              : '') ||
            ''
        )

        setJobTitle(
          (typeof user.user_metadata?.job_title === 'string'
            ? user.user_metadata.job_title
            : '') || ''
        )
      } catch (err) {
        if (!mounted) return
        setError(
          err instanceof Error ? err.message : 'Failed to load your profile.'
        )
      } finally {
        if (mounted) {
          setBooting(false)
        }
      }
    }

    void loadProfile()

    return () => {
      mounted = false
    }
  }, [router])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const trimmedName = fullName.trim()
      const trimmedJobTitle = jobTitle.trim()

      if (!trimmedName) {
        throw new Error('Full name is required.')
      }

      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Your session could not be loaded. Please log in again.')
      }

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
        })
        .eq('id', user.id)

      if (profileUpdateError) {
        throw profileUpdateError
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          job_title: trimmedJobTitle || null,
        },
      })

      if (authUpdateError) {
        throw authUpdateError
      }

      router.replace('/post-login')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save your profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c]">
      <div className="mx-auto flex min-h-[80vh] max-w-[720px] items-center justify-center">
        <div className="w-full rounded-[32px] border border-[#e8ded3] bg-white p-8 shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Complete profile
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#181815]">
              Finish setting up your account
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#63655f]">
              Add your name so your activity can be tracked correctly inside the
              company workspace.
            </p>
          </div>

          {booting ? (
            <div className="mt-8 rounded-[24px] border border-[#ece4da] bg-[#faf8f5] px-5 py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3ed] text-[#d6612d]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="mt-4 text-sm font-medium text-[#5f625d]">
                Loading your profile...
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Full name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4">
                  <User className="h-5 w-5 text-[#8a8b86]" />
                  <input
                    type="text"
                    className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#343631]">
                  Job title
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4">
                  <Briefcase className="h-5 w-5 text-[#8a8b86]" />
                  <input
                    type="text"
                    className="w-full border-none bg-transparent text-[15px] text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Sales Representative"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Continue'}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[#eee5db] pt-6">
            <p className="text-sm text-[#646661]">
              Need to switch account?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#d6612d] hover:underline"
              >
                Go to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}