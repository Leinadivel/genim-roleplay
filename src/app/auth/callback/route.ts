import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/post-login'

  const supabase = await createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | 'signup'
        | 'invite'
        | 'recovery'
        | 'email_change'
        | 'email',
    })

    if (!error) {
      if (type === 'invite' || type === 'recovery') {
        return NextResponse.redirect(
          new URL('/set-password', requestUrl.origin)
        )
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}