import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { PRICE_TO_PLAN } from '@/lib/stripe/plan-map'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function getCurrentPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEndUnix = subscription.items.data[0]?.current_period_end ?? null

  if (!periodEndUnix) {
    return null
  }

  return new Date(periodEndUnix * 1000).toISOString()
}

function getPlanKey(priceId: string | null): string {
  if (!priceId) return 'starter'
  return PRICE_TO_PLAN[priceId] ?? 'starter'
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
  }

  const subscription = invoiceWithSubscription.subscription

  if (!subscription) return null

  return typeof subscription === 'string' ? subscription : subscription.id
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

  const supabase = createAdminClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.user_id ?? null
      const customerId =
        typeof session.customer === 'string' ? session.customer : null
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : null

      if (!userId || !subscriptionId) {
        console.warn('Missing userId or subscriptionId in checkout session', {
          sessionId: session.id,
          userId,
          subscriptionId,
        })

        return NextResponse.json({ received: true })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price?.id ?? null
      const planKey = getPlanKey(priceId)

      const { error: upsertError } = await supabase.from('subscriptions').upsert(
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

      if (upsertError) {
        console.error('Failed to upsert subscription:', upsertError)
        throw new Error(upsertError.message)
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription

      const priceId = subscription.items.data[0]?.price?.id ?? null
      const planKey = getPlanKey(priceId)

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          stripe_price_id: priceId,
          plan_key: planKey,
          status: subscription.status,
          current_period_end: getCurrentPeriodEnd(subscription),
        })
        .eq('stripe_subscription_id', subscription.id)

      if (updateError) {
        console.error('Failed to update subscription:', updateError)
        throw new Error(updateError.message)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      const { error: deleteUpdateError } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: getCurrentPeriodEnd(subscription),
        })
        .eq('stripe_subscription_id', subscription.id)

      if (deleteUpdateError) {
        console.error('Failed to mark subscription deleted:', deleteUpdateError)
        throw new Error(deleteUpdateError.message)
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = getInvoiceSubscriptionId(invoice)

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price?.id ?? null
        const planKey = getPlanKey(priceId)

        const { error: renewalUpdateError } = await supabase
          .from('subscriptions')
          .update({
            stripe_price_id: priceId,
            plan_key: planKey,
            status: subscription.status,
            current_period_end: getCurrentPeriodEnd(subscription),
          })
          .eq('stripe_subscription_id', subscriptionId)

        if (renewalUpdateError) {
          console.error(
            'Failed to update subscription after successful invoice:',
            renewalUpdateError
          )
          throw new Error(renewalUpdateError.message)
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = getInvoiceSubscriptionId(invoice)

      if (subscriptionId) {
        const { error: failedPaymentUpdateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('stripe_subscription_id', subscriptionId)

        if (failedPaymentUpdateError) {
          console.error(
            'Failed to mark subscription as past_due:',
            failedPaymentUpdateError
          )
          throw new Error(failedPaymentUpdateError.message)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handler failed:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}