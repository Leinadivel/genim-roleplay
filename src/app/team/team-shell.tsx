import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Menu,
  PlayCircle,
  UserPlus,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import CurrentPlanCard from '../scenarios/current-plan-card'
import ProfileMenu from '@/components/profile-menu'


function canManage(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export default async function TeamShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) redirect('/scenarios')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .maybeSingle()
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const canManageTeam = canManage(membership.role)

  const navItems = [
    {
      label: 'Overview',
      href: '/team',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Assignments',
      href: '/team/assignments',
      icon: ClipboardList,
      show: canManageTeam,
    },
    {
      label: 'Analytics',
      href: '/team/analytics',
      icon: BarChart3,
      show: canManageTeam,
    },
    {
      label: 'Hiring',
      href: '/team/hiring',
      icon: Briefcase,
      show: canManageTeam,
    },
    {
      label: 'Performance',
      href: '/team/performance',
      icon: BarChart3,
      show: canManageTeam,
    },
    {
      label: 'Members',
      href: '/team/members',
      icon: Users,
      show: canManageTeam,
    },
    {
      label: 'Request seats',
      href: '/team/request-seats',
      icon: UserPlus,
      show: canManageTeam,
    },
    {
      label: 'Billing',
      href: '/team/billing',
      icon: CreditCard,
      show: canManageTeam,
    },
  ].filter((item) => item.show)

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-[#e6ddd2] bg-[#fbf8f4] px-4 py-5 lg:block">
          <Link href="/team" className="flex h-12 items-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Genim Logo"
              className="h-[120px] w-auto max-w-none object-contain"
            />
          </Link>

          <div className="mt-6 space-y-3">
            <div className="[&>*]:w-full [&>*]:shadow-[0_8px_30px_rgba(25,25,20,0.06)]">
              <CurrentPlanCard />
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#4f514d] transition hover:bg-white hover:text-[#171714] hover:shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 rounded-[22px] border border-[#e8ded3] bg-[#1f4d38] p-4 text-white shadow-sm">
            <div className="text-sm font-semibold">Run practice</div>
            <p className="mt-1 text-xs leading-6 text-white/75">
              Start a live roleplay session from the scenario builder.
            </p>
            <Link
              href="/scenarios"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#1f4d38]"
            >
              <PlayCircle className="h-4 w-4" />
              Open roleplay
            </Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#e6ddd2] bg-[#f7f3ee]/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d1c8] bg-white lg:hidden">
                  <Menu className="h-4 w-4" />
                </button>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Team dashboard
                  </div>
                  <div className="text-sm font-semibold text-[#171714]">
                    {company?.name || 'Genim team'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">

                <ProfileMenu
                  name={profile?.full_name ?? null}
                  email={profile?.email ?? user.email ?? null}
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-[#ebe2d8] px-4 py-3 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e3d9ce] bg-white px-4 py-2 text-xs font-semibold text-[#4f514d]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </header>

          <div className="px-4 py-6 md:px-6">{children}</div>
        </section>
      </div>
    </main>
  )
}