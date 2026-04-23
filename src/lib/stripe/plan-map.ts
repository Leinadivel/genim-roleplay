// lib/stripe/plan-map.ts

export const PRICE_TO_PLAN: Record<string, string> = {
  'price_pro_monthly': 'pro_monthly',
  'price_pro_yearly': 'pro_yearly',
  'price_adv_monthly': 'advanced_monthly',
  'price_adv_yearly': 'advanced_yearly',
}