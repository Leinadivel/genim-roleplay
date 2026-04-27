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
  | 'Head of Company'
  | 'VP of Strategy / VP of Business'
  | 'Director of Business Operations'
  | 'Business Operations Manager'
  | 'Chief Sales Officer'
  | 'Head of Sales'
  | 'VP of Sales'
  | 'Director of Sales'
  | 'Sales Manager'
  | 'Chief Technology Officer'
  | 'Head of Engineering'
  | 'VP of Engineering'
  | 'Director of Engineering'
  | 'Engineering Manager'
  | 'Chief Revenue Officer'
  | 'Head of Revenue / Head of Growth'
  | 'VP of Revenue / VP of Growth'
  | 'Director of Revenue Operations'
  | 'Revenue Operations Manager'
  | 'Chief Product Officer'
  | 'Head of Product'
  | 'VP of Product'
  | 'Director of Product'
  | 'Product Manager'
  | 'Chief Operations Officer'
  | 'Head of Operations'
  | 'VP of Operations'
  | 'Director of Operations'
  | 'Operations Manager'
  | 'Chief Marketing Officer'
  | 'Head of Marketing'
  | 'VP of Marketing'
  | 'Director of Marketing'
  | 'Marketing Manager'
  | 'Chief Legal Officer'
  | 'Head of Legal'
  | 'VP of Legal'
  | 'Director of Legal'
  | 'Legal Manager'
  | 'Chief Finance Officer'
  | 'Head of Finance'
  | 'VP of Finance'
  | 'Director of Finance'
  | 'Finance Manager'
  | 'Finance Lead'
  | 'Chief Security Officer'
  | 'Head of Security'
  | 'VP of Security'
  | 'Director of Security'
  | 'Security Manager'
  | 'Chief People Officer / CHRO'
  | 'Head of People / Head of Talent'
  | 'VP of People / VP of Talent'
  | 'Director of HR / Talent'
  | 'HR / Talent Manager'
  | 'Chief Logistics Officer'
  | 'Head of Logistics / Supply Chain'
  | 'VP of Logistics / Supply Chain'
  | 'Director of Logistics'
  | 'Logistics Manager'
  | 'Chief Event Officer'
  | 'Head of Events'
  | 'VP of Events'
  | 'Director of Events'
  | 'Event Manager'
  | 'Chief Education Officer'
  | 'Head of Education / Learning'
  | 'VP of Education'
  | 'Director of Education'
  | 'Education Manager'
  | 'Chief Customer Officer'
  | 'Head of Customer Success'
  | 'VP of Customer Success'
  | 'Director of Customer Success'
  | 'Customer Success Manager'

export type DealSizeOption = '$3k' | '$10k' | '$50k' | '$100k' | '$250k'

export type PainLevelOption = 'low' | 'moderate' | 'high'

export type CompanyStageOption =
  | 'Seed'
  | 'Series A & B'
  | 'Series C & D'
  | 'Series E & F'
  | 'IPO'

export type TimePressureOption =
  | 'none'
  | '5_min'
  | '15_min'
  | '30_min'
  | 'rush'

export type RubricCategoryKey =
  | 'opening_rapport'
  | 'discovery_questions'
  | 'active_listening'
  | 'value_communication'
  | 'objection_handling'
  | 'confidence_clarity'
  | 'closing_next_step'

export const DEAL_SIZE_OPTIONS: DealSizeOption[] = [
  '$3k',
  '$10k',
  '$50k',
  '$100k',
  '$250k',
]

export const PAIN_LEVEL_OPTIONS: Array<{
  value: PainLevelOption
  label: string
}> = [
  { value: 'low', label: 'Low Pain (just exploring)' },
  { value: 'moderate', label: 'Moderate Pain (actively looking)' },
  { value: 'high', label: 'High Pain (needs solution now)' },
]

export const COMPANY_STAGE_OPTIONS: CompanyStageOption[] = [
  'Seed',
  'Series A & B',
  'Series C & D',
  'Series E & F',
  'IPO',
]

export const TIME_PRESSURE_OPTIONS: Array<{
  value: TimePressureOption
  label: string
}> = [
  { value: 'none', label: 'No time limit' },
  { value: '5_min', label: '5-minute quick call' },
  { value: '15_min', label: '15-minute structured call' },
  { value: '30_min', label: '30-minute structured call' },
  { value: 'rush', label: 'Prospect in a rush' },
]

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
  'Head of Company',
  'VP of Strategy / VP of Business',
  'Director of Business Operations',
  'Business Operations Manager',
  'Chief Sales Officer',
  'Head of Sales',
  'VP of Sales',
  'Director of Sales',
  'Sales Manager',
  'Chief Technology Officer',
  'Head of Engineering',
  'VP of Engineering',
  'Director of Engineering',
  'Engineering Manager',
  'Chief Revenue Officer',
  'Head of Revenue / Head of Growth',
  'VP of Revenue / VP of Growth',
  'Director of Revenue Operations',
  'Revenue Operations Manager',
  'Chief Product Officer',
  'Head of Product',
  'VP of Product',
  'Director of Product',
  'Product Manager',
  'Chief Operations Officer',
  'Head of Operations',
  'VP of Operations',
  'Director of Operations',
  'Operations Manager',
  'Chief Marketing Officer',
  'Head of Marketing',
  'VP of Marketing',
  'Director of Marketing',
  'Marketing Manager',
  'Chief Legal Officer',
  'Head of Legal',
  'VP of Legal',
  'Director of Legal',
  'Legal Manager',
  'Chief Finance Officer',
  'Head of Finance',
  'VP of Finance',
  'Director of Finance',
  'Finance Manager',
  'Finance Lead',
  'Chief Security Officer',
  'Head of Security',
  'VP of Security',
  'Director of Security',
  'Security Manager',
  'Chief People Officer / CHRO',
  'Head of People / Head of Talent',
  'VP of People / VP of Talent',
  'Director of HR / Talent',
  'HR / Talent Manager',
  'Chief Logistics Officer',
  'Head of Logistics / Supply Chain',
  'VP of Logistics / Supply Chain',
  'Director of Logistics',
  'Logistics Manager',
  'Chief Event Officer',
  'Head of Events',
  'VP of Events',
  'Director of Events',
  'Event Manager',
  'Chief Education Officer',
  'Head of Education / Learning',
  'VP of Education',
  'Director of Education',
  'Education Manager',
  'Chief Customer Officer',
  'Head of Customer Success',
  'VP of Customer Success',
  'Director of Customer Success',
  'Customer Success Manager',
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
  scenario_id: string | null
  name: string
  title: string | null
  company_name: string | null
  company_size: string | null
  avatar_url: string | null
  gender: 'male' | 'female' | null
  voice_id: string | null
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
  assignment_id: string | null
  candidate_assessment_id: string | null
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
  selected_deal_size: string | null
  selected_pain_level: string | null
  selected_company_stage: string | null
  selected_time_pressure: string | null
  created_at: string
  updated_at: string
}

export type StartSessionInput = {
  scenarioId: string
  mode?: SessionMode
  assignmentId?: string | null
  candidateAssessmentId?: string | null
  selectedIndustry?: string | null
  selectedRoleplayType?: string | null
  selectedBuyerMood?: BuyerMood | null
  selectedBuyerRole?: string | null
  selectedBuyerName?: string | null
  selectedBuyerCompany?: string | null
  selectedBuyerAvatar?: string | null
  selectedDealSize?: string | null
  selectedPainLevel?: string | null
  selectedCompanyStage?: string | null
  selectedTimePressure?: string | null
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