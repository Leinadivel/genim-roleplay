import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const requestId = String(formData.get('requestId') || '').trim()
    const companyId = String(formData.get('companyId') || '').trim()
    const billingEmail = String(formData.get('billingEmail') || '')
      .trim()
      .toLowerCase()
    const seatLimit = Number(formData.get('seatLimit'))
    const amount = Number(formData.get('amount'))
    const currentPeriodEndRaw = String(
      formData.get('currentPeriodEnd') || ''
    ).trim()

    const { user, admin } = await getGenimAdmin()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url), 303)
    }

    if (!admin) {
      return NextResponse.redirect(new URL('/scenarios', request.url), 303)
    }

    if (
      !companyId ||
      !billingEmail ||
      !seatLimit ||
      !amount ||
      !currentPeriodEndRaw
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (seatLimit < 1 || amount <= 0) {
      return NextResponse.json(
        { error: 'Seat limit and amount must be greater than 0' },
        { status: 400 }
      )
    }

    const currentPeriodEnd = new Date(currentPeriodEndRaw)

    if (Number.isNaN(currentPeriodEnd.getTime())) {
      return NextResponse.json(
        { error: 'Invalid period end date' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .maybeSingle()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const { data: existingSubscription } = await adminClient
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

    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      auto_advance: false,
      metadata: {
        company_id: company.id,
        seat_limit: String(seatLimit),
        amount: String(amount),
        current_period_end: currentPeriodEnd.toISOString(),
      },
    })

    const invoiceItem = await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id,
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

    const invoiceWithLines = await stripe.invoices.retrieve(invoice.id, {
      expand: ['lines'],
    })

    if (invoiceWithLines.lines.data.length < 1 || invoiceWithLines.total < 1) {
      console.error('Invoice line item was not attached:', {
        invoiceId: invoice.id,
        invoiceItemId: invoiceItem.id,
        lineCount: invoiceWithLines.lines.data.length,
        invoiceTotal: invoiceWithLines.total,
        amountInCents,
        stripeCustomerId,
      })

      await stripe.invoices.del(invoice.id)

      return NextResponse.json(
        {
          error:
            'Invoice item was not attached to the invoice. The invoice was stopped before sending.',
        },
        { status: 500 }
      )
    }

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

    await stripe.invoices.sendInvoice(finalizedInvoice.id)

    const { error: upsertError } = await adminClient
      .from('company_subscriptions')
      .upsert(
        {
          company_id: company.id,
          stripe_customer_id: stripeCustomerId,
          stripe_invoice_id: finalizedInvoice.id,
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
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    if (requestId) {
      const { error: requestUpdateError } = await adminClient
        .from('company_seat_requests')
        .update({ status: 'invoiced' })
        .eq('id', requestId)

      if (requestUpdateError) {
        console.error(
          'Failed to mark seat request as invoiced:',
          requestUpdateError
        )
      }
    }

    return NextResponse.redirect(
      new URL('/admin/billing?sent=1', request.url),
      303
    )
  } catch (error) {
    console.error('Create invoice route failed:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create invoice',
      },
      { status: 500 }
    )
  }
}