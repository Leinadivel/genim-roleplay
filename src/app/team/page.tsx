import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Shield,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_type, role, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/scenarios')
  }

  if (profile.account_type !== 'team' && profile.role !== 'owner') {
    redirect('/scenarios')
  }

  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (membershipError || !membership) {
    redirect('/scenarios')
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, slug, team_size')
    .eq('id', membership.company_id)
    .single()

  if (companyError || !company) {
    redirect('/scenarios')
  }

  const { count: memberCount, error: memberCountError } = await supabase
    .from('company_members')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)

  if (memberCountError) {
    throw new Error(`Failed to load member count: ${memberCountError.message}`)
  }

  const { count: sessionCount, error: sessionCountError } = await supabase
    .from('roleplay_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (sessionCountError) {
    throw new Error(`Failed to load session count: ${sessionCountError.message}`)
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-[28px] font-semibold tracking-[-0.04em]"
          >
            <span className="text-[#1b1b18]">Gen</span>
            <span className="italic text-[#d6612d]">im</span>
          </Link>

          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
          >
            Open roleplay
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="mx-auto max-w-[1240px] px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
            Team workspace
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-6xl">
            {company.name}
          </h1>

          <p className="mt-4 max-w-[760px] text-base leading-8 text-[#5b5d59] md:text-lg">
            Welcome back{profile.full_name ? `, ${profile.full_name}` : ''}. Manage
            team training, review progress, and build a structured sales practice
            environment.
          </p>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-[1240px] gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Company
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
              {company.name}
            </div>
            <div className="mt-1 text-sm text-[#666864]">
              Team size: {company.team_size || 'Not set'}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
              <Users className="h-6 w-6" />
            </div>
            <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Members
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#1a1a17]">
              {memberCount ?? 0}
            </div>
            <div className="mt-1 text-sm text-[#666864]">
              Active company users
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
              <Shield className="h-6 w-6" />
            </div>
            <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Your role
            </div>
            <div className="mt-2 text-2xl font-semibold capitalize text-[#1a1a17]">
              {membership.role}
            </div>
            <div className="mt-1 text-sm text-[#666864]">
              Status: {membership.status}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-[1240px] gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Workspace overview
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
              Team training foundation is live
            </h2>
            <p className="mt-3 text-sm leading-8 text-[#5f625d]">
              Your company workspace exists. The next phase is member invites,
              team analytics, and manager-level report visibility.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/scenarios"
                className="inline-flex items-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
              >
                Start a roleplay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Your activity
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#1a1a17]">
              Personal usage in workspace
            </h2>
            <div className="mt-5 rounded-[20px] border border-[#ece4da] bg-[#faf8f5] px-5 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                Sessions created by you
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#171714]">
                {sessionCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}