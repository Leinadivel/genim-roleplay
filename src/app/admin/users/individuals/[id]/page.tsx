import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserCog } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function AdminEditUserPage({ params }: PageProps) {
  const { id } = await params
  const adminClient = createAdminClient()

  const [
    { data: profile },
    { data: subscription },
    { data: companies },
    { data: membership },
  ] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, email, full_name, account_type, role, status, created_at')
      .eq('id', id)
      .maybeSingle(),

    adminClient
      .from('subscriptions')
      .select('plan_key, status, current_period_end')
      .eq('user_id', id)
      .maybeSingle(),

    adminClient.from('companies').select('id, name').order('name'),

    adminClient
      .from('company_members')
      .select('company_id, role, status')
      .eq('user_id', id)
      .maybeSingle(),
  ])

  if (!profile) {
    redirect('/admin/users/individuals')
  }

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <Link
          href="/admin/users/individuals"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#666864] hover:text-[#171714]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to individuals
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#7d7f7a]">
              <UserCog className="h-4 w-4" />
              User profile
            </div>

            <h1 className="mt-1 text-xl font-semibold text-[#171714]">
              {profile.full_name || 'Unnamed user'}
            </h1>

            <p className="mt-1 text-sm text-[#666864]">
              {profile.email || 'No email'} · Joined {formatDate(profile.created_at)}
            </p>
          </div>

          <div className="rounded-full border border-[#d7e6dc] bg-[#eef5f0] px-4 py-2 text-xs font-semibold text-[#1f4d38]">
            {subscription?.plan_key || 'starter'}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <form
          action="/api/admin/users/update"
          method="post"
          className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="userId" value={profile.id} />

          <h2 className="text-sm font-semibold text-[#171714]">
            Account details
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Full name
              </label>
              <input
                name="fullName"
                defaultValue={profile.full_name ?? ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Email
              </label>
              <input
                value={profile.email ?? ''}
                disabled
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#f1eee9] px-4 py-3 text-sm text-[#777a75]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Role
              </label>
              <select
                name="role"
                defaultValue={membership?.role ?? profile.role ?? 'rep'}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="rep">Rep</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Account type
              </label>
              <select
                name="accountType"
                defaultValue={profile.account_type ?? 'individual'}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Status
              </label>
              <select
                name="status"
                defaultValue={profile.status ?? 'active'}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Plan
              </label>
              <select
                name="planKey"
                defaultValue={subscription?.plan_key ?? 'starter'}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="starter">Starter</option>
                <option value="pro_monthly">Pro monthly</option>
                <option value="pro_yearly">Pro yearly</option>
                <option value="advanced_monthly">Advanced monthly</option>
                <option value="advanced_yearly">Advanced yearly</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Company
              </label>
              <select
                name="companyId"
                defaultValue={membership?.company_id ?? ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="">No company</option>
                {(companies ?? []).map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Plan expires
              </label>
              <input
                type="date"
                name="currentPeriodEnd"
                defaultValue={
                  subscription?.current_period_end
                    ? subscription.current_period_end.slice(0, 10)
                    : ''
                }
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#eee5db] pt-5 sm:flex-row">
            <button
              name="intent"
              value="save"
              className="inline-flex justify-center rounded-full bg-[#1f4d38] px-6 py-3 text-sm font-semibold text-white"
            >
              Save changes
            </button>

            <button
              name="intent"
              value="delete"
              className="inline-flex justify-center rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700"
            >
              Delete user
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#171714]">
              Current access
            </h2>

            <div className="mt-4 space-y-3 text-sm text-[#666864]">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold text-[#171714]">
                  {profile.status || 'active'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-semibold text-[#171714]">
                  {subscription?.plan_key || 'starter'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Subscription</span>
                <span className="font-semibold text-[#171714]">
                  {subscription?.status || '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Company role</span>
                <span className="font-semibold text-[#171714]">
                  {membership?.role || '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#f0d7c8] bg-[#fff7f2] p-5">
            <h3 className="text-sm font-semibold text-[#a2542f]">
              Careful action
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#765241]">
              Deleting a user can affect their sessions, reports, analytics, and
              team membership. Use inactive status when you only want to block access.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}