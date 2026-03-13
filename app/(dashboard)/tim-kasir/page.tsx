'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Users, Plus, Mail, Trash2, Loader2, Crown, ShieldCheck, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import Link from 'next/link'

type Member = {
  id: string
  user_id: string
  nama: string
  role: 'owner' | 'kasir'
  is_active: boolean
  created_at: string
}

type Invitation = {
  id: string
  email: string
  status: string
  expires_at: string
  token: string
}

export default function KasirTeamPage() {
  const { store } = useActiveStore()
  const { isPro, hasProAccess } = useFreemium()
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [copiedToken, setCopiedToken] = useState('')

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

  useEffect(() => {
    if (store) fetchData()
  }, [store])

  async function fetchData() {
    const supabase = createClient()
    const db = supabase as any

    const [membersRes, invitationsRes] = await Promise.all([
      db.from('store_members').select('*').eq('store_id', store!.id).eq('is_active', true).order('created_at'),
      db.from('kasir_invitations').select('*').eq('store_id', store!.id).eq('status', 'pending').order('created_at', { ascending: false }),
    ])

    setMembers((membersRes.data ?? []) as Member[])
    setInvitations((invitationsRes.data ?? []) as Invitation[])
    setLoading(false)
  }

  async function handleInvite() {
    if (!email.trim() || !store) return
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Format email tidak valid'); return }

    setInviting(true)
    setError('')

    const supabase = createClient()
    const { data } = await (supabase as any).rpc('create_kasir_invitation', {
      p_store_id: store.id,
      p_email: email.trim(),
    })

    if (!data?.success) {
      setError(data?.message ?? 'Gagal membuat undangan')
    } else {
      setEmail('')
      fetchData()
    }
    setInviting(false)
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Hapus kasir ini?')) return
    const supabase = createClient()
    await (supabase as any).from('store_members').update({ is_active: false }).eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  async function handleCancelInvitation(invId: string) {
    const supabase = createClient()
    await (supabase as any).from('kasir_invitations').update({ status: 'expired' }).eq('id', invId)
    setInvitations(prev => prev.filter(i => i.id !== invId))
  }

  async function copyInviteLink(token: string) {
    await navigator.clipboard.writeText(`${APP_URL}/join?token=${token}`)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  if (!hasProAccess) return (
    <div className="p-6 max-w-2xl">
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-xl font-black text-white mb-2">Multi-User Kasir</h1>
        <p className="text-[#64748b] text-sm mb-6">Tambah akun kasir terpisah untuk karyawan kamu. Fitur ini hanya tersedia di PRO.</p>
        <Link href="/upgrade"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          Upgrade ke PRO
        </Link>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Tim Kasir</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Kelola akun kasir untuk karyawan toko</p>
      </div>

      {/* Invite form */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 mb-4">
        <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3">Undang Kasir Baru</div>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="email@kasir.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            className="flex-1 px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
          <button onClick={handleInvite} disabled={inviting || !email.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm disabled:opacity-50 transition-colors">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Undang
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <p className="text-[#3a4560] text-xs mt-2">Kasir akan mendapat link untuk join toko kamu. Maks. 5 kasir.</p>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 mb-4">
          <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3">Undangan Pending</div>
          <div className="space-y-2">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{inv.email}</div>
                    <div className="text-xs text-yellow-400">Menunggu konfirmasi</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => copyInviteLink(inv.token)}
                    className="p-1.5 rounded-lg bg-[#1e2333] border border-[#2a3045] hover:border-green-500/40 text-[#64748b] hover:text-green-400 transition-colors">
                    {copiedToken === inv.token ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleCancelInvitation(inv.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#64748b] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2a3045]">
          <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide">
            Anggota Tim ({members.length + 1})
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-green-400" />
          </div>
        ) : (
          <div className="divide-y divide-[#2a3045]">
            {/* Owner (selalu tampil) */}
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{store?.nama}</div>
                  <div className="text-xs text-green-400">Owner</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-400/10 text-green-400 border border-green-400/20">
                OWNER
              </span>
            </div>

            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1e2333] border border-[#2a3045] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#64748b]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{member.nama}</div>
                    <div className="text-xs text-[#64748b] capitalize">{member.role}</div>
                  </div>
                </div>
                <button onClick={() => handleRemoveMember(member.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#64748b] hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}