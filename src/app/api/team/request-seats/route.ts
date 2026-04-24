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
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  await supabase.from('company_seat_requests').insert({
    company_id: companyId,
    requested_by: user.id,
    requested_seats: seats,
    note,
  })

  return NextResponse.redirect(new URL('/team?request_sent=1', req.url))
}