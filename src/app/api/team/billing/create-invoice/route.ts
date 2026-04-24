import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function canManageBilling(role: string | null) {
  return role === 'owner' || role === 'admin'
}

type RequestBody = {
  seatLimit?: number
  amount?: number
  billingEmail?: string
  currentPeriodEnd?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody

    const seatLimit = Number(body.seatLimit)
    const amount = Number(body.amount)
    const billingEmail = String(body.billingEmail || '').trim().toLowerCase()
    const currentPeriodEndRaw = String(body.currentPeriodEnd || '').trim()

    if (!seatLimit || seatLimit < 1) {
      return NextResponse.json(
        { error: 'Seat limit must be at least 1' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!billingEmail) {
      return NextResponse.json(
        { error: 'Billing email is required' },
        { status: 400 }
      )
    }

    if (!currentPeriodEndRaw) {
      return NextResponse.json(
        { error: 'Billing period end date is required' },
        { status: 400 }
      )
    }

    const currentPeriodEnd = new Date(currentPeriodEndRaw)

    if (Number.isNaN(currentPeriodEnd.getTime())) {
      return NextResponse.json(
        { error: 'Invalid billing period end date' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (membershipError || !membership || !canManageBilling(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage billing' },
        { status: 403 }
      )
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', membership.company_id)
      .maybeSingle()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const admin = createAdminClient()

    const { data: existingSubscription } = await admin
      .from('company_subscriptions')
      .select('stripe_customer_id')
      .eq('company_id', company.id)
      .maybeSingle()

    let stripeCustomerId = existingSubscription?.stripe_customer_id ?? null

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: billingEmail,
        name: company.name,
        metadata: {
          company_id: company.id,
        },
      })

      stripeCustomerId = customer.id
    }

    const amountInCents = Math.round(amount * 100)
    const pricePerSeat = amount / seatLimit

    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: amountInCents,
      currency: 'usd',
      description: `Genim Team Plan — ${seatLimit} seats at $${pricePerSeat.toFixed(
        2
      )}/seat`,
      metadata: {
        company_id: company.id,
        seat_limit: String(seatLimit),
        amount: String(amount),
      },
    })

    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      auto_advance: true,
      metadata: {
        company_id: company.id,
        seat_limit: String(seatLimit),
        amount: String(amount),
        current_period_end: currentPeriodEnd.toISOString(),
      },
    })

    await stripe.invoices.sendInvoice(invoice.id)

    const { error: upsertError } = await admin
      .from('company_subscriptions')
      .upsert(
        {
          company_id: company.id,
          stripe_customer_id: stripeCustomerId,
          stripe_invoice_id: invoice.id,
          plan_name: 'team_custom',
          status: 'pending',
          seat_limit: seatLimit,
          amount_due: amount,
          currency: 'usd',
          current_period_start: new Date().toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
        },
        {
          onConflict: 'company_id',
        }
      )

    if (upsertError) {
      throw new Error(upsertError.message)
    }

    return NextResponse.json({
      ok: true,
      invoiceId: invoice.id,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create team invoice',
      },
      { status: 500 }
    )
  }
}