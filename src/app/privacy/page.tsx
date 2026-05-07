export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-12 text-[#1f1f1c]">
      <div className="mx-auto max-w-[900px] rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(25,25,20,0.06)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Legal
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
          Genim Privacy Policy
        </h1>

        <p className="mt-2 text-sm text-[#666864]">
          Effective Date: 1 May 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#4f514d]">
          <Section title="1. Information We Collect">
            We may collect your name, email address, company information, account type, usage data, roleplay sessions, roleplay inputs and responses, candidate assessment information, performance scores, feedback, and analytics data.
          </Section>

          <Section title="2. How We Use Data">
            We use data to provide and improve the platform, generate AI roleplay responses and feedback, track learning and team performance, support hiring assessments, manage accounts, process subscriptions, and communicate with users.
          </Section>

          <Section title="3. Data Sharing">
            We do not sell user data. We may share limited data with trusted service providers such as hosting, authentication, analytics, payment, email, and AI infrastructure providers. We may also share data if required by law or to protect the platform.
          </Section>

          <Section title="4. Data Storage & Security">
            Data is stored using secure, industry-standard infrastructure. We take reasonable steps to protect your information, but no digital system can be guaranteed to be completely secure.
          </Section>

          <Section title="5. User Rights">
            You may request access to your data, request correction or deletion of your data, and opt out of non-essential communications where applicable.
          </Section>

          <Section title="6. AI & Data Processing">
            Your inputs may be processed by AI systems to generate roleplay responses, training feedback, performance summaries, and candidate assessment reports. Data is used to provide Genim services and is not sold.
          </Section>

          <Section title="7. Retention">
            We retain data for as long as necessary to provide the service, comply with legal obligations, resolve disputes, support billing, and maintain business records.
          </Section>

          <Section title="8. Changes">
            We may update this Privacy Policy periodically. Continued use of Genim after changes means you accept the updated policy.
          </Section>

          <Section title="9. Contact">
            For privacy questions, contact us at{' '}
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