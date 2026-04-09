'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mic,
  Send,
  Square,
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
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [evaluating, setEvaluating] = useState(false)

  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true)

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
    if (!input.trim()) return

    try {
      setSending(true)

      const saveRes = await fetch('/api/roleplay/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messageText: input,
        }),
      })

      const saveData = await saveRes.json()

      if (!saveRes.ok) {
        throw new Error(saveData.error || 'Failed to send')
      }

      const userMessage = saveData.message
      setMessages((prev) => [...prev, userMessage])
      setInput('')

      const aiRes = await fetch('/api/roleplay/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const aiData = await aiRes.json()

      if (aiRes.ok && aiData.message) {
        setMessages((prev) => [...prev, aiData.message])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  async function handleComplete() {
    try {
      setCompleting(true)

      await fetch('/api/roleplay/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } finally {
      setCompleting(false)
    }
  }

  async function handleEvaluate() {
    try {
      setEvaluating(true)

      await fetch('/api/roleplay/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      alert('Evaluation complete (connect UI next)')
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      {/* HEADER */}
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
          <Link
            href="/scenarios"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="text-sm text-[#666]">
            Session ID: {sessionId.slice(0, 8)}...
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-[900px] px-6 py-10">
        {/* TITLE */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">
            Roleplay Session
          </h1>
          <p className="text-[#666]">
            Speak naturally. The AI buyer will respond.
          </p>
        </div>

        {/* CHAT */}
        <div className="rounded-[20px] border bg-white p-6 space-y-4 min-h-[400px]">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading messages...
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
                  m.speaker === 'user' ? 'justify-end' : 'justify-start'
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
        </div>

        {/* INPUT */}
        <div className="mt-6 flex gap-3">
          <input
            className="flex-1 rounded-full border px-4 py-3 text-sm"
            placeholder="Say something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={handleSend}
            disabled={sending}
            className="rounded-full bg-[#d6612d] px-5 py-3 text-white text-sm"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send />}
          </button>

          <button className="rounded-full border px-4 py-3">
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="rounded-full border px-6 py-3 text-sm"
          >
            {completing ? 'Completing...' : 'Complete session'}
          </button>

          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="rounded-full bg-[#1f4d38] px-6 py-3 text-sm text-white"
          >
            {evaluating ? 'Evaluating...' : 'Evaluate'}
          </button>
        </div>
      </div>
    </main>
  )
}