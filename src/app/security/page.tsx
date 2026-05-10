import { Database, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react'

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c]">
      <div className="mx-auto max-w-[1080px] space-y-6">
        <section className="rounded-[32px] bg-white p-8 shadow-[0_14px_45px_rgba(25,25,20,0.06)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d6612d]">
            Security
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#171714] md:text-5xl">
            Built with privacy, access control, and trust in mind.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#666864] md:text-base">
            Genim handles roleplays, company workspaces, candidate assessments,
            and performance data. We design the platform around secure access,
            responsible data handling, and clear user permissions.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <SecurityCard
            icon={LockKeyhole}
            title="Account protection"
            text="Users access Genim through authenticated accounts, protected login flows, and secure workspace permissions."
          />

          <SecurityCard
            icon={UserCheck}
            title="Role-based access"
            text="Owners, admins, managers, reps, and candidates have different access levels based on their role."
          />

          <SecurityCard
            icon={Database}
            title="Secure data storage"
            text="Platform data is stored using managed infrastructure, database policies, and protected environment variables."
          />

          <SecurityCard
            icon={ShieldCheck}
            title="Responsible AI handling"
            text="Roleplay inputs are processed to generate responses, feedback, scores, and reports. We do not sell customer data."
          />
        </section>

        <section className="rounded-[28px] bg-white p-8 shadow-[0_10px_32px_rgba(25,25,20,0.055)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
            Data and AI usage
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#666864]">
            Genim uses user inputs, roleplay conversations, transcripts, and
            session outcomes to provide the service, generate AI buyer
            responses, create feedback, and show team performance insights.
            Customer data is used to operate Genim and improve the user
            experience within the platform.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#666864]">
            For privacy questions or data requests, contact us at{' '}
            <a
              href="mailto:c@geniusnimble.com"
              className="font-semibold text-[#d6612d]"
            >
              c@geniusnimble.com
            </a>{' '}
            or{' '}
            <a
              href="mailto:daniel@geniusnimble.com"
              className="font-semibold text-[#d6612d]"
            >
              daniel@geniusnimble.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}

function SecurityCard({
  icon: Icon,
  title,
  text,
}: {
  icon: any
  title: string
  text: string
}) {
  return (
    <div className="rounded-[26px] bg-white p-6 shadow-[0_10px_32px_rgba(25,25,20,0.055)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#1f4d38]">
        <Icon className="h-5 w-5" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[#171714]">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-[#666864]">{text}</p>
    </div>
  )
}