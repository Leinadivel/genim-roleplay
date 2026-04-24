import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RequestSeatsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) redirect('/team')

  return (
    <main className="min-h-screen bg-[#f7f3ee] p-6">
      <div className="mx-auto max-w-[600px] rounded-[28px] border bg-white p-8">
        <h1 className="text-2xl text-[#1f1f1c] outline-none font-semibold">Request more seats</h1>
        <p className="mt-3 text-sm text-[#5f625d]">
          Request additional seats for your team. Genim will review and send an updated invoice.
        </p>

        <form
          action="/api/team/request-seats"
          method="post"
          className="mt-6 space-y-6"
        >
          <input type="hidden" name="companyId" value={membership.company_id} />

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1c]">
              Number of seats needed
            </label>
            <input
              name="seats"
              type="number"
              required
              min="1"
              placeholder="e.g. 10"
              className="mt-2 w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1c]">
              Note (optional)
            </label>
            <textarea
              name="note"
              placeholder="Tell Genim why you need more seats (optional)"
              className="mt-2 w-full rounded-2xl border border-[#ddd4ca] bg-[#fcfaf8] px-4 py-4 text-sm text-[#1f1f1c] outline-none placeholder:text-[#9a9c97]"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white hover:opacity-95"
          >
            Submit request
          </button>
        </form>
      </div>
    </main>
  )
}