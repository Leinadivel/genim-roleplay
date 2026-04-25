'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function canViewTeamDashboard(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export default function DashboardLink() {
  const [href, setHref] = useState<string | null>(null)
  const [label, setLabel] = useState('Dashboard')

  useEffect(() => {
    let isMounted = true

    async function loadDashboardTarget() {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (isMounted) setHref(null)
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
          if (canViewTeamDashboard(membership?.role ?? null)) {
            setHref('/team')
            setLabel('Team dashboard')
          } else {
            setHref('/dashboard')
            setLabel('My dashboard')
          }
        }
      } catch {
        if (isMounted) {
          setHref('/dashboard')
          setLabel('My dashboard')
        }
      }
    }

    void loadDashboardTarget()

    return () => {
      isMounted = false
    }
  }, [])

  if (!href) return null

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
    >
      {label}
    </Link>
  )
}