'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Mic,
  Send,
  X,
} from 'lucide-react'

type ChatMessage = {
  id: string
  speaker: 'user' | 'assistant' | 'system'
  message_text: string
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/roleplay/messages?sessionId=${sessionId}`)
        const data = await res.json()

        if (res.ok) {
          setMessages(data.messages || [])
        }
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [sessionId])

  async function handleSend() {
    if (!input.trim() || sending) return

    try {
      setSending(true)

      const saveRes = await fetch('/api/roleplay/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageText: input }),
      })

      const saveData = await saveRes.json()

      if (!saveRes.ok) throw new Error()

      setMessages((prev) => [...prev, saveData.message])
      setInput('')

      setAiTyping(true)

      const aiRes = await fetch('/api/roleplay/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const aiData = await aiRes.json()

      setAiTyping(false)

      if (aiRes.ok && aiData.message) {
        setMessages((prev) => [...prev, aiData.message])
      }
    } catch (err) {
      console.error(err)
      setAiTyping(false)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  function handleExit() {
    if (confirm('Are you sure you want to exit this session?')) {
      router.push('/scenarios')
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      {/* HEADER */}
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-5">
          <Link
            href="/scenarios"
            className="flex items-center gap-2 text-sm font-medium text-[#333]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to scenarios
          </Link>

          <button
            onClick={handleExit}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-[#333] hover:bg-white"
          >
            <X className="h-4 w-4" />
            Cancel Scenario
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="mx-auto max-w-[800px] px-6 py-10">
        {/* TITLE */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            AI Sales Roleplay
          </h1>
          <p className="text-[#666] text-sm">
            Speak naturally. The buyer will respond in real time.
          </p>
        </div>

        {/* CHAT */}
        <div className="rounded-[20px] border bg-white p-5 space-y-4 min-h-[420px] max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              Start the conversation.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.speaker === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-[16px] px-4 py-3 text-sm ${
                    m.speaker === 'user'
                      ? 'bg-[#d6612d] text-white'
                      : 'bg-[#f1eee9]'
                  }`}
                >
                  {m.message_text}
                </div>
              </div>
            ))
          )}

          {aiTyping && (
            <div className="flex justify-start">
              <div className="bg-[#f1eee9] px-4 py-3 rounded-[16px] text-sm">
                typing...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="mt-5 flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type what you would say..."
            disabled={sending || aiTyping}
            className="flex-1 rounded-full border border-[#d6cdc2] bg-white px-5 py-3 text-sm text-[#1f1f1c] shadow-sm focus:border-[#d6612d] focus:outline-none"
          />

          <button
            onClick={handleSend}
            disabled={sending || aiTyping}
            className="flex items-center justify-center rounded-full bg-[#d6612d] px-4 py-3 text-white shadow-md hover:opacity-95 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>

          <button className="flex items-center justify-center rounded-full border border-[#d6cdc2] bg-white px-4 py-3 shadow-sm hover:bg-[#faf7f3]">
            <Mic className="h-4 w-4 text-[#333]" />
          </button>
        </div>
      </div>
    </main>
  )
}