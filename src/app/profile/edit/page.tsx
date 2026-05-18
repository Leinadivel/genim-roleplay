import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Mail, Save, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-8 text-[#1f1f1c] md:px-6">
      <div className="mx-auto max-w-[720px] space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_50px_rgba(25,25,20,0.06)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
            Edit profile
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
            Update your account details
          </h1>

          <p className="mt-2 text-sm leading-7 text-[#666864]">
            You can update your display name here. Email changes should be
            handled separately through Supabase Auth confirmation.
          </p>

          <form action="/api/profile/update" method="post" className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#343631]">
                Full name
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-[#faf8f5] px-4 py-4 ring-1 ring-[#eee6dc] focus-within:bg-white focus-within:ring-[#d6612d]">
                <UserRound className="h-5 w-5 text-[#8a8d87]" />
                <input
                  name="fullName"
                  defaultValue={profile?.full_name || ''}
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-transparent text-sm text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#343631]">
                Email address
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f1eee9] px-4 py-4 ring-1 ring-[#eee6dc]">
                <Mail className="h-5 w-5 text-[#8a8d87]" />
                <input
                  value={profile?.email || user.email || ''}
                  readOnly
                  className="w-full bg-transparent text-sm text-[#666864] outline-none"
                />
              </div>
              <p className="mt-2 text-xs leading-6 text-[#777a75]">
                Email is read-only for now to avoid breaking confirmation and login flows.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              <Save className="h-4 w-4" />
              Save profile
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}