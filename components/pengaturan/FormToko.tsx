'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { tokoSchema, type TokoInput } from '@/lib/validations'

type Props = {
  defaultValues: TokoInput
  onSubmit: (data: TokoInput) => Promise<void>
  saving: boolean
  saved: boolean
  error: string
}

function Field({ name, label, placeholder, register, errors }: {
  name: keyof TokoInput
  label: string
  placeholder?: string
  register: ReturnType<typeof useForm<TokoInput>>['register']
  errors: ReturnType<typeof useForm<TokoInput>>['formState']['errors']
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">{label}</label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
          errors[name] ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/40'
        }`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
    </div>
  )
}

export default function FormToko({ defaultValues, onSubmit, saving, saved, error }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<TokoInput>({
    resolver: zodResolver(tokoSchema),
    defaultValues,
  })

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6 mb-5">
      <h2 className="font-bold text-sm mb-4">Informasi Toko</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field name="nama" label="Nama Toko" placeholder="Warung Berkah Jaya" register={register} errors={errors} />
        <Field name="alamat" label="Alamat (Opsional)" placeholder="Jl. Merdeka No. 1" register={register} errors={errors} />
        <Field name="telepon" label="No. HP Toko (Opsional)" placeholder="08xxxxxxxxxx" register={register} errors={errors} />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-all disabled:opacity-50">
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            : saved
              ? '✓ Tersimpan!'
              : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
        </button>
      </form>
    </div>
  )
}