'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function canViewTeamDashboard(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

type DashboardState = {
  isTeamMember: boolean
  canViewTeam: boolean
}

export default function DashboardLink() {
  const [state, setState] = useState<DashboardState | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboardTarget() {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (isMounted) setState(null)
          return
        }

        const { data: membership } = await supabase
          .from('company_members')
          .select('role, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (isMounted) {
          setState({
            isTeamMember: Boolean(membership),
            canViewTeam: canViewTeamDashboard(membership?.role ?? null),
          })
        }
      } catch {
        if (isMounted) {
          setState({
            isTeamMember: false,
            canViewTeam: false,
          })
        }
      }
    }

    void loadDashboardTarget()

    return () => {
      isMounted = false
    }
  }, [])

  if (!state) return null

  return (
    <>
      {state.canViewTeam ? (
        <Link
          href="/team"
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
        >
          Team dashboard
        </Link>
      ) : null}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
      >
        My dashboard
      </Link>
    </>
  )
}