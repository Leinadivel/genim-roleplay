'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function finishWithSession(typeHint?: string | null) {
      const supabase = createClient()
      const next = searchParams.get('next') || '/post-login'

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!data.session) {
        return false
      }

      if (cancelled) return true

      if (typeHint === 'invite' || typeHint === 'recovery') {
        router.replace('/set-password')
        return true
      }

      router.replace(next)
      return true
    }

    async function handleAuthCallback() {
      try {
        const supabase = createClient()
        const next = searchParams.get('next') || '/post-login'

        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash

        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const typeFromHash = hashParams.get('type')

        const code = searchParams.get('code')
        const tokenHash = searchParams.get('token_hash')
        const typeFromQuery = searchParams.get('type')

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            throw sessionError
          }

          if (cancelled) return

          if (typeFromHash === 'invite' || typeFromHash === 'recovery') {
            router.replace('/set-password')
            return
          }

          router.replace(next)
          return
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            throw exchangeError
          }

          if (await finishWithSession(typeFromQuery)) {
            return
          }
        }

        if (tokenHash && typeFromQuery) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeFromQuery as
              | 'signup'
              | 'invite'
              | 'recovery'
              | 'email_change'
              | 'email',
          })

          if (verifyError) {
            throw verifyError
          }

          if (await finishWithSession(typeFromQuery)) {
            return
          }
        }

        if (await finishWithSession(typeFromHash || typeFromQuery)) {
          return
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event) => {
          if (cancelled) return

          if (
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED'
          ) {
            subscription.unsubscribe()

            if (await finishWithSession(typeFromHash || typeFromQuery)) {
              return
            }
          }
        })

        setTimeout(async () => {
          subscription.unsubscribe()
          if (cancelled) return

          if (await finishWithSession(typeFromHash || typeFromQuery)) {
            return
          }

          router.replace('/login')
        }, 2500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    void handleAuthCallback()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c]">
      <div className="mx-auto flex min-h-[80vh] max-w-[640px] items-center justify-center">
        <div className="w-full rounded-[32px] border border-[#e8ded3] bg-white p-8 text-center shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-10">
          {error ? (
            <>
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-red-600">
                Authentication error
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-[#181815]">
                We could not complete your sign-in
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#63655f]">{error}</p>
              <button
                type="button"
                onClick={() => router.replace('/login')}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#d6612d] px-6 py-3 text-sm font-semibold text-white"
              >
                Go to login
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3ed] text-[#d6612d]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Completing sign-in
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-[#181815]">
                Just a moment
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#63655f]">
                We are securely finalising your invite or sign-in session.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function AuthCallbackFallback() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c]">
      <div className="mx-auto flex min-h-[80vh] max-w-[640px] items-center justify-center">
        <div className="w-full rounded-[32px] border border-[#e8ded3] bg-white p-8 text-center shadow-[0_18px_50px_rgba(28,28,20,0.05)] md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3ed] text-[#d6612d]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            Loading
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-[#181815]">
            Preparing authentication
          </h1>
        </div>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}