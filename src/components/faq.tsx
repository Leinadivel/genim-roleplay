'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FAQItem = {
  question: string
  answer: string
}

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item, index) => {
        const open = openIndex === index

        return (
          <div
            key={item.question}
            className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_8px_25px_rgba(25,25,20,0.04)]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-lg font-semibold text-[#1a1a17]">
                {item.question}
              </span>

              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#7d7f7a] transition ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {open ? (
              <p className="mt-4 text-sm leading-7 text-[#5f625d]">
                {item.answer}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}