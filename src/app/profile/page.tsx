import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Edit3,
  Mail,
  Shield,
  Trash2,
  UserRound,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteAccountButton from './delete-account-button'

function formatDate(value: string | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatRole(value: string | null) {
  if (!value) return 'User'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, account_type, role, status, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: company } = membership?.company_id
    ? await supabase
        .from('companies')
        .select('id, name')
        .eq('id', membership.company_id)
        .maybeSingle()
    : { data: null }

  const backHref = membership?.company_id ? '/team' : '/scenarios'

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-8 text-[#1f1f1c] md:px-6">
      <div className="mx-auto max-w-[920px] space-y-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium text-[#2b2c2a] shadow-sm hover:bg-[#faf7f3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_50px_rgba(25,25,20,0.06)]">
          <div className="bg-[linear-gradient(135deg,#f7ede6_0%,#eef5f0_100%)] px-6 py-8 md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1f4d38] text-2xl font-semibold text-white shadow-[0_12px_30px_rgba(31,77,56,0.18)]">
                  {(profile?.full_name?.[0] || profile?.email?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7d7f7a]">
                    Your profile
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
                    {profile?.full_name || 'Unnamed user'}
                  </h1>
                  <p className="mt-1 text-sm text-[#666864]">
                    Manage your Genim account details.
                  </p>
                </div>
              </div>

              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
              >
                <Edit3 className="h-4 w-4" />
                Edit profile
              </Link>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
            <InfoCard
              icon={<UserRound className="h-5 w-5" />}
              label="Full name"
              value={profile?.full_name || 'Not set'}
            />

            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value={profile?.email || user.email || 'No email'}
            />

            <InfoCard
              icon={<Shield className="h-5 w-5" />}
              label="Role"
              value={formatRole(membership?.role || profile?.role || null)}
            />

            <InfoCard
              icon={<Building2 className="h-5 w-5" />}
              label="Workspace"
              value={company?.name || 'Individual account'}
            />

            <InfoCard
              icon={<Shield className="h-5 w-5" />}
              label="Status"
              value={profile?.status || membership?.status || 'active'}
            />

            <InfoCard
              icon={<UserRound className="h-5 w-5" />}
              label="Joined"
              value={formatDate(profile?.created_at ?? null)}
            />
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(25,25,20,0.05)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <Trash2 className="h-4 w-4" />
                Danger zone
              </div>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#666864]">
                Deleting your account removes access to Genim. This action should
                only be used when you are sure.
              </p>
            </div>

            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </main>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[22px] bg-[#faf8f5] p-5 ring-1 ring-[#eee6dc]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#8a8d87]">
        <span className="text-[#d6612d]">{icon}</span>
        {label}
      </div>
      <div className="mt-3 break-words text-base font-semibold text-[#171714]">
        {value}
      </div>
    </div>
  )
}