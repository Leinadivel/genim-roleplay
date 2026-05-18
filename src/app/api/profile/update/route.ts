import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const formData = await req.formData()
    const fullName = normalizeText(formData.get('fullName'))

    if (!fullName) {
      return NextResponse.redirect(new URL('/profile/edit?error=name', req.url))
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
      })
      .eq('id', user.id)

    if (profileError) {
      return NextResponse.redirect(
        new URL(`/profile/edit?error=${encodeURIComponent(profileError.message)}`, req.url)
      )
    }

    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    })

    return NextResponse.redirect(new URL('/profile?updated=1', req.url))
  } catch (err) {
    return NextResponse.redirect(
      new URL(
        `/profile/edit?error=${encodeURIComponent(
          err instanceof Error ? err.message : 'Failed to update profile'
        )}`,
        req.url
      )
    )
  }
}