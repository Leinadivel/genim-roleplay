'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Mic,
  PhoneCall,
  Send,
  Square,
  Volume2,
  Waves,
  X,
} from 'lucide-react'

type ChatMessage = {
  id: string
  speaker: 'user' | 'assistant' | 'system'
  message_text: string
}

type BuyerPersonaMeta = {
  id: string
  name: string
  title: string | null
  company_name: string | null
  company_size: string | null
  avatar_url: string | null
}

type SessionMeta = {
  id: string
  selected_industry: string | null
  selected_roleplay_type: string | null
  selected_buyer_mood: string | null
  selected_buyer_role: string | null
  selected_deal_size: string | null
  selected_pain_level: string | null
  selected_company_stage: string | null
  selected_time_pressure: string | null
  should_ring_first: boolean
  buyer_persona: BuyerPersonaMeta | null
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

async function safeJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON but received ${contentType || 'unknown content type'}`
    )
  }

  return JSON.parse(text) as T
}

function formatPainLevel(value: string | null) {
  if (!value) return '—'
  if (value === 'low') return 'Low pain'
  if (value === 'moderate') return 'Moderate pain'
  if (value === 'high') return 'High pain'
  return value
}

function formatTimePressure(value: string | null) {
  if (!value) return '—'
  switch (value) {
    case 'none':
      return 'No time limit'
    case '5_min':
      return '5-minute quick call'
    case '15_min':
      return '15-minute structured call'
    case '30_min':
      return '30-minute structured call'
    case 'rush':
      return 'Prospect in a rush'
    default:
      return value
  }
}

function getTimeLimitSeconds(value: string | null) {
  switch (value) {
    case '5_min':
      return 5 * 60
    case '15_min':
      return 15 * 60
    case '30_min':
      return 30 * 60
    default:
      return null
  }
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'AI'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AI'
}

function VoiceWave({
  active,
  label,
  tone = 'green',
}: {
  active: boolean
  label: string
  tone?: 'green' | 'orange'
}) {
  const barColor = tone === 'green' ? 'bg-[#1f4d38]' : 'bg-[#d6612d]'

  return (
    <div className="rounded-[24px] border border-[#ece4da] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-[#1a1a17]">{label}</div>
        <div className="text-xs font-medium text-[#7d7f7a]">
          {active ? 'Active' : 'Idle'}
        </div>
      </div>

      <div className="flex h-20 items-center justify-center gap-1.5">
        {[24, 42, 64, 36, 58, 76, 44, 28, 52, 68, 38, 26].map(
          (height, index) => (
            <span
              key={index}
              className={`w-2 rounded-full ${barColor} ${
                active ? 'animate-pulse opacity-100' : 'opacity-25'
              }`}
              style={{
                height: active ? `${height}px` : `${Math.max(12, height / 3)}px`,
                animationDelay: `${index * 80}ms`,
              }}
            />
          )
        )}
      </div>
    </div>
  )
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
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null)
  const [callReady, setCallReady] = useState(false)
  const [isRinging, setIsRinging] = useState(false)

  const [isListening, setIsListening] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [speechBaseText, setSpeechBaseText] = useState('')
  const [speechTranscript, setSpeechTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ringAudioRef = useRef<HTMLAudioElement | null>(null)
  const ringStartedRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const speechBaseTextRef = useRef('')
  const speechTranscriptRef = useRef('')
  const autoSendAfterSpeechRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping, aiSpeaking])

  const timeLimitSeconds = useMemo(
    () => getTimeLimitSeconds(sessionMeta?.selected_time_pressure || null),
    [sessionMeta?.selected_time_pressure]
  )

  const remainingSeconds =
    timeLimitSeconds !== null
      ? Math.max(timeLimitSeconds - elapsedSeconds, 0)
      : null

  useEffect(() => {
    if (!callReady || isRinging || completing) return

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [callReady, isRinging, completing])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }

      if (ringAudioRef.current) {
        ringAudioRef.current.pause()
        ringAudioRef.current.src = ''
      }
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [msgRes, sessionRes] = await Promise.all([
          fetch(`/api/roleplay/messages?sessionId=${sessionId}`, {
            cache: 'no-store',
          }),
          fetch(`/api/roleplay/session?sessionId=${sessionId}`, {
            cache: 'no-store',
          }),
        ])

        const msgData = await safeJson<MessagesRouteResponse>(msgRes)
        const sessionData = await safeJson<SessionRouteResponse>(sessionRes)

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

    void loadData()
  }, [sessionId])

  useEffect(() => {
    async function startCallFlow() {
      if (!sessionMeta) return
      if (ringStartedRef.current) return

      ringStartedRef.current = true

      if (!sessionMeta.should_ring_first) {
        setCallReady(true)
        return
      }

      try {
        setIsRinging(true)

        const ringAudio = new Audio('/sounds/phone-ring.mp3')
        ringAudioRef.current = ringAudio
        ringAudio.volume = 0.85

        await ringAudio.play()

        window.setTimeout(() => {
          ringAudio.pause()
          ringAudio.currentTime = 0
          setIsRinging(false)
          setCallReady(true)
        }, 3200)
      } catch {
        setIsRinging(false)
        setCallReady(true)
      }
    }

    void startCallFlow()
  }, [sessionMeta])

  async function speakBuyerText(text: string) {
    try {
      setAiSpeaking(true)

      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
          const data = await safeJson<{ error?: string }>(response)
          throw new Error(data.error || 'Failed to generate buyer audio')
        }

        throw new Error('Failed to generate buyer audio')
      }

      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.pause()
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src)
        }
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Audio playback failed'))
        }

        audio.play().catch(reject)
      })
    } finally {
      setAiSpeaking(false)
    }
  }

  async function sendCurrentInput(textOverride?: string) {
    const messageText = (textOverride ?? input).trim()
    if (!messageText || sending || aiTyping || aiSpeaking || !callReady) return

    try {
      setSending(true)
      setError(null)

      const saveRes = await fetch('/api/roleplay/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageText }),
      })

      const saveData = await safeJson<MessageRouteResponse>(saveRes)

      if (!saveRes.ok) {
        throw new Error(saveData.error || 'Failed to save message')
      }

      const savedMessage = saveData.message

      if (!savedMessage) {
        throw new Error(saveData.error || 'Failed to save message')
      }

      setMessages((prev) => [...prev, savedMessage])
      setInput('')
      setSpeechBaseText('')
      setSpeechTranscript('')
      speechBaseTextRef.current = ''
      speechTranscriptRef.current = ''
      autoSendAfterSpeechRef.current = false
      setAiTyping(true)

      const aiRes = await fetch('/api/roleplay/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const aiData = await safeJson<MessageRouteResponse>(aiRes)

      if (!aiRes.ok) {
        throw new Error(aiData.error || 'Failed to get buyer response')
      }

      const buyerMessage = aiData.message

      if (!buyerMessage) {
        throw new Error(aiData.error || 'Failed to get buyer response')
      }

      setMessages((prev) => [...prev, buyerMessage])
      setAiTyping(false)

      await speakBuyerText(buyerMessage.message_text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setAiTyping(false)
      setSending(false)
    }
  }

  async function handleSend() {
    await sendCurrentInput()
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

      const data = await safeJson<CompleteRouteResponse>(res)

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete session')
      }

      router.push(`/session/${sessionId}/report`)
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
      void handleSend()
    }
  }

  function handleCancelRoleplay() {
    recognitionRef.current?.stop()

    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (ringAudioRef.current) {
      ringAudioRef.current.pause()
    }

    const confirmed = window.confirm(
      'Cancel this roleplay and go back to scenarios?'
    )

    if (confirmed) {
      router.push('/scenarios')
    }
  }

  function handleMicClick() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (aiTyping || aiSpeaking || sending || !callReady) return

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setError('Voice recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognitionAPI()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    ;(
      recognition as SpeechRecognition & { maxAlternatives?: number }
    ).maxAlternatives = 1

    recognition.onstart = () => {
      const base = input.trim()
      setIsListening(true)
      setError(null)
      setSpeechBaseText(base)
      setSpeechTranscript('')
      speechBaseTextRef.current = base
      speechTranscriptRef.current = ''
      autoSendAfterSpeechRef.current = true
    }

    recognition.onend = () => {
      setIsListening(false)

      const finalInput = [
        speechBaseTextRef.current,
        speechTranscriptRef.current,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      if (
        autoSendAfterSpeechRef.current &&
        finalInput &&
        !sending &&
        !aiTyping &&
        !aiSpeaking
      ) {
        autoSendAfterSpeechRef.current = false
        void sendCurrentInput(finalInput)
      } else {
        autoSendAfterSpeechRef.current = false
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event.message)

      if (event.error === 'not-allowed') {
        setError(
          'Microphone permission was denied. Please allow microphone access in your browser settings.'
        )
      } else if (event.error === 'no-speech') {
        setError('No speech was detected. Please try again and speak clearly.')
      } else if (event.error === 'audio-capture') {
        setError(
          'No microphone was found. Please check your audio input device.'
        )
      } else {
        setError(`Voice recognition failed: ${event.error}`)
      }

      autoSendAfterSpeechRef.current = false
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += chunk
        } else {
          interimTranscript += chunk
        }
      }

      const committedTranscript = `${speechTranscriptRef.current}${finalTranscript}`.trim()
      const visibleTranscript = `${committedTranscript} ${interimTranscript}`.trim()
      const nextValue = [speechBaseTextRef.current, visibleTranscript]
        .filter(Boolean)
        .join(' ')
        .trim()

      speechTranscriptRef.current = committedTranscript
      setSpeechTranscript(committedTranscript)
      setInput(nextValue)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const moodLabel = useMemo(() => {
    if (!sessionMeta?.selected_buyer_mood) return '—'
    return sessionMeta.selected_buyer_mood.replace('_', ' ')
  }, [sessionMeta])

  const micDisabled = sending || aiTyping || aiSpeaking || !callReady
  const sendDisabled =
    sending || aiTyping || aiSpeaking || !input.trim() || !callReady

  const personaInitials = useMemo(
    () => getInitials(sessionMeta?.buyer_persona?.name),
    [sessionMeta]
  )

  return (
  <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
    <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-8">
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

    <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-8">
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

      {error ? (
        <div className="mb-6 rounded-[18px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.4fr_0.6fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-[#e8ded3] bg-white shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
            <div className="bg-[linear-gradient(135deg,#f7ede6_0%,#eef5f0_100%)] px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#1f4d38] shadow-[0_12px_24px_rgba(25,25,20,0.08)]">
                  {sessionMeta?.buyer_persona?.avatar_url ? (
                    <img
                      src={sessionMeta.buyer_persona.avatar_url}
                      alt={sessionMeta.buyer_persona.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  {!sessionMeta?.buyer_persona?.avatar_url ? (
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
                      {personaInitials}
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    AI buyer persona
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#181815]">
                    {sessionMeta?.buyer_persona?.name || 'Buyer persona'}
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#454844]">
                    {sessionMeta?.buyer_persona?.title ||
                      sessionMeta?.selected_buyer_role ||
                      'Buyer'}
                  </div>
                  <div className="mt-1 text-sm text-[#666864]">
                    {sessionMeta?.buyer_persona?.company_name || '—'}
                  </div>
                  {sessionMeta?.buyer_persona?.company_size ? (
                    <div className="mt-1 text-sm text-[#666864]">
                      {sessionMeta.buyer_persona.company_size}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {isRinging ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ecd7cb] bg-white/80 px-4 py-2 text-sm font-medium text-[#a2542f]">
                    <PhoneCall className="h-4 w-4" />
                    Ringing...
                  </div>
                ) : callReady ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6dc] bg-white/80 px-4 py-2 text-sm font-medium text-[#1f4d38]">
                    <span className="h-2 w-2 rounded-full bg-[#79c26d]" />
                    Call connected
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e5d7cf] bg-white/80 px-4 py-2 text-sm font-medium text-[#6b6d68]">
                    Preparing call...
                  </div>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-[18px] border border-[#ece4da] bg-[#faf8f5] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                  Suggested opener
                </div>
                <div className="mt-2 text-sm leading-7 text-[#4f514d]">
                  {sessionMeta?.buyer_persona?.name
                    ? `Try: "Hi ${sessionMeta.buyer_persona.name}, thanks for taking the time today."`
                    : 'Open with a confident introduction and a clear reason for the conversation.'}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Industry
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {sessionMeta?.selected_industry || '—'}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Buyer mood
                  </div>
                  <div className="mt-1.5 text-sm font-semibold capitalize text-[#1b1b18]">
                    {moodLabel}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Buyer role
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {sessionMeta?.selected_buyer_role || '—'}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Roleplay type
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {sessionMeta?.selected_roleplay_type || '—'}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Deal size
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {sessionMeta?.selected_deal_size || '—'}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Pain level
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {formatPainLevel(sessionMeta?.selected_pain_level || null)}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Company stage
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {sessionMeta?.selected_company_stage || '—'}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#ece4da] bg-white px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    Time pressure
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                    {formatTimePressure(sessionMeta?.selected_time_pressure || null)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-[28px] border border-[#e8ded3] bg-white p-5 shadow-[0_14px_40px_rgba(25,25,20,0.05)]">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#181815]">
                Voice roleplay
              </h2>
              <p className="text-sm text-[#666864]">
                Speak naturally. Genim stores the transcript in the background.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-[#f7f3ee] px-3 py-1 text-xs font-medium text-[#5f625d]">
                {remainingSeconds !== null
                  ? `Time left: ${formatTimer(remainingSeconds)}`
                  : `Elapsed: ${formatTimer(elapsedSeconds)}`}
              </div>

              {aiSpeaking ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-medium text-[#1f4d38]">
                  <Volume2 className="h-3.5 w-3.5" />
                  Buyer speaking
                </div>
              ) : null}

              {isListening ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <Mic className="h-3.5 w-3.5" />
                  Listening
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#efe6dc] bg-[#fcfaf8] p-5">
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-[#666864]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading call...
              </div>
            ) : isRinging ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="rounded-[22px] border border-[#eadfd4] bg-white px-8 py-8 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3ed] text-[#d6612d]">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-[#181815]">
                    Ringing {sessionMeta?.buyer_persona?.name || 'buyer'}...
                  </div>
                  <div className="mt-2 text-sm text-[#666864]">
                    Joining the call now.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <VoiceWave
                    active={isListening}
                    label="You"
                    tone="orange"
                  />

                  <VoiceWave
                    active={aiTyping || aiSpeaking}
                    label={sessionMeta?.buyer_persona?.name || 'AI buyer'}
                    tone="green"
                  />
                </div>

                <div className="rounded-[24px] border border-[#ece4da] bg-white p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7ede6] text-[#d6612d]">
                    <Waves className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-2xl font-semibold text-[#181815]">
                    {callReady ? 'Call is live' : 'Preparing call'}
                  </h3>

                  <p className="mx-auto mt-2 max-w-[520px] text-sm leading-7 text-[#666864]">
                    Tap the microphone, speak your response, and Genim will send it to
                    the AI buyer. The buyer replies with voice while your transcript is
                    saved for the final report.
                  </p>

                  {input ? (
                    <div className="mt-5 rounded-[18px] border border-[#ece4da] bg-[#faf8f5] px-4 py-3 text-left text-sm leading-7 text-[#4f514d]">
                      {input}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={micDisabled && !isListening}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${
                      isListening
                        ? 'bg-red-500 text-white'
                        : 'bg-[#d6612d] text-white hover:opacity-95'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    {isListening ? 'Stop listening' : 'Speak'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTranscript((current) => !current)}
                    className="inline-flex items-center justify-center rounded-full border border-[#d8d1c8] bg-white px-6 py-4 text-sm font-semibold text-[#2b2c2a]"
                  >
                    {showTranscript ? 'Hide transcript' : 'Show transcript'}
                  </button>
                </div>

                {showTranscript ? (
                  <div className="max-h-[320px] overflow-y-auto rounded-[20px] border border-[#efe6dc] bg-white p-4">
                    {messages.length === 0 ? (
                      <div className="text-sm text-[#666864]">
                        No transcript yet.
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
                              className={`max-w-[80%] rounded-[18px] px-4 py-3 text-sm leading-7 shadow-sm ${
                                message.speaker === 'user'
                                  ? 'bg-[#d6612d] text-white'
                                  : 'border border-[#ece4da] bg-[#faf8f5] text-[#232320]'
                              }`}
                            >
                              {message.message_text}
                            </div>
                          </div>
                        ))}

                        <div ref={bottomRef} />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  </main>
)
}