'use client'

import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your Genim account? This action cannot be undone.'
    )

    if (!confirmed) return

    const secondConfirm = window.confirm(
      'Final confirmation: deleting your account will remove your access to Genim.'
    )

    if (!secondConfirm) return

    setLoading(true)

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/profile/delete'
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete account
    </button>
  )
}