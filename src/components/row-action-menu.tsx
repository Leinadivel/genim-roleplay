'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Archive, ChevronRight, EllipsisVertical, FileEdit, Trash2 } from 'lucide-react'

type ActionItem =
  | {
      type: 'link'
      label: string
      href: string
      icon: 'edit' | 'report'
    }
  | {
      type: 'form'
      label: string
      action: string
      valueName: string
      value: string
      icon: 'archive' | 'delete'
      danger?: boolean
    }

export default function RowActionMenu({
  items,
}: {
  items: ActionItem[]
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function renderIcon(icon: ActionItem['icon']) {
    switch (icon) {
      case 'edit':
        return <FileEdit className="h-4 w-4" />
      case 'archive':
        return <Archive className="h-4 w-4" />
      case 'delete':
        return <Trash2 className="h-4 w-4" />
      case 'report':
        return <ChevronRight className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d1c8] bg-white text-[#2b2c2a] shadow-sm transition hover:bg-[#faf7f3]"
        aria-label="Open actions"
        aria-expanded={open}
      >
        <EllipsisVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-30 min-w-[190px] overflow-hidden rounded-[18px] border border-[#e7ddd3] bg-white p-2 shadow-[0_18px_40px_rgba(25,25,20,0.14)]">
          <div className="space-y-1">
            {items.map((item, index) => {
              if (item.type === 'link') {
                return (
                  <Link
                    key={`${item.label}-${index}`}
                    href={item.href}
                    className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3]"
                    onClick={() => setOpen(false)}
                  >
                    {renderIcon(item.icon)}
                    {item.label}
                  </Link>
                )
              }

              return (
                <form key={`${item.label}-${index}`} action={item.action} method="post">
                  <input type="hidden" name={item.valueName} value={item.value} />
                  <button
                    type="submit"
                    className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition ${
                      item.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-[#2b2c2a] hover:bg-[#faf7f3]'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {renderIcon(item.icon)}
                    {item.label}
                  </button>
                </form>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}