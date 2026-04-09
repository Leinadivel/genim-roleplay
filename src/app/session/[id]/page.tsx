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

  const [sessionMeta, setSessionMeta] = useState<{
    selected_industry: string | null
    selected_roleplay_type: string | null
    selected_buyer_mood: string | null
  } | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  // Load messages + session meta
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // messages
        const msgRes = await fetch(
          `/api/roleplay/messages?sessionId=${sessionId}`
        )
        const msgData = await msgRes.json()

        if (msgRes.ok) {
          setMessages(msgData.messages || [])
        }

        // session meta
        const sessionRes = await fetch(
          `/api/roleplay/session?sessionId=${sessionId}`
        )
        const sessionData = await sessionRes.json()

        if (sessionRes.ok) {
          setSessionMeta({
            selected_industry:
              sessionData.session?.selected_industry ?? null,
            selected_roleplay_type:
              sessionData.session?.selected_roleplay_type ?? null,
            selected_buyer_mood:
              sessionData.session?.selected_buyer_mood ?? null,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sessionId])

  async function handleSend() {
    if (!input.trim() || sending) return

    try {
      setSending(true)

      // save user message
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

      // AI response
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
    if (confirm('Exit this session?')) {
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
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <button
            onClick={handleExit}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white"
          >
            <X className="h-4 w-4" />
            Exit
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
          <p className="text-sm text-[#666]">
            Speak naturally. The buyer will respond.
          </p>
        </div>

        {/* SESSION CONTEXT */}
        {sessionMeta && (
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-white px-4 py-3">
              <div className="text-xs text-[#777]">Industry</div>
              <div className="text-sm font-semibold">
                {sessionMeta.selected_industry || '—'}
              </div>
            </div>

            <div className="rounded-xl border bg-white px-4 py-3">
              <div className="text-xs text-[#777]">Call Type</div>
              <div className="text-sm font-semibold">
                {sessionMeta.selected_roleplay_type || '—'}
              </div>
            </div>

            <div className="rounded-xl border bg-white px-4 py-3">
              <div className="text-xs text-[#777]">Buyer Mood</div>
              <div className="text-sm font-semibold capitalize">
                {(sessionMeta.selected_buyer_mood || '—').replace(
                  '_',
                  ' '
                )}
              </div>
            </div>
          </div>
        )}

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
            className="flex-1 rounded-full border border-[#d6cdc2] bg-white px-5 py-3 text-sm shadow-sm focus:border-[#d6612d] focus:outline-none"
          />

          <button
            onClick={handleSend}
            disabled={sending || aiTyping}
            className="flex items-center justify-center rounded-full bg-[#d6612d] px-4 py-3 text-white shadow-md"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>

          <button className="flex items-center justify-center rounded-full border border-[#d6cdc2] bg-white px-4 py-3 shadow-sm">
            <Mic className="h-4 w-4 text-[#333]" />
          </button>
        </div>
      </div>
    </main>
  )
}