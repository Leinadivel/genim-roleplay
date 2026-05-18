import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

    const adminClient = createAdminClient()

    await adminClient
      .from('profiles')
      .update({
        status: 'deleted',
        full_name: 'Deleted user',
      })
      .eq('id', user.id)

    await adminClient
      .from('company_members')
      .update({
        status: 'deleted',
      })
      .eq('user_id', user.id)

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id
    )

    if (deleteUserError) {
      return NextResponse.redirect(
        new URL(
          `/profile?delete_error=${encodeURIComponent(deleteUserError.message)}`,
          req.url
        )
      )
    }

    await supabase.auth.signOut()

    return NextResponse.redirect(new URL('/login?account_deleted=1', req.url))
  } catch (err) {
    return NextResponse.redirect(
      new URL(
        `/profile?delete_error=${encodeURIComponent(
          err instanceof Error ? err.message : 'Failed to delete account'
        )}`,
        req.url
      )
    )
  }
}