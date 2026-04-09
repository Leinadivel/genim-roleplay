'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Mic,
  Send,
  Square,
  X,
} from 'lucide-react'

type ChatMessage = {
  id: string
  speaker: 'user' | 'assistant' | 'system'
  message_text: string
}

type SessionMeta = {
  selected_industry: string | null
  selected_roleplay_type: string | null
  selected_buyer_mood: string | null
}

type SessionRouteResponse = {
  session?: SessionMeta
  error?: string
}

type MessagesRouteResponse = {
  messages?: ChatMessage[]
  error?: string
}

type MessageRouteResponse = {
  message?: ChatMessage
  error?: string
}

type CompleteRouteResponse = {
  ok?: boolean
  error?: string
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [msgRes, sessionRes] = await Promise.all([
          fetch(`/api/roleplay/messages?sessionId=${sessionId}`),
          fetch(`/api/roleplay/session?sessionId=${sessionId}`),
        ])

        const msgData = (await msgRes.json()) as MessagesRouteResponse
        const sessionData = (await sessionRes.json()) as SessionRouteResponse

        if (!msgRes.ok) {
          throw new Error(msgData.error || 'Failed to load messages')
        }

        if (!sessionRes.ok) {
          throw new Error(sessionData.error || 'Failed to load session')
        }

        setMessages(msgData.messages ?? [])
        setSessionMeta(sessionData.session ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sessionId])

  async function handleSend() {
    const messageText = input.trim()
    if (!messageText || sending || aiTyping) return

    try {
      setSending(true)
      setError(null)

      const saveRes = await fetch('/api/roleplay/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageText }),
      })

      const saveData = (await saveRes.json()) as MessageRouteResponse

      if (!saveRes.ok || !saveData.message) {
        throw new Error(saveData.error || 'Failed to save message')
      }

      const savedMessage = saveData.message

      if (!savedMessage) {
        throw new Error(saveData.error || 'Failed to save message')
      }

      setMessages((prev) => [...prev, savedMessage])
      setInput('')
      setAiTyping(true)

      const aiRes = await fetch('/api/roleplay/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const aiData = (await aiRes.json()) as MessageRouteResponse

      if (!aiRes.ok || !aiData.message) {
        throw new Error(aiData.error || 'Failed to get buyer response')
      }

      const buyerMessage = aiData.message

      if (!buyerMessage) {
        throw new Error(aiData.error || 'Failed to get buyer response')
      }

      setMessages((prev) => [...prev, buyerMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setAiTyping(false)
      setSending(false)
    }
  }

  async function handleCompleteSession() {
    try {
      setCompleting(true)
      setError(null)

      const res = await fetch('/api/roleplay/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = (await res.json()) as CompleteRouteResponse

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete session')
      }

      router.push('/scenarios')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to complete session'
      )
    } finally {
      setCompleting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleCancelRoleplay() {
    const confirmed = window.confirm(
      'Cancel this roleplay and go back to scenarios?'
    )
    if (confirmed) {
      router.push('/scenarios')
    }
  }

  const moodLabel = useMemo(() => {
    if (!sessionMeta?.selected_buyer_mood) return '—'
    return sessionMeta.selected_buyer_mood.replace('_', ' ')
  }, [sessionMeta])

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[980px] items-center justify-between px-6 py-5">
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to scenarios
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelRoleplay}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <X className="h-4 w-4" />
              Cancel roleplay
            </button>

            <button
              type="button"
              onClick={handleCompleteSession}
              disabled={completing}
              className="inline-flex items-center gap-2 rounded-full bg-[#1f4d38] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              {completing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              End session
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[980px] px-6 py-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            Live roleplay
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#171714]">
            AI Sales Roleplay Session
          </h1>
          <p className="mt-2 text-sm leading-7 text-[#5f625d]">
            Speak naturally, handle objections, and practise your flow.
          </p>
        </div>

        {sessionMeta ? (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#e8ded3] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Industry
              </div>
              <div className="mt-2 text-base font-semibold text-[#1b1b18]">
                {sessionMeta.selected_industry || '—'}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e8ded3] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Roleplay type
              </div>
              <div className="mt-2 text-base font-semibold text-[#1b1b18]">
                {sessionMeta.selected_roleplay_type || '—'}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e8ded3] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,25,20,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Buyer mood
              </div>
              <div className="mt-2 text-base font-semibold capitalize text-[#1b1b18]">
                {moodLabel}
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-[18px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-[28px] border border-[#e8ded3] bg-white p-5 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#181815]">
                Conversation
              </h2>
              <p className="text-sm text-[#666864]">
                The buyer responds based on your setup.
              </p>
            </div>

            <div className="rounded-full bg-[#f7f3ee] px-3 py-1 text-xs font-medium text-[#5f625d]">
              {messages.length} messages
            </div>
          </div>

          <div className="min-h-[420px] max-h-[520px] overflow-y-auto rounded-[20px] border border-[#efe6dc] bg-[#fcfaf8] p-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#666864]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#ddd4ca] bg-white px-4 py-4 text-sm text-[#666864]">
                Start the roleplay by sending your first message.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.speaker === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-[18px] px-4 py-3 text-sm leading-7 shadow-sm ${
                        message.speaker === 'user'
                          ? 'bg-[#d6612d] text-white'
                          : 'border border-[#ece4da] bg-white text-[#232320]'
                      }`}
                    >
                      {message.message_text}
                    </div>
                  </div>
                ))}

                {aiTyping ? (
                  <div className="flex justify-start">
                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3 text-sm text-[#555854] shadow-sm">
                      Buyer is typing...
                    </div>
                  </div>
                ) : null}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type what the seller would say..."
              disabled={sending || aiTyping}
              className="flex-1 rounded-full border border-[#d6cdc2] bg-white px-5 py-3 text-sm text-[#1f1f1c] shadow-sm placeholder:text-[#8d908a] focus:border-[#d6612d] focus:outline-none"
            />

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-[#d6cdc2] bg-white px-4 py-3 text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
            >
              <Mic className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || aiTyping || !input.trim()}
              className="inline-flex items-center justify-center rounded-full bg-[#d6612d] px-4 py-3 text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}