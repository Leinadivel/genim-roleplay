export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-12 text-[#1f1f1c]">
      <div className="mx-auto max-w-[900px] rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(25,25,20,0.06)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8d87]">
          Legal
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
          Genim Cookie Policy
        </h1>

        <p className="mt-2 text-sm text-[#666864]">
          Effective Date: 1 May 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#4f514d]">
          <Section title="1. What Cookies Are">
            Cookies are small files stored on your device that help websites remember information, keep users signed in, and improve the user experience.
          </Section>

          <Section title="2. How Genim Uses Cookies">
            Genim may use cookies and similar technologies for authentication, security, session management, analytics, performance monitoring, and product improvement.
          </Section>

          <Section title="3. Types of Cookies">
            We may use essential cookies for login and security, analytics cookies to understand platform usage, and preference cookies to remember user settings.
          </Section>

          <Section title="4. Managing Cookies">
            You can control or disable cookies through your browser settings. Some parts of Genim may not work properly if essential cookies are disabled.
          </Section>

          <Section title="5. Contact">
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