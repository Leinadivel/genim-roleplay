import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(request: Request) {
  try {
    const { user, admin } = await getGenimAdmin()

    if (!user || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()

    const companyName = String(
      formData.get('companyName') || ''
    ).trim()

    const slugInput = String(formData.get('slug') || '').trim()

    const slug = slugify(slugInput)

    const ownerName = String(
      formData.get('ownerName') || ''
    ).trim()

    const ownerEmail = String(
      formData.get('ownerEmail') || ''
    )
      .trim()
      .toLowerCase()

    if (!companyName || !slug || !ownerEmail || !ownerName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    const { data: existingCompany } = await adminClient
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .insert({
        name: companyName,
        slug,
        team_size: 3,
      })
      .select('id')
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: companyError?.message || 'Failed to create company' },
        { status: 400 }
      )
    }

    const redirectTo = `${getBaseUrl()}/auth/callback?next=/post-login`

    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(ownerEmail, {
        redirectTo,
        data: {
          full_name: ownerName,
          company_id: company.id,
          role: 'owner',
        },
      })

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      )
    }

    const invitedUserId = inviteData.user?.id || null

    const { error: memberError } = await adminClient
      .from('company_members')
      .insert({
        company_id: company.id,
        user_id: invitedUserId,
        email: ownerEmail,
        role: 'owner',
        status: invitedUserId ? 'active' : 'invited',
      })

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      redirectTo: `/admin/companies/${company.id}`,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Something went wrong',
      },
      { status: 500 }
    )
  }
}