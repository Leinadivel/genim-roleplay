import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlusCircle } from 'lucide-react'

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
    <div className="mx-auto max-w-[720px] space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8d87]">
          Seat request
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#171714]">
          Request more seats
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#666864]">
          Ask Genim to increase your team capacity. We will review the request and send an updated invoice.
        </p>
      </div>

      <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(25,25,20,0.06)]">
        <form
          action="/api/team/request-seats"
          method="post"
          className="space-y-5"
        >
          <input type="hidden" name="companyId" value={membership.company_id} />

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555854]">
              Number of seats needed
            </label>
            <input
              name="seats"
              type="number"
              required
              min="1"
              placeholder="Example: 10"
              className="h-[46px] w-full rounded-[16px] bg-[#faf8f5] px-4 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] placeholder:text-[#9a9c97] focus:bg-white focus:ring-[#d6612d]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555854]">
              Note
              <span className="ml-1 font-normal text-[#8a8d87]">(optional)</span>
            </label>
            <textarea
              name="note"
              rows={4}
              placeholder="Tell Genim why you need more seats."
              className="w-full resize-none rounded-[16px] bg-[#faf8f5] px-4 py-3 text-sm text-[#1f1f1c] outline-none ring-1 ring-[#eee6dc] placeholder:text-[#9a9c97] focus:bg-white focus:ring-[#d6612d]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d6612d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            <PlusCircle className="h-4 w-4" />
            Submit request
          </button>
        </form>
      </div>
    </div>
  )
}