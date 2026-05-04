import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

type PageProps = {
  params: Promise<{ id: string }>
}

type CompanyMemberRow = {
  id: string
  email: string | null
  user_id: string | null
  role: string
  status: string
  created_at: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function AdminCompanyDetailPage({ params }: PageProps) {
  const { id } = await params
  const adminClient = createAdminClient()

  const [
    { data: company },
    { data: subscription },
    { data: members },
  ] = await Promise.all([
    adminClient
      .from('companies')
      .select('id, name, slug, team_size, created_at')
      .eq('id', id)
      .maybeSingle(),

    adminClient
      .from('company_subscriptions')
      .select(
        'status, seat_limit, amount_due, currency, current_period_start, current_period_end'
      )
      .eq('company_id', id)
      .maybeSingle(),

    adminClient
      .from('company_members')
      .select('id, email, user_id, role, status, created_at')
      .eq('company_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!company) {
    redirect('/admin/users/companies')
  }

  const typedMembers = (members ?? []) as CompanyMemberRow[]

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <Link
          href="/admin/users/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#666864] hover:text-[#171714]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#7d7f7a]">
              <Building2 className="h-4 w-4" />
              Company profile
            </div>

            <h1 className="mt-1 text-xl font-semibold text-[#171714]">
              {company.name}
            </h1>

            <p className="mt-1 text-sm text-[#666864]">
              Created {formatDate(company.created_at)}
            </p>
          </div>

          <Link
            href={`/admin/billing?companyId=${company.id}&seatLimit=${
              subscription?.seat_limit ?? company.team_size ?? ''
            }`}
            className="inline-flex items-center justify-center rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white"
          >
            Create invoice
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <form
          action="/api/admin/companies/update"
          method="post"
          className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="companyId" value={company.id} />

          <h2 className="text-sm font-semibold text-[#171714]">
            Company details
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Company name
              </label>
              <input
                name="name"
                defaultValue={company.name ?? ''}
                required
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Slug
              </label>
              <input
                name="slug"
                defaultValue={company.slug ?? ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Team size
              </label>
              <input
                type="number"
                name="teamSize"
                min="1"
                defaultValue={company.team_size ?? ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Subscription status
              </label>
              <select
                name="subscriptionStatus"
                defaultValue={subscription?.status ?? 'not_active'}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              >
                <option value="not_active">Not active</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Seat limit
              </label>
              <input
                type="number"
                name="seatLimit"
                min="1"
                defaultValue={subscription?.seat_limit ?? company.team_size ?? ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Amount due
              </label>
              <input
                type="number"
                name="amountDue"
                min="0"
                step="0.01"
                defaultValue={subscription?.amount_due ?? ''}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Currency
              </label>
              <input
                name="currency"
                defaultValue={subscription?.currency ?? 'usd'}
                className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
                Current period end
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
              Delete company
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#171714]">
              Subscription
            </h2>

            <div className="mt-4 space-y-3 text-sm text-[#666864]">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold text-[#171714]">
                  {subscription?.status ?? 'not active'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Seats</span>
                <span className="font-semibold text-[#171714]">
                  {subscription?.seat_limit ?? company.team_size ?? '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Amount</span>
                <span className="font-semibold text-[#171714]">
                  {subscription?.amount_due
                    ? `${subscription.currency ?? 'usd'} ${subscription.amount_due}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#f0d7c8] bg-[#fff7f2] p-5">
            <h3 className="text-sm font-semibold text-[#a2542f]">
              Careful action
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#765241]">
              Deleting a company may affect members, analytics, billing records,
              and team access. Only delete when you are sure.
            </p>
          </div>
        </aside>
      </div>

      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#171714]">Company members</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#faf8f5] text-xs uppercase tracking-[0.12em] text-[#7d7f7a]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f1e9e0]">
              {typedMembers.length > 0 ? (
                typedMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-4 text-[#1a1a17]">
                      {member.email || 'No email'}
                    </td>
                    <td className="px-4 py-4 capitalize">{member.role}</td>
                    <td className="px-4 py-4 capitalize">{member.status}</td>
                    <td className="px-4 py-4 text-[#666864]">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {member.user_id ? (
                        <Link
                          href={`/admin/users/${member.user_id}`}
                          className="inline-flex rounded-full bg-[#1f4d38] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Edit user
                        </Link>
                      ) : (
                        <span className="text-xs text-[#7d7f7a]">
                          Pending invite
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[#666864]"
                  >
                    No company members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}