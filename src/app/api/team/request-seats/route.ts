import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const formData = await req.formData()

  const companyId = String(formData.get('companyId') || '')
  const seats = Number(formData.get('seats'))
  const note = String(formData.get('note') || '')

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Basic validation (important)
  if (!companyId || !seats || seats < 1) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }

  const { error: insertError } = await supabase
    .from('company_seat_requests')
    .insert({
      company_id: companyId,
      requested_by: user.id,
      requested_seats: seats,
      note,
    })

  if (insertError) {
    console.error('Seat request insert failed:', insertError)

    return NextResponse.json(
      { error: insertError.message },
      { status: 400 }
    )
  }

  return NextResponse.redirect(new URL('/team?request_sent=1', req.url))
}