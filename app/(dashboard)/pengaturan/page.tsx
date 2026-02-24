'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import type { TokoInput } from '@/lib/validations'
import FormToko from '@/components/pengaturan/FormToko'
import StatusLangganan from '@/components/pengaturan/StatusLangganan'

export default function PengaturanPage() {
  const { store, setStore } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [defaultValues, setDefaultValues] = useState<TokoInput | null>(null)

  useEffect(() => {
    if (store) {
      setDefaultValues({
        nama: store.nama,
        alamat: store.alamat ?? '',
        telepon: store.telepon ?? '',
      })
    }
  }, [store])

  async function onSubmit(data: TokoInput) {
    if (!store) return
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data: updated, error: err } = await supabase
      .from('stores')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', store.id)
      .select()
      .single()

    if (err || !updated) {
      setError('Gagal menyimpan perubahan, coba lagi')
      setSaving(false)
      return
    }

    setStore(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!store || !defaultValues) return null

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Pengaturan</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Kelola informasi toko kamu</p>
      </div>

      <FormToko
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        saving={saving}
        saved={saved}
        error={error}
      />

      <StatusLangganan store={store} />
    </div>
  )
}