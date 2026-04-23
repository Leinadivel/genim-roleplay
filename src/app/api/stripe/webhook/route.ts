import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { PRICE_TO_PLAN } from '@/lib/stripe/plan-map'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function getCurrentPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEndUnix =
    subscription.items.data[0]?.current_period_end ??
    null

  if (!periodEndUnix) {
    return null
  }

  return new Date(periodEndUnix * 1000).toISOString()
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Missing webhook signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return new NextResponse('Webhook Error', { status: 400 })
  }

  const supabase = await createClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.user_id ?? null
      const customerId =
        typeof session.customer === 'string' ? session.customer : null
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : null

      if (!userId || !subscriptionId) {
        return NextResponse.json({ received: true })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      const priceId = subscription.items.data[0]?.price?.id ?? null
      const planKey = priceId ? PRICE_TO_PLAN[priceId] ?? 'starter' : 'starter'

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          plan_key: planKey,
          status: subscription.status,
          current_period_end: getCurrentPeriodEnd(subscription),
        },
        {
          onConflict: 'user_id',
        }
      )
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription

      const priceId = subscription.items.data[0]?.price?.id ?? null
      const planKey = priceId ? PRICE_TO_PLAN[priceId] ?? 'starter' : 'starter'

      await supabase
        .from('subscriptions')
        .update({
          stripe_price_id: priceId,
          plan_key: planKey,
          status: subscription.status,
          current_period_end: getCurrentPeriodEnd(subscription),
        })
        .eq('stripe_subscription_id', subscription.id)
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: getCurrentPeriodEnd(subscription),
        })
        .eq('stripe_subscription_id', subscription.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handler failed:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}