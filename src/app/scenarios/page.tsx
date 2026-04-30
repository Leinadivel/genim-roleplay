'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import AssignedRoleplays from './assigned-roleplays'
import DashboardLink from './dashboard-link'
import CurrentPlanCard from './current-plan-card'
import {
  AlertTriangle,
  ArrowRight,
  AudioWaveform,
  Brain,
  Building2,
  Clock3,
  DollarSign,
  Headphones,
  LogOut,
  Mic,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react'
import {
  BUYER_MOOD_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLEPLAY_TYPE_OPTIONS,
  DEAL_SIZE_OPTIONS,
  PAIN_LEVEL_OPTIONS,
  COMPANY_STAGE_OPTIONS,
  TIME_PRESSURE_OPTIONS,
  type BuyerMood,
} from '@/types/roleplay'

type Scenario = {
  id: string
  slug: string
  title: string
  description: string | null
  industry: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  objective: string | null
}

type BuyerRoleCategory = {
  title: string
  roles: string[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'cold-call-not-interested',
    slug: 'cold-call-not-interested',
    title: 'Cold Call',
    description: 'Handle an impatient buyer who wants to end the call quickly.',
    industry: 'B2B Sales',
    difficulty: 'beginner',
    objective: 'Keep the buyer engaged and earn a next step.',
  },
  {
    id: 'discovery-surface-pain',
    slug: 'discovery-surface-pain',
    title: 'Discovery',
    description: 'Ask stronger questions to uncover the real business problem.',
    industry: 'B2B Sales',
    difficulty: 'intermediate',
    objective: 'Identify pain, urgency, impact, and current gaps.',
  },
  {
    id: 'objection-too-expensive',
    slug: 'objection-too-expensive',
    title: 'Pricing Objection',
    description: 'Handle pricing pushback without sounding defensive.',
    industry: 'B2B Sales',
    difficulty: 'intermediate',
    objective: 'Defend value and keep the deal moving.',
  },
  {
    id: 'demo-weak-engagement',
    slug: 'demo-weak-engagement',
    title: 'Demo Call',
    description: 'Re-engage a distracted prospect during a product conversation.',
    industry: 'B2B Sales',
    difficulty: 'advanced',
    objective: 'Make the conversation relevant and regain attention.',
  },
  {
    id: 'closing-hesitation',
    slug: 'closing-hesitation',
    title: 'Closing',
    description: 'Handle a buyer who is interested but keeps delaying.',
    industry: 'B2B Sales',
    difficulty: 'advanced',
    objective: 'Reduce hesitation and secure a clear next step.',
  },
]

const BUYER_ROLE_CATEGORIES: BuyerRoleCategory[] = [
  {
    title: 'Executive Leadership',
    roles: [
      'CEO / Founder',
      'Head of Company',
      'VP of Strategy / VP of Business',
      'Director of Business Operations',
      'Business Operations Manager',
    ],
  },
  {
    title: 'Sales Leadership',
    roles: [
      'Chief Sales Officer',
      'Head of Sales',
      'VP of Sales',
      'Director of Sales',
      'Sales Manager',
    ],
  },
  {
    title: 'Technology Leadership',
    roles: [
      'Chief Technology Officer',
      'Head of Engineering',
      'VP of Engineering',
      'Director of Engineering',
      'Engineering Manager',
    ],
  },
  {
    title: 'Revenue Leadership',
    roles: [
      'Chief Revenue Officer',
      'Head of Revenue / Head of Growth',
      'VP of Revenue / VP of Growth',
      'Director of Revenue Operations',
      'Revenue Operations Manager',
    ],
  },
  {
    title: 'Product Leadership',
    roles: [
      'Chief Product Officer',
      'Head of Product',
      'VP of Product',
      'Director of Product',
      'Product Manager',
    ],
  },
  {
    title: 'Operations Leadership',
    roles: [
      'Chief Operations Officer',
      'Head of Operations',
      'VP of Operations',
      'Director of Operations',
      'Operations Manager',
    ],
  },
  {
    title: 'Marketing Leadership',
    roles: [
      'Chief Marketing Officer',
      'Head of Marketing',
      'VP of Marketing',
      'Director of Marketing',
      'Marketing Manager',
    ],
  },
  {
    title: 'Legal Leadership',
    roles: [
      'Chief Legal Officer',
      'Head of Legal',
      'VP of Legal',
      'Director of Legal',
      'Legal Manager',
    ],
  },
  {
    title: 'Finance Leadership',
    roles: [
      'Chief Finance Officer',
      'Head of Finance',
      'VP of Finance',
      'Director of Finance',
      'Finance Manager',
    ],
  },
  {
    title: 'Security Leadership',
    roles: [
      'Chief Security Officer',
      'Head of Security',
      'VP of Security',
      'Director of Security',
      'Security Manager',
    ],
  },
  {
    title: 'People & Talent Leadership',
    roles: [
      'Chief People Officer / CHRO',
      'Head of People / Head of Talent',
      'VP of People / VP of Talent',
      'Director of HR / Talent',
      'HR / Talent Manager',
    ],
  },
  {
    title: 'Logistics & Supply Chain Leadership',
    roles: [
      'Chief Logistics Officer',
      'Head of Logistics / Supply Chain',
      'VP of Logistics / Supply Chain',
      'Director of Logistics',
      'Logistics Manager',
    ],
  },
  {
    title: 'Events Leadership',
    roles: [
      'Chief Event Officer',
      'Head of Events',
      'VP of Events',
      'Director of Events',
      'Event Manager',
    ],
  },
  {
    title: 'Education Leadership',
    roles: [
      'Chief Education Officer',
      'Head of Education / Learning',
      'VP of Education',
      'Director of Education',
      'Education Manager',
    ],
  },
  {
    title: 'Customer Leadership',
    roles: [
      'Chief Customer Officer',
      'Head of Customer Success',
      'VP of Customer Success',
      'Director of Customer Success',
      'Customer Success Manager',
    ],
  },
]

const PERSONA_DIRECTORY: Record<
  string,
  { name: string; company: string; avatar: string }
> = {
  'CEO / Founder': {
    name: 'Daniel Foster',
    company: 'Northstar Growth Labs',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  'Head of Company': {
    name: 'Maya Roberts',
    company: 'SummitBridge Ventures',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  'VP of Strategy / VP of Business': {
    name: 'Rachel Moore',
    company: 'PeakAxis Systems',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  'Director of Business Operations': {
    name: 'Owen Richards',
    company: 'ClarityOps Group',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  'Business Operations Manager': {
    name: 'Emily Hayes',
    company: 'ProcessLift Co.',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
  },
  'Chief Sales Officer': {
    name: 'Marcus Allen',
    company: 'RevenueCore Global',
    avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
  },
  'Head of Sales': {
    name: 'David Emmanuel',
    company: 'Northstar Revenue Systems',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  'VP of Sales': {
    name: 'Sarah Mitchell',
    company: 'Velocity Cloud Systems',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  'Director of Sales': {
    name: 'Jordan Blake',
    company: 'Horizon Pipeline Co.',
    avatar: 'https://randomuser.me/api/portraits/men/53.jpg',
  },
  'Sales Manager': {
    name: 'Lena Brooks',
    company: 'QuotaPath Solutions',
    avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
  },
  'Chief Technology Officer': {
    name: 'Aisha Bello',
    company: 'OrbitStack Labs',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
  },
  'Head of Engineering': {
    name: 'Noah Price',
    company: 'ScaleForge Tech',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  'VP of Engineering': {
    name: 'Priya Raman',
    company: 'BuildLayer Systems',
    avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
  'Director of Engineering': {
    name: 'Ethan Cole',
    company: 'InfraPulse',
    avatar: 'https://randomuser.me/api/portraits/men/39.jpg',
  },
  'Engineering Manager': {
    name: 'Sophia Grant',
    company: 'FlowStack Cloud',
    avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
  },
  'Chief Revenue Officer': {
    name: 'Adrian Wells',
    company: 'GrowthSignal Inc.',
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
  },
  'Head of Revenue / Head of Growth': {
    name: 'Tara Lewis',
    company: 'ExpandIQ',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  'VP of Revenue / VP of Growth': {
    name: 'Chris Dalton',
    company: 'LiftMetric',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
  'Director of Revenue Operations': {
    name: 'Nina Patel',
    company: 'OpsPilot Revenue',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
  },
  'Revenue Operations Manager': {
    name: 'Isaac Green',
    company: 'Forecastly',
    avatar: 'https://randomuser.me/api/portraits/men/60.jpg',
  },
  'Chief Product Officer': {
    name: 'Helen Ward',
    company: 'VisionTrack Product',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
  },
  'Head of Product': {
    name: 'Samir Khan',
    company: 'Pathwise Software',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  'VP of Product': {
    name: 'Claire Benson',
    company: 'ProductAxis',
    avatar: 'https://randomuser.me/api/portraits/women/61.jpg',
  },
  'Director of Product': {
    name: 'Victor Hall',
    company: 'Roadmap Works',
    avatar: 'https://randomuser.me/api/portraits/men/48.jpg',
  },
  'Product Manager': {
    name: 'Mia Turner',
    company: 'FeatureFlow',
    avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
  },
  'Chief Operations Officer': {
    name: 'Rachel Morgan',
    company: 'Westbridge Commerce Group',
    avatar: 'https://randomuser.me/api/portraits/women/49.jpg',
  },
  'Head of Operations': {
    name: 'Elliot Barnes',
    company: 'OpsBridge International',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  'VP of Operations': {
    name: 'Grace Holloway',
    company: 'ScalePort',
    avatar: 'https://randomuser.me/api/portraits/women/58.jpg',
  },
  'Director of Operations': {
    name: 'Hassan Ali',
    company: 'MotionWorks',
    avatar: 'https://randomuser.me/api/portraits/men/57.jpg',
  },
  'Operations Manager': {
    name: 'Naomi Reed',
    company: 'Process Lane',
    avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
  },
  'Chief Marketing Officer': {
    name: 'Bianca James',
    company: 'BrandScale Media',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
  },
  'Head of Marketing': {
    name: 'Elena Cruz',
    company: 'DemandFuel Agency',
    avatar: 'https://randomuser.me/api/portraits/women/36.jpg',
  },
  'VP of Marketing': {
    name: 'Jason Reed',
    company: 'InboundNorth',
    avatar: 'https://randomuser.me/api/portraits/men/58.jpg',
  },
  'Director of Marketing': {
    name: 'Anita Cole',
    company: 'Pipeline Creative',
    avatar: 'https://randomuser.me/api/portraits/women/38.jpg',
  },
  'Marketing Manager': {
    name: 'Sophie White',
    company: 'CampaignIQ',
    avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
  },
  'Chief Legal Officer': {
    name: 'Victoria Stone',
    company: 'GovernEdge Legal',
    avatar: 'https://randomuser.me/api/portraits/women/40.jpg',
  },
  'Head of Legal': {
    name: 'Aaron Bell',
    company: 'PolicyBridge',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  'VP of Legal': {
    name: 'Monica Shaw',
    company: 'ClausePoint',
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg',
  },
  'Director of Legal': {
    name: 'Paul Jenkins',
    company: 'ComplyTrack',
    avatar: 'https://randomuser.me/api/portraits/men/59.jpg',
  },
  'Legal Manager': {
    name: 'Ivy Matthews',
    company: 'RiskLine',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
  },
  'Chief Finance Officer': {
    name: 'Michael Torres',
    company: 'SummitCore Technologies',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
  },
  'Head of Finance': {
    name: 'Laura Finch',
    company: 'CapitalArc',
    avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
  },
  'VP of Finance': {
    name: 'Bryan Holt',
    company: 'LedgerPilot',
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
  },
  'Director of Finance': {
    name: 'Nadia Fox',
    company: 'MarginWorks',
    avatar: 'https://randomuser.me/api/portraits/women/53.jpg',
  },
  'Finance Manager': {
    name: 'Carmen Ellis',
    company: 'SpendSignal',
    avatar: 'https://randomuser.me/api/portraits/women/59.jpg',
  },
  'Chief Security Officer': {
    name: 'Derek Vaughn',
    company: 'ShieldGrid Security',
    avatar: 'https://randomuser.me/api/portraits/men/66.jpg',
  },
  'Head of Security': {
    name: 'Olivia Kent',
    company: 'ControlWall',
    avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
  },
  'VP of Security': {
    name: 'Trevor Long',
    company: 'TrustLayer',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
  },
  'Director of Security': {
    name: 'Leah Foster',
    company: 'SecureOps Global',
    avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
  },
  'Security Manager': {
    name: 'Caleb Ross',
    company: 'GuardPoint',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  'Chief People Officer / CHRO': {
    name: 'Hannah Scott',
    company: 'PeopleRise',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
  },
  'Head of People / Head of Talent': {
    name: 'Molly Evans',
    company: 'TalentBridge',
    avatar: 'https://randomuser.me/api/portraits/women/64.jpg',
  },
  'VP of People / VP of Talent': {
    name: 'Benjamin Clark',
    company: 'HireScope',
    avatar: 'https://randomuser.me/api/portraits/men/63.jpg',
  },
  'Director of HR / Talent': {
    name: 'Jasmine Hall',
    company: 'PeopleFlow',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
  },
  'HR / Talent Manager': {
    name: 'Tina Brooks',
    company: 'TeamPulse',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
  },
  'Chief Logistics Officer': {
    name: 'Patrick Reed',
    company: 'RouteScale Logistics',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  'Head of Logistics / Supply Chain': {
    name: 'Amara Okafor',
    company: 'MoveChain Global',
    avatar: 'https://randomuser.me/api/portraits/women/69.jpg',
  },
  'VP of Logistics / Supply Chain': {
    name: 'Gavin Price',
    company: 'FreightAxis',
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
  },
  'Director of Logistics': {
    name: 'Renee Palmer',
    company: 'FlowFreight',
    avatar: 'https://randomuser.me/api/portraits/women/70.jpg',
  },
  'Logistics Manager': {
    name: 'Jonas Hill',
    company: 'SupplyMap',
    avatar: 'https://randomuser.me/api/portraits/men/70.jpg',
  },
  'Chief Event Officer': {
    name: 'Celeste Morgan',
    company: 'EventFrame',
    avatar: 'https://randomuser.me/api/portraits/women/74.jpg',
  },
  'Head of Events': {
    name: 'Paige Turner',
    company: 'SummitLive',
    avatar: 'https://randomuser.me/api/portraits/women/76.jpg',
  },
  'VP of Events': {
    name: 'Ryan Cole',
    company: 'StageFlow',
    avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
  },
  'Director of Events': {
    name: 'Ariana Wells',
    company: 'EventSync',
    avatar: 'https://randomuser.me/api/portraits/women/73.jpg',
  },
  'Event Manager': {
    name: 'Luke Martin',
    company: 'VenuePilot',
    avatar: 'https://randomuser.me/api/portraits/men/73.jpg',
  },
  'Chief Education Officer': {
    name: 'Dr. Melissa Grant',
    company: 'LearnSphere',
    avatar: 'https://randomuser.me/api/portraits/women/77.jpg',
  },
  'Head of Education / Learning': {
    name: 'Joanna Price',
    company: 'SkillBridge',
    avatar: 'https://randomuser.me/api/portraits/women/78.jpg',
  },
  'VP of Education': {
    name: 'Nathan Reed',
    company: 'EduFlow',
    avatar: 'https://randomuser.me/api/portraits/men/74.jpg',
  },
  'Director of Education': {
    name: 'Isabel Woods',
    company: 'OutcomeWorks',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  'Education Manager': {
    name: 'Peter Long',
    company: 'CourseStack',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  'Chief Customer Officer': {
    name: 'Natalie Brooks',
    company: 'ClientPath',
    avatar: 'https://randomuser.me/api/portraits/women/71.jpg',
  },
  'Head of Customer Success': {
    name: 'Claire Donovan',
    company: 'RetentionOS',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  'VP of Customer Success': {
    name: 'Evan Mitchell',
    company: 'SuccessScale',
    avatar: 'https://randomuser.me/api/portraits/men/69.jpg',
  },
  'Director of Customer Success': {
    name: 'Julia Sanders',
    company: 'AccountPilot',
    avatar: 'https://randomuser.me/api/portraits/women/75.jpg',
  },
  'Customer Success Manager': {
    name: 'Megan Ross',
    company: 'ClientOrbit',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
  },
}

function ScenarioIcon({ slug }: { slug: string }) {
  if (slug.includes('cold')) return <Mic className="h-5 w-5" />
  if (slug.includes('discovery')) return <Brain className="h-5 w-5" />
  if (slug.includes('objection')) return <ShieldCheck className="h-5 w-5" />
  if (slug.includes('demo')) return <AudioWaveform className="h-5 w-5" />
  return <Target className="h-5 w-5" />
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-3">
      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
        {title}
      </div>
      <div className="mt-1 text-sm text-[#666864]">{subtitle}</div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function ScenariosPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    SCENARIOS[0].id
  )
  const [selectedIndustry, setSelectedIndustry] = useState<string>('SaaS')
  const [selectedRoleplayType, setSelectedRoleplayType] =
    useState<string>('Cold Call')
  const [selectedBuyerMood, setSelectedBuyerMood] =
    useState<BuyerMood>('nice')
  const [selectedBuyerRole, setSelectedBuyerRole] =
    useState<string>('Head of Sales')
  const [hoveredBuyerRoleCategory, setHoveredBuyerRoleCategory] =
    useState<string>('Sales Leadership')
  const [selectedDealSize, setSelectedDealSize] = useState<string>('$10k')
  const [selectedPainLevel, setSelectedPainLevel] =
    useState<string>('moderate')
  const [selectedCompanyStage, setSelectedCompanyStage] =
    useState<string>('Series A & B')
  const [selectedTimePressure, setSelectedTimePressure] =
    useState<string>('15_min')
  const [starting, setStarting] = useState(false)

  const selectedScenario = useMemo(
    () =>
      SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ??
      SCENARIOS[0],
    [selectedScenarioId]
  )

  const selectedPainLevelLabel =
    PAIN_LEVEL_OPTIONS.find((item) => item.value === selectedPainLevel)?.label ??
    selectedPainLevel

  const selectedTimePressureLabel =
    TIME_PRESSURE_OPTIONS.find((item) => item.value === selectedTimePressure)
      ?.label ?? selectedTimePressure

  const personaPreview = useMemo(() => {
    return (
      PERSONA_DIRECTORY[selectedBuyerRole] ?? {
        name: 'David Emmanuel',
        company: 'Northstar Revenue Systems',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      }
    )
  }, [selectedBuyerRole])

  const activeBuyerRoleCategory = useMemo(() => {
    return (
      BUYER_ROLE_CATEGORIES.find(
        (category) => category.title === hoveredBuyerRoleCategory
      ) ?? BUYER_ROLE_CATEGORIES[0]
    )
  }, [hoveredBuyerRoleCategory])

  async function handleStartSession() {
    try {
      setStarting(true)

      const url = `/session/new?scenarioId=${encodeURIComponent(
        selectedScenario.id
      )}&mode=voice&selectedIndustry=${encodeURIComponent(
        selectedIndustry
      )}&selectedRoleplayType=${encodeURIComponent(
        selectedRoleplayType
      )}&selectedBuyerMood=${encodeURIComponent(
        selectedBuyerMood
      )}&selectedBuyerRole=${encodeURIComponent(
        selectedBuyerRole
      )}&selectedDealSize=${encodeURIComponent(
        selectedDealSize
      )}&selectedPainLevel=${encodeURIComponent(
        selectedPainLevel
      )}&selectedCompanyStage=${encodeURIComponent(
        selectedCompanyStage
      )}&selectedTimePressure=${encodeURIComponent(
        selectedTimePressure
      )}&selectedBuyerName=${encodeURIComponent(
        personaPreview.name
      )}&selectedBuyerCompany=${encodeURIComponent(
        personaPreview.company
      )}&selectedBuyerAvatar=${encodeURIComponent(personaPreview.avatar)}`

      window.location.href = url
    } finally {
      setStarting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-5">
          <div className="flex w-full items-center justify-between sm:w-auto">
            <Link href="/" className="flex items-center">
              <div className="flex h-9 items-center overflow-hidden md:h-10">
                <img
                  src="/images/logo.png"
                  alt="Genim Logo"
                  className="h-[110px] w-auto max-w-none object-contain md:h-[150px]"
                />
              </div>
            </Link>

            <div className="sm:hidden">
              <DashboardLink />
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
            <div className="hidden rounded-full border border-[#ddd4ca] bg-white px-4 py-2 text-sm text-[#555854] md:block">
              Session builder
            </div>

            <div className="hidden sm:block">
              <DashboardLink />
            </div>

            <form action="/auth/signout" method="post" className="col-span-2 sm:col-span-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-3 text-sm font-medium text-[#2b2c2a] transition hover:bg-[#faf7f3] sm:w-auto sm:px-5"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e8ded3] bg-[#f3ece4]">
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[920px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efc7b7] bg-[#f7ede6] px-4 py-2 text-sm font-medium text-[#d6612d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e1805c]" />
                Roleplay setup
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-0.04em] text-[#141412]">
                Configure the roleplay
                <span className="mt-2 block italic text-[#d6612d]">
                  on one screen.
                </span>
              </h1>

              <p className="mt-4 max-w-[860px] text-base leading-8 text-[#5c5f5a] md:text-lg">
                Choose the market, buyer attitude, buyer role, deal pressure,
                company context, call type, and scenario in one compact layout.
                Every choice updates the live summary instantly.
              </p>
            </div>

            <CurrentPlanCard />
          </div>
        </div>
      </section>

      <section className="px-6 py-6 md:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <AssignedRoleplays />
            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Industry"
                subtitle="Choose the market context"
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                {INDUSTRY_OPTIONS.map((industry) => {
                  const active = industry === selectedIndustry

                  return (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => setSelectedIndustry(industry)}
                      className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee] text-[#a84922]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                      }`}
                    >
                      {industry}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Buyer mood"
                subtitle="Control how friendly or difficult the buyer is"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {BUYER_MOOD_OPTIONS.map((mood) => {
                  const active = mood.value === selectedBuyerMood

                  return (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedBuyerMood(mood.value)}
                      className={`rounded-[16px] border p-4 text-left transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                      }`}
                    >
                      <div className="text-base font-semibold text-[#1a1a17]">
                        {mood.label}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[#5f625d]">
                        {mood.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Buyer role"
                subtitle="Hover a category on desktop or tap one on mobile, then choose a buyer role below"
              />

              <div className="mb-5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                  Categories
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {BUYER_ROLE_CATEGORIES.map((category) => {
                    const active = activeBuyerRoleCategory.title === category.title

                    return (
                      <button
                        key={category.title}
                        type="button"
                        onClick={() => setHoveredBuyerRoleCategory(category.title)}
                        className={`rounded-[16px] border px-4 py-4 text-left text-sm font-semibold transition ${
                          active
                            ? 'border-[#d6612d] bg-[#fcf3ee] text-[#a84922]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                        }`}
                      >
                        <span className="block leading-6">{category.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[20px] border border-[#ece4da] bg-[#faf8f5] p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a8d87]">
                      Roles in category
                    </div>
                    <div className="mt-1 text-base font-semibold text-[#1a1a17]">
                      {activeBuyerRoleCategory.title}
                    </div>
                  </div>

                  <div className="inline-flex w-fit rounded-full border border-[#e7ddd3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                    {activeBuyerRoleCategory.roles.length} roles
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                  {activeBuyerRoleCategory.roles.map((role) => {
                    const active = role === selectedBuyerRole

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedBuyerRole(role)}
                        className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'border-[#1f4d38] bg-[#eef5f0] text-[#1f4d38]'
                            : 'border-[#e9e0d6] bg-white text-[#4d4f4a] hover:bg-[#fdfbf8]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="leading-6">{role}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Deal size"
                  subtitle="Control commercial weight"
                />
                <div className="grid grid-cols-2 gap-3">
                  {DEAL_SIZE_OPTIONS.map((dealSize) => {
                    const active = dealSize === selectedDealSize

                    return (
                      <button
                        key={dealSize}
                        type="button"
                        onClick={() => setSelectedDealSize(dealSize)}
                        className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'border-[#d6612d] bg-[#fcf3ee] text-[#a84922]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{dealSize}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Pain level"
                  subtitle="Control urgency and buyer pressure"
                />
                <div className="grid grid-cols-1 gap-3">
                  {PAIN_LEVEL_OPTIONS.map((pain) => {
                    const active = pain.value === selectedPainLevel

                    return (
                      <button
                        key={pain.value}
                        type="button"
                        onClick={() => setSelectedPainLevel(pain.value)}
                        className={`rounded-[16px] border p-4 text-left transition ${
                          active
                            ? 'border-[#d6612d] bg-[#fcf3ee]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium text-[#1a1a17]">
                            {pain.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Company stage"
                  subtitle="Add company maturity context"
                />
                <div className="grid grid-cols-2 gap-3">
                  {COMPANY_STAGE_OPTIONS.map((stage) => {
                    const active = stage === selectedCompanyStage

                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedCompanyStage(stage)}
                        className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'border-[#1f4d38] bg-[#eef5f0] text-[#1f4d38]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{stage}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
                <SectionHeader
                  title="Time pressure"
                  subtitle="Add realism and call pressure"
                />
                <div className="grid grid-cols-1 gap-3">
                  {TIME_PRESSURE_OPTIONS.map((time) => {
                    const active = time.value === selectedTimePressure

                    return (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => setSelectedTimePressure(time.value)}
                        className={`rounded-[16px] border p-4 text-left transition ${
                          active
                            ? 'border-[#1f4d38] bg-[#eef5f0]'
                            : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium text-[#1a1a17]">
                            {time.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Roleplay type"
                subtitle="Choose the kind of conversation"
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                {ROLEPLAY_TYPE_OPTIONS.map((type) => {
                  const active = type === selectedRoleplayType

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedRoleplayType(type)}
                      className={`rounded-[16px] border px-3 py-3 text-left text-sm font-medium transition ${
                        active
                          ? 'border-[#1f4d38] bg-[#eef5f0] text-[#1f4d38]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] text-[#4d4f4a] hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e8ded3] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.04)]">
              <SectionHeader
                title="Scenario"
                subtitle="Pick the training challenge"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {SCENARIOS.map((scenario) => {
                  const active = scenario.id === selectedScenarioId

                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setSelectedScenarioId(scenario.id)}
                      className={`rounded-[18px] border p-4 text-left transition ${
                        active
                          ? 'border-[#d6612d] bg-[#fcf3ee]'
                          : 'border-[#e9e0d6] bg-[#faf8f5] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            active
                              ? 'bg-[#f7e6dc] text-[#d6612d]'
                              : 'bg-white text-[#8d6a55]'
                          }`}
                        >
                          <ScenarioIcon slug={scenario.slug} />
                        </div>

                        <div className="min-w-0">
                          <div className="text-base font-semibold text-[#1a1a17]">
                            {scenario.title}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-[#5f625d]">
                            {scenario.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-6 rounded-[28px] border border-[#e6ddd2] bg-white p-5 shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b7e79]">
                Session summary
              </p>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-[#ece4da] bg-[#faf8f5]">
                <div className="bg-[linear-gradient(135deg,#f7ede6_0%,#eef5f0_100%)] px-5 py-5">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#1f4d38] shadow-sm">
                      <img
                        src={personaPreview.avatar}
                        alt={personaPreview.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {/* <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                        {getInitials(personaPreview.name)}
                      </div> */}
                    </div>

                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-[#181815]">
                        {personaPreview.name}
                      </div>
                      <div className="mt-0.5 text-sm font-medium text-[#3d413c]">
                        {selectedBuyerRole}
                      </div>
                      <div className="mt-0.5 text-sm text-[#666864]">
                        {personaPreview.company}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-white/70 bg-white/70 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                      Selected scenario
                    </div>
                    <div className="mt-2 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5ede6] text-[#d6612d]">
                        <ScenarioIcon slug={selectedScenario.slug} />
                      </div>

                      <div>
                        <div className="text-base font-semibold text-[#181815]">
                          {selectedScenario.title}
                        </div>
                        <div className="mt-1 text-sm leading-6 text-[#5f625d]">
                          {selectedScenario.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Industry
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedIndustry}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Buyer mood
                      </div>
                      <div className="mt-1.5 text-sm font-semibold capitalize text-[#1b1b18]">
                        {selectedBuyerMood.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Buyer role
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedBuyerRole}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Roleplay type
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedRoleplayType}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Deal size
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedDealSize}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Pain level
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedPainLevelLabel}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Company stage
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedCompanyStage}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#ece4da] bg-white px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                        Time pressure
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-[#1b1b18]">
                        {selectedTimePressureLabel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[16px] border border-[#cfe0d5] bg-[#eef5f0] p-3">
                    <div className="text-sm font-semibold text-[#385244]">
                      Training objective
                    </div>
                    <div className="mt-1.5 text-sm leading-6 text-[#4f6155]">
                      {selectedScenario.objective}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartSession}
                    disabled={starting}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
                  >
                    {starting ? 'Starting session...' : 'Start roleplay'}
                    {!starting ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>

                  <div className="mt-4 text-center text-xs leading-6 text-[#777a75]">
                    Persona preview updates with your chosen buyer role.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}