'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      setMessage('Account created. Check your email if confirmation is enabled.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

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
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-gray-600">
        Minimal auth page for structure testing.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Daniel Levi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        {error ? (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Please wait...' : 'Sign in'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const form = document.querySelector('form')
              form?.requestSubmit()
            }}
            className="hidden"
          >
            hidden
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              setError(null)
              setMessage(null)

              try {
                const supabase = createClient()

                const { error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: {
                      full_name: fullName,
                    },
                  },
                })

                if (error) throw error

                setMessage(
                  'Account created. Check your email if confirmation is enabled.'
                )
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : 'Failed to sign up'
                )
              } finally {
                setLoading(false)
              }
            }}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Please wait...' : 'Sign up'}
          </button>
        </div>
      </form>
    </main>
  )
}