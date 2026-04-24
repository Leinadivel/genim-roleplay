import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

type Plan =
  | 'pro_monthly'
  | 'pro_yearly'
  | 'advanced_monthly'
  | 'advanced_yearly'

function getPriceId(plan: Plan) {
  switch (plan) {
    case 'pro_monthly':
      return process.env.STRIPE_PRICE_PRO_MONTHLY
    case 'pro_yearly':
      return process.env.STRIPE_PRICE_PRO_YEARLY
    case 'advanced_monthly':
      return process.env.STRIPE_PRICE_ADVANCED_MONTHLY
    case 'advanced_yearly':
      return process.env.STRIPE_PRICE_ADVANCED_YEARLY
    default:
      return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const plan = body.plan as Plan

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    const priceId = getPriceId(plan)

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existingSub, error: existingSubError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingSubError) {
      return NextResponse.json(
        { error: existingSubError.message },
        { status: 500 }
      )
    }

    if (
      existingSub?.stripe_subscription_id &&
      existingSub.status === 'active'
    ) {
      return NextResponse.json(
        {
          error:
            'You already have an active subscription. Please use the switch or manage plan option when it is available.',
        },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      metadata: {
        user_id: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Checkout failed',
      },
      { status: 500 }
    )
  }
}