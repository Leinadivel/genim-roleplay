'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function canViewTeamDashboard(role: string | null) {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export default function DashboardLink() {
  const [showLink, setShowLink] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadMembership() {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (isMounted) setShowLink(false)
          return
        }

        const { data: membership, error } = await supabase
          .from('company_members')
          .select('role, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) {
          if (isMounted) setShowLink(false)
          return
        }

        if (isMounted) {
          setShowLink(canViewTeamDashboard(membership?.role ?? null))
        }
      } catch {
        if (isMounted) setShowLink(false)
      }
    }

    void loadMembership()

    return () => {
      isMounted = false
    }
  }, [])

  if (!showLink) return null

  return (
    <Link
      href="/team"
      className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-5 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
    >
      Back to dashboard
    </Link>
  )
}