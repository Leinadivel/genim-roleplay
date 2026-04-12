export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type SessionMode = 'voice' | 'text'

export type SessionStatus =
  | 'draft'
  | 'live'
  | 'completed'
  | 'evaluated'
  | 'failed'

export type MessageSpeaker = 'user' | 'assistant' | 'system'

export type BuyerMood = 'nice' | 'less_rude' | 'rude'

export type IndustryOption =
  | 'SaaS'
  | 'Pharma'
  | 'Recruitment'
  | 'Healthcare'
  | 'Insurance'
  | 'Manufacturing'
  | 'FMCG'
  | 'Financial Services'
  | 'Real Estate'
  | 'Logistics'
  | 'EdTech'
  | 'Telecom'

export type RoleplayTypeOption =
  | 'Cold Call'
  | 'Warm Call'
  | 'Discovery Call'
  | 'Demo Call'
  | 'Upsell Call'
  | 'Cross-sell Call'
  | 'Renewal Call'
  | 'Pricing Negotiation Call'
  | 'Objection Handling Call'
  | 'Closing Call'
  | 'Manager Coaching Call'

export type BuyerRoleOption =
  | 'CEO / Founder'
  | 'Head of Sales'
  | 'VP of Sales'
  | 'Sales Manager'
  | 'Head of Marketing'
  | 'CTO'
  | 'Head of Product'
  | 'COO'
  | 'Finance Lead'

export type RubricCategoryKey =
  | 'opening_rapport'
  | 'discovery_questions'
  | 'active_listening'
  | 'value_communication'
  | 'objection_handling'
  | 'confidence_clarity'
  | 'closing_next_step'

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  'SaaS',
  'Pharma',
  'Recruitment',
  'Healthcare',
  'Insurance',
  'Manufacturing',
  'FMCG',
  'Financial Services',
  'Real Estate',
  'Logistics',
  'EdTech',
  'Telecom',
]

export const ROLEPLAY_TYPE_OPTIONS: RoleplayTypeOption[] = [
  'Cold Call',
  'Warm Call',
  'Discovery Call',
  'Demo Call',
  'Upsell Call',
  'Cross-sell Call',
  'Renewal Call',
  'Pricing Negotiation Call',
  'Objection Handling Call',
  'Closing Call',
  'Manager Coaching Call',
]

export const BUYER_ROLE_OPTIONS: BuyerRoleOption[] = [
  'CEO / Founder',
  'Head of Sales',
  'VP of Sales',
  'Sales Manager',
  'Head of Marketing',
  'CTO',
  'Head of Product',
  'COO',
  'Finance Lead',
]

export const BUYER_MOOD_OPTIONS: Array<{
  value: BuyerMood
  label: string
  description: string
}> = [
  {
    value: 'nice',
    label: 'Nice',
    description: 'Friendly, open, and easier to engage.',
  },
  {
    value: 'less_rude',
    label: 'Less rude',
    description: 'A bit guarded, less patient, and mildly difficult.',
  },
  {
    value: 'rude',
    label: 'Rude',
    description: 'Sharp, dismissive, and harder to win over.',
  },
]

export type ScenarioListItem = {
  id: string
  slug: string
  title: string
  description: string | null
  industry: string | null
  difficulty: ScenarioDifficulty
  objective: string | null
}

export type BuyerPersona = {
  id: string
  scenario_id: string
  name: string
  title: string | null
  company_name: string | null
  company_size: string | null
  tone: string | null
  background: string | null
  hidden_pain_points: string[]
  common_objections: string[]
  goals: string[]
  constraints: string[]
}

export type RubricItem = {
  id: string
  rubric_id: string
  category_key: RubricCategoryKey | string
  category_label: string
  max_score: number
  weight: number
  sort_order: number
  guidance: string | null
}

export type ScenarioBundle = {
  scenario: ScenarioListItem
  buyerPersona: BuyerPersona | null
  rubricId: string | null
  rubricItems: RubricItem[]
}

export type SessionMessage = {
  id: string
  session_id: string
  speaker: MessageSpeaker
  message_text: string
  turn_index: number
  started_at: string | null
  ended_at: string | null
  audio_url: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type SessionScore = {
  id: string
  session_id: string
  rubric_item_id: string | null
  category_key: string
  category_label: string
  score: number
  max_score: number
  feedback: string | null
  evidence: string[]
  created_at: string
}

export type RoleplaySession = {
  id: string
  user_id: string
  scenario_id: string
  buyer_persona_id: string | null
  rubric_id: string | null
  mode: SessionMode
  status: SessionStatus
  started_at: string | null
  ended_at: string | null
  duration_seconds: number | null
  transcript_text: string | null
  summary: string | null
  overall_score: number | null
  strengths: string[]
  improvements: string[]
  selected_industry: string | null
  selected_roleplay_type: string | null
  selected_buyer_mood: BuyerMood | null
  selected_buyer_role: string | null
  created_at: string
  updated_at: string
}

export type StartSessionInput = {
  scenarioId: string
  mode?: SessionMode
  selectedIndustry?: string | null
  selectedRoleplayType?: string | null
  selectedBuyerMood?: BuyerMood | null
  selectedBuyerRole?: string | null
}

export type StartSessionResult = {
  session: RoleplaySession
  scenarioBundle: ScenarioBundle
}

export type AppendMessageInput = {
  sessionId: string
  speaker: MessageSpeaker
  messageText: string
  turnIndex: number
  startedAt?: string | null
  endedAt?: string | null
  audioUrl?: string | null
  metadata?: Record<string, unknown>
}

export type CompleteSessionInput = {
  sessionId: string
  transcriptText: string
  endedAt?: string
  durationSeconds?: number | null
}

export type EvaluationCategoryResult = {
  category_key: string
  category_label: string
  score: number
  max_score: number
  feedback: string
  evidence: string[]
}

export type EvaluationResult = {
  overallScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  categories: EvaluationCategoryResult[]
}