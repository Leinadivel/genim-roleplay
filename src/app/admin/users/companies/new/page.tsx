import Link from 'next/link'
import { ArrowLeft, Building2, PlusCircle } from 'lucide-react'

export default function AdminCreateCompanyPage() {
  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <div className="rounded-2xl border border-[#eee6dc] bg-white p-5 shadow-sm">
        <Link
          href="/admin/users/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#666864] hover:text-[#171714]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>

        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7ede6] text-[#d6612d]">
            <Building2 className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#171714]">
              Create company
            </h1>

            <p className="mt-2 max-w-[620px] text-sm leading-7 text-[#666864]">
              Create a new company workspace, assign an owner, and immediately
              onboard them into Genim.
            </p>
          </div>
        </div>
      </div>

      <form
        action="/api/admin/companies/create"
        method="post"
        className="rounded-2xl border border-[#eee6dc] bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Company name
            </label>

            <input
              type="text"
              name="companyName"
              required
              placeholder="Example: Acme Sales Inc"
              className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-4 text-sm outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Company slug
            </label>

            <input
              type="text"
              name="slug"
              required
              placeholder="acme-sales"
              className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-4 text-sm outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Owner full name
            </label>

            <input
              type="text"
              name="ownerName"
              required
              placeholder="John Doe"
              className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-4 text-sm outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7d7f7a]">
              Owner email
            </label>

            <input
              type="email"
              name="ownerEmail"
              required
              placeholder="john@company.com"
              className="w-full rounded-2xl border border-[#ddd4ca] bg-[#faf8f5] px-4 py-4 text-sm outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#ece4da] bg-[#faf8f5] p-5">
          <div className="text-sm font-semibold text-[#171714]">
            What happens next?
          </div>

          <div className="mt-3 space-y-2 text-sm leading-7 text-[#666864]">
            <div>• Company workspace will be created</div>
            <div>• Owner invite email will be sent</div>
            <div>• Owner becomes workspace owner automatically</div>
            <div>• You can grant pilot access immediately after creation</div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#d6612d] px-6 py-4 text-sm font-semibold text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Create company
        </button>
      </form>
    </div>
  )
}