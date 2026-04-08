-- =========================================================
-- 0002_seed_scenarios.sql
-- Seed first 5 Genim roleplay scenarios + personas + rubrics
-- =========================================================

-- =========================================================
-- SCENARIOS
-- =========================================================
insert into public.scenarios (
  slug,
  title,
  description,
  industry,
  difficulty,
  objective,
  active
)
values
  (
    'cold-call-not-interested',
    'Cold Call — Not Interested',
    'Practice handling an impatient prospect who says they are not interested and tries to end the call quickly.',
    'B2B SaaS',
    'beginner',
    'Keep the buyer engaged long enough to uncover a pain point and secure a next step.',
    true
  ),
  (
    'discovery-surface-pain',
    'Discovery Call — Surface Pain',
    'Practice asking better questions to uncover the real business problem behind a vague interest in change.',
    'B2B SaaS',
    'intermediate',
    'Identify pain, impact, urgency, and current process gaps.',
    true
  ),
  (
    'objection-too-expensive',
    'Objection Handling — Too Expensive',
    'Practice responding when a buyer pushes back on price and compares you to a cheaper competitor.',
    'B2B SaaS',
    'intermediate',
    'Defend value without sounding defensive and move the deal forward.',
    true
  ),
  (
    'demo-weak-engagement',
    'Demo Call — Weak Engagement',
    'Practice re-engaging a distracted prospect during a product conversation.',
    'B2B SaaS',
    'advanced',
    'Make the conversation relevant, regain attention, and connect the product to buyer pains.',
    true
  ),
  (
    'closing-hesitation',
    'Closing Call — Hesitation',
    'Practice handling a buyer who says they need more time and are unsure whether to move forward.',
    'B2B SaaS',
    'advanced',
    'Create clarity, reduce hesitation, and secure a concrete next step.',
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  industry = excluded.industry,
  difficulty = excluded.difficulty,
  objective = excluded.objective,
  active = excluded.active,
  updated_at = now();

-- =========================================================
-- BUYER PERSONAS
-- First clear existing active personas for these scenarios
-- =========================================================
update public.buyer_personas
set is_active = false,
    updated_at = now()
where scenario_id in (
  select id
  from public.scenarios
  where slug in (
    'cold-call-not-interested',
    'discovery-surface-pain',
    'objection-too-expensive',
    'demo-weak-engagement',
    'closing-hesitation'
  )
);

-- Insert one active persona per scenario
insert into public.buyer_personas (
  scenario_id,
  name,
  title,
  company_name,
  company_size,
  tone,
  background,
  hidden_pain_points,
  common_objections,
  goals,
  constraints,
  is_active
)
select
  s.id,
  'David Cole',
  'Head of Sales',
  'BrightPath CRM',
  '51-200 employees',
  'busy, impatient, guarded',
  'David is under pressure to hit quarterly pipeline targets. He gets many cold calls and usually tries to end them quickly unless something sounds immediately relevant.',
  '["Pipeline quality is inconsistent", "Reps waste time on poor-fit leads", "Forecasting is unreliable"]'::jsonb,
  '["Not interested", "Send me an email", "We already have a process"]'::jsonb,
  '["Protect time", "Avoid irrelevant pitches", "Only engage if there is clear business value"]'::jsonb,
  '["Has less than 2 minutes", "Will not volunteer pain unless asked well"]'::jsonb,
  true
from public.scenarios s
where s.slug = 'cold-call-not-interested';

insert into public.buyer_personas (
  scenario_id,
  name,
  title,
  company_name,
  company_size,
  tone,
  background,
  hidden_pain_points,
  common_objections,
  goals,
  constraints,
  is_active
)
select
  s.id,
  'Amara Bello',
  'Operations Manager',
  'FlowGrid Systems',
  '201-500 employees',
  'thoughtful, cautious, moderately open',
  'Amara knows her team has inefficiencies but has not fully quantified the cost. She is open to talking but needs help clarifying the real problem.',
  '["Manual workflows cause delays", "Reporting takes too long", "Team handoffs create errors"]'::jsonb,
  '["We are managing for now", "I am not sure this is a priority", "We need to understand the impact first"]'::jsonb,
  '["Understand whether change is worth it", "Avoid unnecessary disruption"]'::jsonb,
  '["Needs strong discovery questions", "Will not self-diagnose deeply without prompting"]'::jsonb,
  true
from public.scenarios s
where s.slug = 'discovery-surface-pain';

insert into public.buyer_personas (
  scenario_id,
  name,
  title,
  company_name,
  company_size,
  tone,
  background,
  hidden_pain_points,
  common_objections,
  goals,
  constraints,
  is_active
)
select
  s.id,
  'Helen Grant',
  'Chief Financial Officer',
  'Northlane Tech',
  '51-200 employees',
  'analytical, direct, skeptical',
  'Helen is focused on cost control and ROI. She does not respond well to vague value claims and will compare you to cheaper alternatives.',
  '["Current vendor is cheap but underperforming", "Internal team wastes time due to poor tooling", "Budget scrutiny is high"]'::jsonb,
  '["Too expensive", "Your competitor is cheaper", "Why should I pay more?"]'::jsonb,
  '["Reduce waste", "Defend budget decisions", "See a clear return"]'::jsonb,
  '["Needs commercial clarity", "Rejects fluffy language"]'::jsonb,
  true
from public.scenarios s
where s.slug = 'objection-too-expensive';

insert into public.buyer_personas (
  scenario_id,
  name,
  title,
  company_name,
  company_size,
  tone,
  background,
  hidden_pain_points,
  common_objections,
  goals,
  constraints,
  is_active
)
select
  s.id,
  'Marcus Reed',
  'Revenue Operations Manager',
  'ScaleForge',
  '201-500 employees',
  'distracted, polite, hard to engage',
  'Marcus joined the demo but is multitasking. He has some pain but does not yet see why this solution matters specifically to him.',
  '["Data is fragmented", "Team adoption of tools is low", "Management wants clearer reporting"]'::jsonb,
  '["Can you just show me the feature?", "We have seen tools like this before", "I am not sure how this helps us"]'::jsonb,
  '["Decide quickly if the demo is relevant", "Avoid wasting time"]'::jsonb,
  '["Attention is limited", "Needs relevance tied to his role"]'::jsonb,
  true
from public.scenarios s
where s.slug = 'demo-weak-engagement';

insert into public.buyer_personas (
  scenario_id,
  name,
  title,
  company_name,
  company_size,
  tone,
  background,
  hidden_pain_points,
  common_objections,
  goals,
  constraints,
  is_active
)
select
  s.id,
  'Rachel Stone',
  'VP of Sales',
  'CloudPeak Labs',
  '51-200 employees',
  'interested but hesitant, careful, decision-focused',
  'Rachel sees some value but is nervous about timing, team adoption, and internal buy-in. She often delays when she is not fully convinced.',
  '["Current process is underperforming", "Team needs improvement quickly", "Delay has a hidden cost"]'::jsonb,
  '["We need to think about it", "This may not be the right time", "Let me discuss it internally"]'::jsonb,
  '["Reduce risk", "Make a smart decision", "Avoid committing too early"]'::jsonb,
  '["Needs clarity and confidence", "Will stall if next step is weak"]'::jsonb,
  true
from public.scenarios s
where s.slug = 'closing-hesitation';

-- =========================================================
-- RUBRICS
-- =========================================================
insert into public.scoring_rubrics (
  scenario_id,
  name,
  description,
  active
)
select
  s.id,
  'Default Sales Roleplay Rubric',
  'Core rubric for Genim voice roleplay sessions.',
  true
from public.scenarios s
where s.slug in (
  'cold-call-not-interested',
  'discovery-surface-pain',
  'objection-too-expensive',
  'demo-weak-engagement',
  'closing-hesitation'
)
and not exists (
  select 1
  from public.scoring_rubrics r
  where r.scenario_id = s.id
);

-- If rubric already existed, make sure it is active and updated
update public.scoring_rubrics
set
  name = 'Default Sales Roleplay Rubric',
  description = 'Core rubric for Genim voice roleplay sessions.',
  active = true,
  updated_at = now()
where scenario_id in (
  select id
  from public.scenarios
  where slug in (
    'cold-call-not-interested',
    'discovery-surface-pain',
    'objection-too-expensive',
    'demo-weak-engagement',
    'closing-hesitation'
  )
);

-- =========================================================
-- RUBRIC ITEMS
-- =========================================================
insert into public.scoring_rubric_items (
  rubric_id,
  category_key,
  category_label,
  max_score,
  weight,
  sort_order,
  guidance
)
select
  r.id,
  v.category_key,
  v.category_label,
  v.max_score,
  v.weight,
  v.sort_order,
  v.guidance
from public.scoring_rubrics r
join public.scenarios s
  on s.id = r.scenario_id
cross join (
  values
    ('opening_rapport', 'Opening & Rapport', 10, 1.00, 1, 'Assesses greeting, tone, confidence, and initial engagement.'),
    ('discovery_questions', 'Discovery Questions', 20, 1.00, 2, 'Assesses how well the learner uncovers needs, pain, and context.'),
    ('active_listening', 'Active Listening', 15, 1.00, 3, 'Assesses whether the learner responds to what the buyer actually said.'),
    ('value_communication', 'Value Communication', 15, 1.00, 4, 'Assesses clarity and relevance of value articulation.'),
    ('objection_handling', 'Objection Handling', 20, 1.00, 5, 'Assesses how confidently and effectively objections are handled.'),
    ('confidence_clarity', 'Confidence & Clarity', 10, 1.00, 6, 'Assesses conciseness, confidence, and communication quality.'),
    ('closing_next_step', 'Closing / Next Step', 10, 1.00, 7, 'Assesses whether the learner drives a clear and appropriate next step.')
) as v(category_key, category_label, max_score, weight, sort_order, guidance)
where s.slug in (
  'cold-call-not-interested',
  'discovery-surface-pain',
  'objection-too-expensive',
  'demo-weak-engagement',
  'closing-hesitation'
)
and not exists (
  select 1
  from public.scoring_rubric_items sri
  where sri.rubric_id = r.id
    and sri.category_key = v.category_key
);