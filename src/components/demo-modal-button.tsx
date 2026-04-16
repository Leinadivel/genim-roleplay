'use client'

import { useEffect, useState } from 'react'
import { PopupModal } from 'react-calendly'
import { Play } from 'lucide-react'

type DemoModalButtonProps = {
  className?: string
  label?: string
  calendlyUrl: string
  showIcon?: boolean
}

export default function DemoModalButton({
  className = '',
  label = 'Book a demo',
  calendlyUrl,
  showIcon = true,
}: DemoModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {showIcon ? <Play className="h-5 w-5" /> : null}
        {label}
      </button>

      {isMounted ? (
        <PopupModal
          url={calendlyUrl}
          open={isOpen}
          onModalClose={() => setIsOpen(false)}
          rootElement={document.body}
        />
      ) : null}
    </>
  )
}