import { redirect } from 'next/navigation'
import { getGenimAdmin } from '@/lib/genim-admin'
import AdminShell from './admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, admin } = await getGenimAdmin()

  if (!user) redirect('/login')
  if (!admin) redirect('/scenarios')

  return <AdminShell>{children}</AdminShell>
}