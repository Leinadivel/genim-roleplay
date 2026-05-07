export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-12 text-[#1f1f1c]">
      <div className="mx-auto max-w-[900px] rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(25,25,20,0.06)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Legal
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
          Genim Terms of Service
        </h1>

        <p className="mt-2 text-sm text-[#666864]">
          Effective Date: 1 May 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#4f514d]">
          <Section title="1. Overview">
            Genim (“we”, “our”, “us”) provides an AI-powered sales roleplay and training platform designed to help individuals, candidates, managers, and teams improve sales performance. By accessing or using Genim, you agree to these Terms.
          </Section>

          <Section title="2. Use of the Platform">
            You agree to use Genim only for lawful business, training, hiring, or personal development purposes. You must not misuse, copy, resell, reverse engineer, disrupt, or attempt to gain unauthorized access to the platform. You must not use Genim to create harmful, abusive, discriminatory, misleading, or illegal content.
          </Section>

          <Section title="3. Accounts">
            You are responsible for your account, login credentials, team access, and activity under your account. You must provide accurate information. We may suspend or restrict accounts that violate these Terms or misuse the platform.
          </Section>

          <Section title="4. Payments & Subscriptions">
            Paid plans may be billed monthly, annually, or by invoice depending on the selected plan. Payments are non-refundable unless expressly stated otherwise. We may change pricing with prior notice. Access to paid team features may be restricted if payment is overdue, cancelled, expired, or incomplete.
          </Section>

          <Section title="5. Intellectual Property">
            Genim owns all rights to the platform, software, technology, design, workflows, and platform content. You retain ownership of your input data. You grant Genim permission to process your data only as needed to provide, secure, support, and improve the service.
          </Section>

          <Section title="6. Data & AI Usage">
            Genim processes user inputs, roleplay conversations, assessment data, and performance information to generate roleplay responses, feedback, scoring, and analytics. We do not use customer data to train external AI models without consent. Users are responsible for the content they input into the platform.
          </Section>

          <Section title="7. Hiring Assessment Disclaimer">
            Genim provides tools to assist companies in evaluating candidates through simulated roleplay assessments. Genim does not guarantee hiring outcomes, candidate suitability, employee performance, or business results. Hiring decisions remain the responsibility of the company or hiring team.
          </Section>

          <Section title="8. Limitation of Liability">
            Genim is provided “as is.” To the maximum extent permitted by law, we are not liable for lost revenue, lost profits, hiring decisions, business outcomes, indirect damages, or reliance on AI-generated feedback.
          </Section>

          <Section title="9. Termination">
            We may suspend, restrict, or terminate access if these Terms are violated, if payment is not completed, or if platform misuse is detected.
          </Section>

          <Section title="10. Changes">
            We may update these Terms from time to time. Continued use of Genim after changes means you accept the updated Terms.
          </Section>

          <Section title="11. Contact">
            For questions, contact us at{' '}
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