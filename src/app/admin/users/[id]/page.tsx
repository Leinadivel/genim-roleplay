import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, LogOut } from 'lucide-react'
import { getGenimAdmin } from '@/lib/genim-admin'
import { createAdminClient } from '@/lib/supabase/admin'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminEditUserPage({ params }: PageProps) {
  const { id } = await params

  const { user, admin } = await getGenimAdmin()

  if (!user) redirect('/login')
  if (!admin) redirect('/scenarios')

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

    adminClient
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true }),

    adminClient
      .from('company_members')
      .select('company_id, role, status')
      .eq('user_id', id)
      .maybeSingle(),
  ])

  if (!profile) {
    redirect('/admin/users')
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1f1f1c]">
      <header className="border-b border-[#e6ddd2] bg-[#f7f3ee]">
        <div className="mx-auto flex max-w-[980px] items-center justify-between px-6 py-5">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>

          <form action="/auth/signout" method="post">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-4 py-2 text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-[980px] px-6 py-8">
        <div className="rounded-[32px] border border-[#e8ded3] bg-white p-6 shadow-[0_14px_40px_rgba(25,25,20,0.05)] md:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
            Edit user
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#171714]">
            {profile.full_name || 'Unnamed user'}
          </h1>

          <p className="mt-2 text-sm text-[#666864]">{profile.email}</p>

          <form
            action="/api/admin/users/update"
            method="post"
            className="mt-8 space-y-5"
          >
            <input type="hidden" name="userId" value={profile.id} />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full name
                </label>
                <input
                  name="fullName"
                  defaultValue={profile.full_name ?? ''}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>
                <select
                  name="role"
                  defaultValue={membership?.role ?? profile.role ?? 'rep'}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                >
                  <option value="rep">Rep</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account type
                </label>
                <select
                  name="accountType"
                  defaultValue={profile.account_type ?? 'individual'}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select
                  name="status"
                  defaultValue={profile.status ?? 'active'}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Plan</label>
                <select
                  name="planKey"
                  defaultValue={subscription?.plan_key ?? 'starter'}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                >
                  <option value="starter">Starter</option>
                  <option value="pro_monthly">Pro monthly</option>
                  <option value="pro_yearly">Pro yearly</option>
                  <option value="advanced_monthly">Advanced monthly</option>
                  <option value="advanced_yearly">Advanced yearly</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Company</label>
                <select
                  name="companyId"
                  defaultValue={membership?.company_id ?? ''}
                  className="w-full rounded-2xl border border-[#ddd4ca] bg-white px-4 py-3 text-sm"
                >
                  <option value="">No company</option>
                  {(companies ?? []).map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#eee5db] pt-6 sm:flex-row">
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
        </div>
      </section>
    </main>
  )
}