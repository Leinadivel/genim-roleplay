'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogOut, Settings, UserRound } from 'lucide-react'

export default function ProfileMenu({
  name,
  email,
}: {
  name: string | null
  email: string | null
}) {
  const [open, setOpen] = useState(false)

  const initials =
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    email?.[0]?.toUpperCase() ||
    'U'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f4d38] text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        {initials}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[260px] rounded-[22px] bg-white p-3 shadow-[0_18px_55px_rgba(25,25,20,0.16)] ring-1 ring-[#eee6dc]">
          <div className="rounded-[18px] bg-[#faf8f5] px-4 py-3">
            <div className="text-sm font-semibold text-[#171714]">
              {name || 'Your profile'}
            </div>
            <div className="mt-1 truncate text-xs text-[#666864]">
              {email || 'No email'}
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium text-[#2b2c2a] hover:bg-[#faf8f5]"
            >
              <UserRound className="h-4 w-4 text-[#1f4d38]" />
              View profile
            </Link>

            <Link
              href="/profile/edit"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium text-[#2b2c2a] hover:bg-[#faf8f5]"
            >
              <Settings className="h-4 w-4 text-[#d6612d]" />
              Edit profile
            </Link>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}