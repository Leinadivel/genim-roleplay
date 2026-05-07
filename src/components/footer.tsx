import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#eee6dc] bg-[#faf8f5]">
      <div className="mx-auto max-w-[1180px] px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          
          <div>
            <div className="text-2xl font-semibold text-[#171714]">
              Genim
            </div>
            <div className="mt-1 text-xs text-[#777a75]">
              AI-powered sales roleplay training for modern teams.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-l font-medium text-[#666864]">
            <Link href="/terms" className="hover:text-[#171714]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#171714]">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-[#171714]">
              Cookies
            </Link>
            <Link href="/refund-policy" className="hover:text-[#171714]">
              Refunds
            </Link>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-[#eee6dc] pt-4 text-xs text-[#8a8d87] md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} Genim. All rights reserved.
          </div>

          <div>
            Built for high-performance sales teams.
          </div>
        </div>
      </div>
    </footer>
  )
}