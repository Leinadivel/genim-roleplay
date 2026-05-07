export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-12 text-[#1f1f1c]">
      <div className="mx-auto max-w-[900px] rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(25,25,20,0.06)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Legal
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
          Genim Refund Policy
        </h1>

        <p className="mt-2 text-sm text-[#666864]">
          Effective Date: 1 May 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#4f514d]">
          <Section title="1. Subscription Payments">
            Genim subscription payments are generally non-refundable once access has been provided, unless required by law or specifically agreed in writing.
          </Section>

          <Section title="2. Team and Company Plans">
            Company or team plans may be billed by invoice, monthly subscription, annual subscription, or custom agreement. Refund eligibility depends on the agreed commercial terms.
          </Section>

          <Section title="3. Trial or Pilot Access">
            Free trials or pilot access may expire automatically. If a company continues after the pilot period, paid access may require invoice payment or subscription activation.
          </Section>

          <Section title="4. Billing Issues">
            If you believe you were charged incorrectly, contact us as soon as possible with your account email, company name, invoice details, and a description of the issue.
          </Section>

          <Section title="5. Contact">
            For billing and refund questions, contact us at{' '}
            <a className="font-semibold text-[#1f4d38]" href="mailto:c@geniusnimble.com">
              c@geniusnimble.com
            </a>{' '}
            or{' '}
            <a className="font-semibold text-[#1f4d38]" href="mailto:daniel@geniusnimble.com">
              daniel@geniusnimble.com
            </a>.
          </Section>
        </div>
      </div>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[#171714]">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  )
}