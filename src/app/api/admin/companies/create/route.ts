import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGenimAdmin } from '@/lib/genim-admin'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: Request) {
  const { user, admin } = await getGenimAdmin()

  if (!user || !admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()

  const name = String(formData.get('name') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const teamSize = String(formData.get('teamSize') || '').trim()

  if (!name) {
    return NextResponse.json(
      { error: 'Company name is required' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  const slug = rawSlug ? slugify(rawSlug) : slugify(name)

  const { error } = await adminClient.from('companies').insert({
    name,
    slug,
    team_size: teamSize || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(
    new URL('/admin/users?company_created=1', request.url),
    303
  )
}