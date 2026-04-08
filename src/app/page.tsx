'use client'

import { useEffect, useMemo, useState } from 'react'

type Scenario = {
  id: string
  slug: string
  title: string
  description: string | null
  industry: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  objective: string | null
}

type ChatMessage = {
  id: string
  speaker: 'user' | 'assistant' | 'system'
  message_text: string
  turn_index: number
}

type StartSessionResponse = {
  ok?: boolean
  error?: string
  session?: {
    id: string
    status: string
    mode: 'voice' | 'text'
  }
  scenarioBundle?: {
    scenario: Scenario
  }
}

type SaveMessageResponse = {
  ok?: boolean
  error?: string
  message?: ChatMessage
}

type BuyerResponse = {
  ok?: boolean
  error?: string
  message?: ChatMessage
}

export default function HomePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [startingScenarioId, setStartingScenarioId] = useState<string | null>(
    null
  )
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadScenarios() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/scenarios', {
          method: 'GET',
        })

        const data = (await response.json()) as {
          error?: string
          scenarios?: Scenario[]
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load scenarios')
        }

        if (!cancelled) {
          setScenarios(data.scenarios ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unexpected error loading scenarios'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadScenarios()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleStartSession(scenario: Scenario) {
    try {
      setStartingScenarioId(scenario.id)
      setError(null)
      setSessionId(null)
      setActiveScenario(null)
      setMessages([])
      setInput('')

      const response = await fetch('/api/roleplay/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: scenario.id,
          mode: 'voice',
        }),
      })

      const data = (await response.json()) as StartSessionResponse

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start session')
      }

      if (!data.session?.id) {
        throw new Error('Session started but no session id was returned')
      }

      setSessionId(data.session.id)
      setActiveScenario(data.scenarioBundle?.scenario ?? scenario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error starting session')
    } finally {
      setStartingScenarioId(null)
    }
  }

  async function handleSendMessage() {
    if (!sessionId) {
      setError('Start a session first')
      return
    }

    const messageText = input.trim()

    if (!messageText) {
      return
    }

    try {
      setSending(true)
      setError(null)

      const saveResponse = await fetch('/api/roleplay/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messageText,
        }),
      })

      const saveData = (await saveResponse.json()) as SaveMessageResponse

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Failed to save learner message')
      }

      const savedMessage = saveData.message

      if (!savedMessage) {
        throw new Error('Learner message was not returned')
      }

      setMessages((prev) => [...prev, savedMessage])
      setInput('')

      const respondResponse = await fetch('/api/roleplay/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
        }),
      })

      const respondData = (await respondResponse.json()) as BuyerResponse

      if (!respondResponse.ok) {
        throw new Error(respondData.error || 'Failed to generate buyer reply')
      }

      const buyerMessage = respondData.message

      if (!buyerMessage) {
        throw new Error('Buyer reply was not returned')
      }

      setMessages((prev) => [...prev, buyerMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error sending message')
    } finally {
      setSending(false)
    }
  }

  const sessionStarted = useMemo(() => Boolean(sessionId), [sessionId])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Genim Voice Roleplay</h1>
      <p className="mt-2 text-sm text-gray-600">
        Structure-first build. UI polish later.
      </p>

      {error ? (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {sessionStarted ? (
        <div className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          Session started successfully: <span className="font-medium">{sessionId}</span>
        </div>
      ) : null}

      {!sessionStarted ? (
        <div className="mt-6">
          {loading ? (
            <div className="rounded border p-4 text-sm text-gray-600">
              Loading scenarios...
            </div>
          ) : scenarios.length === 0 ? (
            <div className="rounded border p-4 text-sm text-gray-600">
              No scenarios found.
            </div>
          ) : (
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="rounded border p-4">
                  <h2 className="text-lg font-medium">{scenario.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {scenario.description ?? 'No description'}
                  </p>

                  <div className="mt-2 text-xs text-gray-500">
                    <span>Industry: {scenario.industry ?? 'N/A'}</span>
                    <span className="ml-4">Difficulty: {scenario.difficulty}</span>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleStartSession(scenario)}
                      disabled={startingScenarioId === scenario.id}
                      className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      {startingScenarioId === scenario.id
                        ? 'Starting session...'
                        : 'Start voice session'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded border p-4">
            <h2 className="text-lg font-medium">
              {activeScenario?.title ?? 'Active session'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {activeScenario?.description ?? 'Roleplay in progress'}
            </p>
          </div>

          <div className="rounded border p-4">
            <h3 className="text-sm font-medium">Conversation</h3>

            <div className="mt-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No messages yet. Send the first learner message.
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="rounded border p-3">
                    <div className="text-xs font-medium uppercase text-gray-500">
                      {message.speaker === 'user'
                        ? 'Learner'
                        : message.speaker === 'assistant'
                        ? 'Buyer'
                        : 'System'}
                    </div>
                    <div className="mt-1 text-sm">{message.message_text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded border p-4">
            <label className="block text-sm font-medium">
              Learner message
            </label>
            <textarea
              className="mt-2 min-h-[120px] w-full rounded border px-3 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type what the learner would say..."
              disabled={sending}
            />

            <div className="mt-3">
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending || !input.trim()}
                className="rounded border px-4 py-2 text-sm disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}