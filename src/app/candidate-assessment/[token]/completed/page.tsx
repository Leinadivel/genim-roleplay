import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

type CandidateCompletedPageProps = {
  params: Promise<{
    token: string
  }>
}

export default async function CandidateCompletedPage({
  params,
}: CandidateCompletedPageProps) {
  const { token } = await params

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-10 text-[#1f1f1c] md:px-10">
      <div className="mx-auto max-w-[760px]">
        <div className="rounded-[32px] border border-[#e8ded3] bg-white px-8 py-10 text-center shadow-[0_18px_50px_rgba(28,28,20,0.05)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef5f0] text-[#1f4d38]">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#171714]">
            Assessment completed
          </h1>

          <p className="mt-4 text-base leading-8 text-[#5b5d59] md:text-lg">
            Your roleplay assessment has been submitted successfully. The hiring
            team can now review your performance and report.
          </p>

          <div className="mt-8">
            <Link
              href={`/candidate-assessment/${token}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-6 py-3 text-sm font-medium text-[#2b2c2a] hover:bg-[#faf7f3]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to assessment
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}